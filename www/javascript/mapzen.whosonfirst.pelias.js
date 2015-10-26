var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.pelias = (function(){

		var _endpoint = 'https://search.mapzen.com/v1/search';
		var _apikey = '';

		var self = {

			'search': function(q, on_success, on_error){

				var apikey = mapzen.whosonfirst.pelias.apikey();

				var query = { 'text': q, 'api_key': apikey };
				query = mapzen.whosonfirst.net.encode_query(query);

				var req = mapzen.whosonfirst.pelias.endpoint() + "?" + query;

				mapzen.whosonfirst.log.info("geocode " + q)

				mapzen.whosonfirst.net.fetch(req, on_success, on_error);
			},
			
			'endpoint': function(e){

				if (e){
					_endpoint = e;
				}

				return _endpoint;
			},

			'apikey': function(k){

				if (k){
					_apikey = k;
				}

				return _apikey;
			}
		};

		return self;
	})();