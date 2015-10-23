var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iamhere = (function(){

		var map;

		var self = {
			
			'init': function(){

				// https://mapzen.com/documentation/search/search/#mapzen-search-finding-places

				function pelias(q){

					var k = "";

					if (k == ""){
						alert("missing api key");
						return false;
					}

					var query = { 'text': q, 'api_key': k };
					query = mapzen.whosonfirst.net.encode_query(query);

					var req = "https://search.mapzen.com/v1/search?" + query;
					mapzen.whosonfirst.net.fetch(req, on_pelias);
				}

				function on_pelias(rsp){

					var features = rsp['features'];
					var first = features[0];
					
					// var props = first['properties'];
					// console.log(props);

					var geom = first['geometry'];
					var coords = geom['coordinates'];

					var lat = coords[1];
					var lon = coords[0];

					jump_to(lat, lon, 12);

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
				}

				function jump_to(lat, lon, zoom){

					map.setView([lat, lon], zoom)
					update_loc();
					reversegeo();
				}

				var reversegeo = function(){
					
					var ll = map.getCenter();
					var lat = ll.lat;
					var lon = ll.lng;
					
					var q = { 'latitude': lat, 'longitude': lon };
					q = mapzen.whosonfirst.net.encode_query(q);
					
					var req = "http://localhost:8080/?" + q;
					
					mapzen.whosonfirst.net.fetch(req, update_where);
				}
				
				function update_where(possible){
					
					var li = document.getElementById("whereami-reversegeo");
					
					if ((! possible) || (possible.length == 0)){
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

						mapzen.whosonfirst.enmapify.render_id(map, wofid);
					}
					
					where = where.join(" or ");
					where = mapzen.whosonfirst.php.htmlspecialchars(where);
					
					li.innerHTML = where;
				}
				
				function update_loc(){
					
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
				}
				
				function draw_crosshairs(){
					
					var m = document.getElementById("map");
					var container = m.getBoundingClientRect();
					
					var height = container.height;
					var width = container.width;
					
					var crosshair_y = (height / 2) - 8;
					var crosshair_x = (width / 2);
					
					// http://www.sveinbjorn.org/dataurls_css
					// this is just a nuisance to do above...
					
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
				
				mapzen.whosonfirst.leaflet.tangram.scenefile('/tangram/refill.yaml');
				map = mapzen.whosonfirst.leaflet.tangram.map_with_bbox('map', 37.63983, -123.173825, 37.929824, -122.28178);
				
				map.on('load', function(e){
						update_loc();
					});
				
				map.on('zoomend', function(e){
						update_loc();
					});
				
				map.on('dragend', function(e){
						update_loc();
						reversegeo();
					});

				var find = document.getElementById("find");
			       		
				find.onclick = function(){

					var q = document.getElementById("q");
					q = q.value

					if (q == ""){
						return false;
					}

					pelias(q);
					return false;
				};

				var findme = document.getElementById("findme");

				findme.onclick = function(){
					
					navigator.geolocation.getCurrentPosition(function(pos){
							lat = pos.coords.latitude;
							lon = pos.coords.longitude;
		
							jump_to(lat, lon, 16);
						});		
				};
				
				update_loc();
				reversegeo();
				
				draw_crosshairs();
				window.onresize = draw_crosshairs;
			}
		};
		
		return self;
		
	})();