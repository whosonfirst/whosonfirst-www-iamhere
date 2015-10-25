var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iamhere = (function(){

		// Necessary until we stop sending CORS headers twice. A ticket
		// has been filed with ops (20151022/thisisaaronland)
		
		mapzen.whosonfirst.data.endpoint("http://localhost:9999/");

		var pelias_endpoint = '';
		var pelias_apikey = '';

		var pip_endpoint = '';

		var map;
		var current_layers = {};

		var self = {
			
			'init': function(){
				
				mapzen.whosonfirst.leaflet.tangram.scenefile('/tangram/refill.yaml');
				map = mapzen.whosonfirst.leaflet.tangram.map_with_bbox('map', 37.63983, -123.173825, 37.929824, -122.28178);
				
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

				var find = document.getElementById("find");
			       		
				find.onclick = function(){

					var q = document.getElementById("q");
					q = q.value

					if (q == ""){
						return false;
					}

					self.geocode(q);
					return false;
				};

				var findme = document.getElementById("findme");
				findme.onclick = self.geolocate;

				window.onresize = self.draw_crosshairs;
				
				self.update_location();
				self.reverse_geocode();
				
				self.draw_crosshairs();
			},

			'geolocate': function(){

				var on_locate = function(pos){
					var lat = pos.coords.latitude;
					var lon = pos.coords.longitude;
					self.jump_to(lat, lon, 16);					
				};

				navigator.geolocation.getCurrentPosition(on_locate);
			},
			
			'geocode': function(q){

				if (pelias_apikey == ""){
					alert("missing api key");
					return false;
				}

				var query = { 'text': q, 'api_key': pelias_apikey };
				query = mapzen.whosonfirst.net.encode_query(query);

				var req = pelias_endpoint + "?" + query;

				var on_fetch = function(rsp){ self.on_geocode(rsp); };
				mapzen.whosonfirst.net.fetch(req, on_fetch);
			},

			'on_geocode': function(rsp){

				var features = rsp['features'];
				var first = features[0];
				
				var geom = first['geometry'];
				var coords = geom['coordinates'];
				
				var lat = coords[1];
				var lon = coords[0];
				
				self.jump_to(lat, lon, 12);
				
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

				var ll = map.getCenter();
				var lat = ll.lat;
				var lon = ll.lng;
				
				var on_success = function(rsp){
					self.on_reverse_geocode(rsp);
				};

				var on_fail = function(rsp){
					var el = document.getElementById("whereami-reversegeo");
					el.style = "display:inline !important;";
					el.innerHTML = "the land of INVISIBLE ERROR CAT";
				};

				mapzen.whosonfirst.pip.get_by_latlon(lat, lon, on_success, on_fail);

				var el = document.getElementById("whereami-reversegeo");
				el.style = "display:none !important;";
				el.innerHTML = "";
			},

			'on_reverse_geocode': function(possible){

				var count_possible = possible.length;
				var count_current = current_layers.length;
				
				var to_keep = {}
				
				for (var i=0; i < count_possible; i++){
					
					var loc = possible[i];
					var wofid = loc['Id'];
					
					if (current_layers[wofid]){
						to_keep[wof_id] = 1;
					}
				}
				
				for (var wofid in current_layers){
					
					if (to_keep[wofid]){
						continue;
					}
					
					var layer = current_layers[wofid];
					map.removeLayer(layer);
				}
				
				var li = document.getElementById("whereami-reversegeo");
				li.style = "display:inline !important;";

				if (! count_possible){
					li.innerHTML = "a place we don't know about";
					return;
				}
				
				var count = possible.length;
				var where = [];
				
				for (var i=0; i < count; i++){
					
					var loc = possible[i];
					var wofid = loc['Id'];
					var here = loc['Name'];
					where.push(here);
					
					if (current_layers[wofid]){
						continue;
					}
					
					var on_fetch = function(feature){
						
						var props = feature['properties'];
						var wofid = props['wof:id'];
						
						var style = mapzen.whosonfirst.leaflet.styles.consensus_polygon()
						var layer = mapzen.whosonfirst.leaflet.draw_poly(map, feature, style);
						
						current_layers[ wofid ] = layer;
					};
					
					mapzen.whosonfirst.enmapify.render_id(map, wofid, on_fetch);
				}
				
				where = where.join(" or ");
				where = mapzen.whosonfirst.php.htmlspecialchars(where);
				
				li.innerHTML = where;
			},

			'jump_to': function(lat, lon, zoom){
				map.setView([lat, lon], zoom);
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
				
				style = style.join(";");
				var crosshair = document.getElementById("crosshairs");
				crosshair.style = style;
			}

		};
		
		return self;
		
	})();