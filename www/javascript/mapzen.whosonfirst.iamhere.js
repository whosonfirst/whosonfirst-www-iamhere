var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iamhere = (function(){

		var self = {

			'init': function(){
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
			li.innerHTML = "somewhere";
			return;
		}

		var count = possible.length;
		var where = [];

		for (var i=0; i < count; i++){
			var here = possible[i]['Name'];
		        where.push(here);
		}

		where = where.join(" or ");
		where = mapzen.whosonfirst.php.htmlspecialchars(where);

		li.innerHTML = where;
	}

	function update_loc(){

		var ll = map.getCenter();
		var lat = ll.lat;
		var lon = ll.lng;

		var pos = lat + "," + lon;
		pos = mapzen.whosonfirst.php.htmlspecialchars(pos);

		var li = document.getElementById("whereami-latlon");
		li.innerHTML = pos;

		var zoom = map.getZoom();
		zoom = mapzen.whosonfirst.php.htmlspecialchars(zoom);

		var li = document.getElementById("whereami-zoom");
		li.innerHTML = zoom;
	}

	mapzen.whosonfirst.leaflet.tangram.scenefile('/tangram/refill.yaml');
	var map = mapzen.whosonfirst.leaflet.tangram.map_with_bbox('map', 37.63983, -123.173825, 37.929824, -122.28178);

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

	var findme = document.getElementById("findme");

	findme.onclick = function(){

		navigator.geolocation.getCurrentPosition(function(pos){
		 lat = pos.coords.latitude;
		 lon = pos.coords.longitude;

				  map.setView([lat, lon], 16)
                });		
	};

	update_loc();
	reversegeo();

			}
		};

		return self;

	})();