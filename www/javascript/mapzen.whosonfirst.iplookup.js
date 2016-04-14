var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.iplookup = (function(){

		var _endpoint = 'https://ip.dev.mapzen.com/';
		var _apikey = '';

		var _enabled = true;
	
		var self = {

			'lookup': function(ip, on_success, on_error){

				var query = {
					'raw': 1,
				};

				if (ip){
					query['ip'] = ip;
				}

				query = mapzen.whosonfirst.net.encode_query(query);

				var req = mapzen.whosonfirst.iplookup.endpoint() + "?" + query;

				mapzen.whosonfirst.log.info("lookup IP " + ip)

				mapzen.whosonfirst.net.fetch(req, on_success, on_error);
			},

			'enabled': function(bool){

				if (typeof(bool) != "undefined"){
					_enabled = (bool) ? true : false;
				}

				return _enabled;
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
