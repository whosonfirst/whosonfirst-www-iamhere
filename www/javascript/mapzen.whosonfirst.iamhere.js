var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iamhere = (function(){

		var _scenefile = '/tangram/refill.yaml';

		var map;
		var current_layers = {};
		var _placetypes = [];

		var self = {
			
			'init': function(){

				var s = mapzen.whosonfirst.iamhere.scenefile()
				mapzen.whosonfirst.leaflet.tangram.scenefile(s);

				// TO DO (20151214/thisisaaronland)

				// 1. Just finish this:
				// https://github.com/whosonfirst/p5-Whosonfirst-MaxMind-Writer
				// See also:
				// https://github.com/whosonfirst/whosonfirst-www-iamhere/issues/1

				// 2. In the interim just run this:
				// https://github.com/oschwald/maxminddb-golang
				// and do the concordance dance

				
				var swlat = 37.70120736474139;
				var swlon = -122.68707275390624;
				var nelat = 37.80924146650164;
				var nelon = -122.21912384033203;

				map = mapzen.whosonfirst.leaflet.tangram.map_with_bbox('map', swlat, swlon, nelat, nelon);
				
				L.hash(map);

				map.on('load', function(e){
						self.update_location();
					});
				
				map.on('zoomend', function(e){
						self.update_location();
					});
				
				map.on('move', function(e){
						self.update_location();
					});
				
				map.on('dragend', function(e){
						self.reverse_geocode();
					});

				if (mapzen.whosonfirst.pelias.endpoint()){

					if (mapzen.whosonfirst.pelias.apikey()){
						var find = document.getElementById("find");
						find.onclick = self.search;

						var search = document.getElementById("search");
						search.style.cssText = "display:inline;";
					}

					else {
						mapzen.whosonfirst.feedback.warning("Search is disabled because no API key has been defined");
					}
				}

				else {
					mapzen.whosonfirst.feedback.warning("Search is disabled because no API endpoint has been defined");
				}

				if (mapzen.whosonfirst.pip.endpoint()){
					var findme = document.getElementById("findme");
					findme.style.cssText = "display:inline !important;";
					findme.onclick = self.geolocate;
				}

				else {
					mapzen.whosonfirst.feedback.warning("Reverse geocoding is disabled because no API endpoint has been defined");
				}
				
				if (mapzen.whosonfirst.iplookup.endpoint()){
					var ip = undefined;	// this is mostly here for setting by hand while debugging...
					// var ip = '142.213.160.134';

					if ((! ip) && (self.is_localhost(location.host))){
						mapzen.whosonfirst.log.error("IP lookups disabled because this is localhost");
					}

					else {
						mapzen.whosonfirst.iamhere.iplookup(ip);
					}
				}

				window.onresize = self.draw_crosshairs;

				window.ononline = self.on_online;
				window.onoffline = self.on_offline;

				if (navigator.onLine){
					self.on_online();
				}

				else {
					self.on_offline();
				}

				self.draw_crosshairs();
				self.update_location();

				// sudo put me in a function or helper library?
				// (20160216/thisisaaronland)

				var hash = location.hash;
				var match = hash.match(/^\#\d+\/(-?\d+(?:\.\d+))?\/(-?\d+(?:\.\d+))?/)

				var lat = null;
				var lon = null;

				if (match){
					lat = match[1];
					lon = match[2];
				}

				self.reverse_geocode(lat, lon);
				
			},

			'on_online': function(){

				mapzen.whosonfirst.feedback.info("you are in online mode");

				var q = document.getElementById("q");
				q.setAttribute("placeholder", "search for a place");
				q.removeAttribute("disabled");
				q.value = "";

				var f = document.getElementById("find");
				f.removeAttribute("disabled");

				var fm = document.getElementById("findme");
				fm.style.cssText = "display:inline;color:#2E78A8"
			},

			'on_offline': function(){

				mapzen.whosonfirst.feedback.info("you are in offline mode");

				var pelias = mapzen.whosonfirst.pelias.endpoint();

				if (! self.is_localhost(pelias)){

					var q = document.getElementById("q");
					q.setAttribute("placeholder", "search is disabled");
					q.setAttribute("disabled", "disabled");
					q.value = "";

					var f = document.getElementById("find");
					f.style.cssText = "display:none;"
					f.setAttribute("disabled", "disabled");
				}

				var fm = document.getElementById("findme");
				fm.style.cssText = "display:inline;color:#bbb"
			},
			
			'is_localhost': function(url){

				// please not like this...
				// basically everything about this is wrong...
				// please fix me... please... ?

				var parts = url.split(":");

				if (parts[0] == "localhost"){
					return true;
				}

				if (parts[1] == "//localhost"){
					return true;
				}

				return false;
			},
			
			'geolocate': function(){

				if (! navigator.onLine){
					mapzen.whosonfirst.feedback.alert("Unable to lookup your location because you are offline");
					return false;
				}

				var ts = mapzen.whosonfirst.feedback.persist("Looking up your location");

				var update_feedback = function(){
					mapzen.whosonfirst.feedback.remove(ts);
				};
				
				var on_locate = function(pos){

					update_feedback();

					var lat = pos.coords.latitude;
					var lon = pos.coords.longitude;
					self.jump_to_point(lat, lon, 16);					
				};

				var on_error = function(rsp){

					update_feedback();
				};

				navigator.geolocation.getCurrentPosition(on_locate, on_error);

			},

			'iplookup': function(ip){

				var on_lookup = function(rsp){

					mapzen.whosonfirst.log.info("IP lookup for " + rsp['ip'] + " is: " + rsp['wofid']);
					
					wofid = rsp['wofid'];
					var url = mapzen.whosonfirst.data.id2abspath(wofid);

					mapzen.whosonfirst.net.fetch(url, on_fetch, on_notfetch);
				};

				var on_notlookup = function(rsp){
					mapzen.whosonfirst.log.error("failed to lookup IP address");
				};

				var on_fetch = function(feature){

					/* This works but we need to be smarter about what kind of place
					   type we're returning and how things are zoomed out etc
					   (20160105/thisisaaronland)
					*/

					var bbox = mapzen.whosonfirst.geojson.derive_bbox(feature);

					var sw = [ bbox[1], bbox[0] ];
					var ne = [ bbox[3], bbox[2] ];

					self.jump_to_bbox(sw, ne);

				};

				var on_notfetch = function(rsp){
					mapzen.whosonfirst.log.error("failed to fetch record for IP address");					
				};

				mapzen.whosonfirst.iplookup.lookup(ip, on_lookup, on_notlookup);
			},
			
			'search': function(){

				var e = mapzen.whosonfirst.pelias.endpoint();

				if ((! navigator.onLine) && (! self.is_localhost(e))){
					mapzen.whosonfirst.feedback.alert("Unable to perform your search query because you seem to be offline");
					return false;
				}

				var q = document.getElementById("q");
				q = q.value
				
				if (q == ""){
					mapzen.whosonfirst.feedback.alert("You forgot to say what you're searching for...");
					return false;
				}

				self.geocode(q);
				return false;
			},

			'geocode': function(q){

				var enc_q = mapzen.whosonfirst.php.htmlspecialchars(q);
				var ts = mapzen.whosonfirst.feedback.persist("searching for " + enc_q);

				var update_feedback = function(){
					mapzen.whosonfirst.feedback.remove(ts);
				}

				var on_success = function(rsp){
					self.on_geocode(rsp);
				};

				var on_fail = function(){

				};
				
				mapzen.whosonfirst.pelias.search(q, on_success, on_fail);
			},

			'on_geocode': function(rsp){

				var features = rsp['features'];
				var first = features[0];
				
				var geom = first['geometry'];
				var coords = geom['coordinates'];
				
				var lat = coords[1];
				var lon = coords[0];
				
				self.jump_to_point(lat, lon, 12);
				
				/*
				  var bbox = rsp['bbox'];
				  map.fitBounds([[bbox[1], bbox[0]], [ bbox[3], bbox[2] ]]);
				*/
				
				// please to write a generic put dots on the map thingy
				
				/*
				  var features = rsp['features'];
				  var count = features.length;
				  
				  for (var i=0; i < count; i++){
				  var feature = features[i];
				  }
				*/
			},

			'reverse_geocode': function(lat, lon){

				var e = mapzen.whosonfirst.pip.endpoint();

				if ((! navigator.onLine) && (! self.is_localhost(e))){
					mapzen.whosonfirst.feedback.alert("Reverse geocoding is disabled because you are offline");
					return false;
				}

				if ((! lat) || (! lon)){
					var ll = map.getCenter();
					lat = ll.lat;
					lon = ll.lng;
				}

				var on_success = function(rsp){
					self.on_reverse_geocode(rsp);
				};

				var on_fail = function(rsp){
					var el = document.getElementById("whereami-reversegeo");
					el.style.cssText = "display:inline !important;";
					el.innerHTML = "the land of INVISIBLE ERROR CAT because the reverse geocoding failed";
				};

				var placetypes = self.placetypes();
				var count = placetypes.length;

				// see also:
				// https://github.com/whosonfirst/go-whosonfirst-pip/issues/22

				if (count == 0){
					mapzen.whosonfirst.pip.get_by_latlon(lat, lon, null, on_success, on_fail);
				}

				// this is a BAD BAD DUMB way to do it and fraught with weirdness.
				// see notes in mapzen.whosonfirst.config.js.example for details.
				// we're leaving this here for now in case someone needs to throw
				// caution to the wind...
				// (20160217/thisisaaronland)

				else {
					for (var i=0; i < count; i++){
						var pt = placetypes[i];
						mapzen.whosonfirst.pip.get_by_latlon(lat, lon, pt, on_success, on_fail);
					}
				}

				var el = document.getElementById("whereami-reversegeo");
				el.style.cssText = "display:none !important;";
				el.innerHTML = "";
			},

			'on_reverse_geocode': function(possible){

				var count_possible = possible.length;
				var count_current = current_layers.length;

				mapzen.whosonfirst.log.info("reverse geocode possible results: " + count_possible);

				var to_keep = {}
				
				for (var i=0; i < count_possible; i++){
					
					var loc = possible[i];
					var wofid = loc['Id'];
					
					if (current_layers[wofid]){
						to_keep[wofid] = 1;
					}
				}

				for (var wofid in current_layers){
					
					if (to_keep[wofid]){
						continue;
					}
					
					mapzen.whosonfirst.log.debug("remove layer for WOF ID " + wofid);

					var layer = current_layers[wofid];
					delete(current_layers[wofid]);

					map.removeLayer(layer);
				}
				
				var li = document.getElementById("whereami-reversegeo");
				li.style.cssText = "display:inline !important;";

				if (! count_possible){
					li.innerHTML = "a place we don't know about";
					return;
				}
				
				var count = possible.length;
				var where = [];
	
				for (var i=0; i < count; i++){
					
					var loc = possible[i];
					var wofid = loc['Id'];
					var name = loc['Name'];

					var enc_id  = encodeURIComponent(wofid);
					var enc_name = mapzen.whosonfirst.php.htmlspecialchars(name);

					var link = '<a href="https://whosonfirst.mapzen.com/spelunker/id/' + enc_id + '/">';
					link += enc_name
					link += '</a>';

					where.push(link);
					
					if (current_layers[wofid]){
						continue;
					}
					
					var on_fetch = function(feature){
						
						var props = feature['properties'];
						var wofid = props['wof:id'];
						var name = props['wof:name'];

						feature['properties']['lflt:label_text'] = name;

						mapzen.whosonfirst.log.debug("draw layer for WOF ID " + wofid);
						
						var style = mapzen.whosonfirst.leaflet.styles.pip_polygon();
						//style['weight'] = i;

						var layer = mapzen.whosonfirst.leaflet.draw_poly(map, feature, style);
						
						current_layers[ wofid ] = layer;
					};
					
					mapzen.whosonfirst.log.debug("fetch layer for WOF ID " + wofid);

					mapzen.whosonfirst.enmapify.render_id(map, wofid, on_fetch);
				}

				// note: we are escaping things above
				where = where.join(" or ");
				
				li.innerHTML = where;
			},

			'jump_to_point': function(lat, lon, zoom){
				map.setView([lat, lon], zoom);
				self.update_location();
				self.reverse_geocode();
			},

			'jump_to_bbox': function(sw, ne){
				map.fitBounds([sw, ne ]);

				self.update_location();
				self.reverse_geocode();
			},
			
			'update_location': function(){

				var ll = map.getCenter();
				var lat = ll.lat;
				var lon = ll.lng;
				
				lat = lat.toFixed(6);
				lon = lon.toFixed(6);
				
				var pos = lat + "," + lon;
				pos = mapzen.whosonfirst.php.htmlspecialchars(pos);
				
				var li = document.getElementById("whereami-latlon");
				li.innerHTML = pos;
					
				var zoom = map.getZoom();
				zoom = mapzen.whosonfirst.php.htmlspecialchars(zoom);
				
				var li = document.getElementById("whereami-zoom");
				li.innerHTML = zoom;
			},
			
			'draw_crosshairs': function(){
					
				var m = document.getElementById("map");
				var container = m.getBoundingClientRect();
				
				var height = container.height;
				var width = container.width;
				
				var crosshair_y = (height / 2) - 8;
				var crosshair_x = (width / 2);
				
				// http://www.sveinbjorn.org/dataurls_css
				
				var data_url = '"data:image/gif;base64,R0lGODlhEwATAKEBAAAAAP///////////' + 
				'yH5BAEKAAIALAAAAAATABMAAAIwlI+pGhALRXuRuWopPnOj7hngEpRm6Z' + 
				'ymAbTuC7eiitJlNHr5tmN99cNdQpIhsVIAADs="';
				
				var style = [];
				style.push("position:absolute");
				style.push("top:" + crosshair_y + "px");
				style.push("height:19px");
				style.push("width:19px");
				style.push("left:" + crosshair_x + "px");
				style.push("margin-left:-8px;");
				style.push("display:block");
				style.push("background-position: center center");
				style.push("background-repeat: no-repeat");
				style.push("background: url(" + data_url + ")");
				style.push("z-index:200");
				
				style = style.join(";");
				var crosshair = document.getElementById("crosshairs");
				crosshair.style.cssText = style;
			},

			'scenefile': function(s){

				if (s){
					_scenefile = s;
				}

				return _scenefile;
			},
		
			'placetypes': function(pt){

				if ((pt) && (Array.isArray(pt))){
					_placetypes = pt;
				}

				return _placetypes;
			}
		};
		
		return self;
		
	})();