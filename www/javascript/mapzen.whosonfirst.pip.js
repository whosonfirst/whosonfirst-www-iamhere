var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.pip = (function(){

		var _endpoint = '';

		var self = {

			'get_by_latlon': function(lat, lon, on_success, on_error){

				var q = { 'latitude': lat, 'longitude': lon };
				q = mapzen.whosonfirst.net.encode_query(q);
				
				var req = self.endpoint() + "?" + q;
				
				mapzen.whosonfirst.net.fetch(req, on_success, on_error);
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