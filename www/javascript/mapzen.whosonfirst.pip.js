var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.pip = (function(){

	var _endpoint = '';
	
	var self = {
		
		'get_by_latlon': function(lat, lon, placetype, on_success, on_error){

			var method = "mapzen.places.getByLatLon";
			var args = { "latitude": lat, "longitude": lon };

			if (placetype){
				args["placetype"] = placetype;
			}

			var e = self.endpoint();

			if (e){
				
				var query = mapzen.whosonfirst.net.encode_query(args);
				var req = self.endpoint() + "?" + query;
			
				mapzen.whosonfirst.net.fetch(req, on_success, on_error);
				return;
			}

			else {

				mapzen.places.api.execute_method(method, args, on_success, on_error);
				return;
			}			
		},
		
		'endpoint': function(e){
			
			if (e){
				_endpoint = e;
			}
			
			return _endpoint;
		}
	};
	
	return self;
})();
