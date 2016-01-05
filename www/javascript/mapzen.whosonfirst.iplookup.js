var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iplookup = (function(){

		var _endpoint = 'http://localhost:8668';
		var _apikey = '';

		var self = {

			'lookup': function(ip, on_success, on_error){

				var query = {};

				if (ip){
					query['ip'] = ip;
				}

				query = mapzen.whosonfirst.net.encode_query(query);

				var req = mapzen.whosonfirst.iplookup.endpoint() + "?" + query;

				mapzen.whosonfirst.log.info("lookup IP " + q)

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