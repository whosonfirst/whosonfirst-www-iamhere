var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iamhere = (function(){

	var _scenefile = '/tangram/refill.yaml';
	
	var map;
	var current_layers = {};
	var _placetypes = [];

	var disable_cookie = "disable_ip";
	var skip_notice_cookie = "skip_notice";
	
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

				if (mapzen.whosonfirst.iplookup.enabled()){

					var enabled = document.getElementById("ip-lookups-enabled");
					var disabled = document.getElementById("ip-lookups-disabled");		
					
					var do_enable = function(){

						mapzen.whosonfirst.log.info("enabling IP lookups");
						
						self.set_cookie( disable_cookie, 0);
						enabled.style = "display:block";
						disabled.style = "display:none";						
					};

					var do_disable = function(){

						mapzen.whosonfirst.log.info("disbling IP lookups");
						
						self.set_cookie( disable_cookie, 1);
						enabled.style = "display:none";
						disabled.style = "display:block";						
					};
					
					var on = document.getElementById("ip-lookups-on");					
					var off = document.getElementById("ip-lookups-off");
					
					on.onclick = do_enable;
					off.onclick = do_disable;

					var jar = self.cookiejar();
					
					if (parseInt(jar[ disable_cookie ])){
						disabled.style = "display:block";
					}

					else {
						enabled.style = "display:block";
					}
					
					if (! match){
						mapzen.whosonfirst.iamhere.iplookup();
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

				var jar = self.cookiejar();

				if (parseInt(jar[ disable_cookie ])){
					mapzen.whosonfirst.log.info("skipping IP lookup because cookies say so");
					return;
				}

				var on_lookup = function(rsp){

					mapzen.whosonfirst.log.info("IP lookup for " + rsp['ip'] + " is: " + rsp['wofid']);

					if (rsp['geom_bbox']){
						
						var bbox = rsp['geom_bbox'];
						bbox = bbox.split(',');

						var sw = [ bbox[1], bbox[0] ];
						var ne = [ bbox[3], bbox[2] ];
						
						self.jump_to_bbox(sw, ne);
					}

					else {

						wofid = rsp['whosonfirst_id'];
						var url = mapzen.whosonfirst.data.id2abspath(wofid);

						mapzen.whosonfirst.net.fetch(url, on_fetch, on_notfetch);
					}

					var jar = self.cookiejar();
					
					if (! parseInt(jar[ skip_notice_cookie ])){
						self.iplookup_notice(rsp);
					}
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

			'iplookup_enable': function(){
				self.set_cookie(disable_cookie, 0);
			},

			'iplookup_disable': function(){
				self.set_cookie(disable_cookie, 1);
			},
			
			'iplookup_notice': function(rsp){

				var close_modal = function(){
					
					var skip = document.getElementById("iamhere-modal-skip");
					var disable = document.getElementById("iamhere-modal-disable");					
					
					if ((skip) && (skip.checked)){
						self.set_cookie(skip_notice_cookie, 1);
					}
					
					if ((disable) && (disable.checked)){
						self.iplookup_disable();
					}

					var modal = document.getElementById("iamhere-modal");
					var parent = modal.parentElement;
					parent.removeChild(modal);

				};
				
				var on_close = function(){
					close_modal();
				};
				
				var modal = document.createElement("div");
				modal.setAttribute("id", "iamhere-modal");
				
				var text = document.createElement("div");
				text.setAttribute("id", "iamhere-modal-text");
				
				var head = document.createElement("h4");
				head.appendChild(document.createTextNode("We have been \"helpful\" and auto-positioned the map for you..."));

				var intro = document.createElement("div");

				var where = "";
				
				if ((rsp) && (rsp['name'])){

					var enc_name = mapzen.whosonfirst.php.htmlspecialchars(rsp['name']);
					where = "They seem to think you are somewhere near or around " + enc_name + ".";
				}
				
				var p1_sentences = [
					"Using your computer's IP address we've asked the computer-robots-in-the-sky where in the world they think you might be right now.",
					where, 
					"We've used this information to auto-position the map accordingly.",
					"Sometimes the mappings from IP address to location are weird. Sometimes they are just wrong.",
					"Sometimes computers being \"helpful\" like this is weird and creepy so we've added a setting to allow you to disable this feature in the future.",
					"IP lookups are a complicated business and we have written a blog post about them if you'd like to know more."
				];
				
				var p1_text = p1_sentences.join(" ");
				
				var p1 = document.createElement("p");
				p1.appendChild(document.createTextNode(p1_text));
				
				var href = "https://mapzen.com/blog/missing-the-point/";
				
				var link = document.createElement("a");
				link.setAttribute("href", href);
				link.setAttribute("target", "blog");
				link.appendChild(document.createTextNode(href));
				
				var p2 = document.createElement("p");
				p2.setAttribute("class", "iamhere-modal-blog");
				p2.appendChild(link);
				
				var skip = document.createElement("input");
				skip.setAttribute("type", "checkbox");
				skip.setAttribute("id", "iamhere-modal-skip");
				skip.setAttribute("name", "iamhere-modal-skip");

				var skip_label = document.createElement("label");
				skip_label.setAttribute("for", "iamhere-modal-skip");
				skip_label.appendChild(document.createTextNode("Do not show this notice again."));

				var p3 = document.createElement("p");
				p3.appendChild(skip);
				p3.appendChild(skip_label);				

				var disable = document.createElement("input");
				disable.setAttribute("type", "checkbox");
				disable.setAttribute("id", "iamhere-modal-disable");
				disable.setAttribute("name", "iamhere-modal-disable");

				var disable_label = document.createElement("label");
				disable_label.setAttribute("for", "iamhere-modal-disable");
				disable_label.appendChild(document.createTextNode("Please disable IP lookups altogether"));

				var p4 = document.createElement("p");
				p4.appendChild(disable);
				p4.appendChild(disable_label);				
				
				intro.appendChild(p1);
				intro.appendChild(p2);
				intro.appendChild(p4);
				intro.appendChild(p3);
				
				text.appendChild(head);
				text.appendChild(intro);
				
				var controls = document.createElement("div");
				controls.setAttribute("id", "iamhere-modal-controls");

				var close_button = document.createElement("button");
				close_button.setAttribute("id", "iamhere-modal-close-button");
				close_button.appendChild(document.createTextNode("close"));

				close_button.onclick = on_close;

				controls.appendChild(close_button);				
				
				modal.appendChild(text);
				modal.appendChild(controls);
				
				var body = document.body;
				body.insertBefore(modal, body.firstChild);
				
				return false;
				
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

					var link = '<a href="https://spelunker.whosonfirst.org/id/' + enc_id + '/">';
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
			},

			'cookiejar': function(){

				var jar = {};
				var cookie = document.cookie;
				cookie = cookie.split(";");

				var count = cookie.length;

				for (var i=0; i < count; i++){

					var pair = cookie[i].split("=");
					var k = pair[0];
					var v = pair[1];

					k = k.trim();
					
					jar[k] = v;
				}

				return jar;
			},

			'set_cookie': function(k, v){

				k = k.trim();
				
				var cookie = [k,v].join("=");
				document.cookie = cookie;

				var enc_cookie = mapzen.whosonfirst.php.htmlspecialchars(cookie);
				mapzen.whosonfirst.log.info("set cookie " + enc_cookie);				
			}
		};
		
		return self;
		
	})();
