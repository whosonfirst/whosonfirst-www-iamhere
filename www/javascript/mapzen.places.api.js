(function(f){

	if (typeof exports === "object" && typeof module !== "undefined"){
		module.exports = f();
	}

	else if (typeof define === "function" && define.amd){
		define([],f);
	}

	else {
		var g;

		if (typeof window!=="undefined") {
			g=window;
		} else if (typeof global!=="undefined") {
			g=global;
		} else if (typeof self!=="undefined") {
			g=self;
		} else {
			g=this;
		}

		g.mapzen = g.mapzen || {};
		g.mapzen.places = g.mapzen.places || {};
		g.mapzen.places.api = g.mapzen.places.api = f();
	}

}(function(){

	var null_handler = function(){
		return undefined;
	};

	var mapzen_endpoint = function(){
		return "https://places.mapzen.com/v1"
	};

	var mapzen_authentication = function(form_data){
		var api_key = "mapzen-xxxxxxx";
		if (typeof L !== "undefined" &&
		    typeof L.Mapzen !== "undefined" &&
		    typeof L.Mapzen.apiKey !== "undefined"){
			api_key = L.Mapzen.apiKey;
		}
		form_data.append("api_key", api_key);
	};

	var self = {

		'_handlers': {
			'endpoint': mapzen_endpoint,
			'authentication': mapzen_authentication
		},

		'set_apikey': function(key){

			return self.set_handler("authentication", function(form_data){
				form_data.append("api_key", key);
			});
		},

		'set_handler': function(target, handler){

			if (! self._handlers[target]){
				console.log("MISSING " + target);
				return false;
			}

			if (typeof(handler) != "function"){
				console.log(target + " IS NOT A FUNCTION");
				return false;
			}

			self._handlers[target] = handler;
		},

		'get_handler': function(target){

			if (! self._handlers[target]){
				return false;
			}

			return self._handlers[target];
		},

		'method': function(name, args){

			if (! args){
				args = {"verb": "GET"};
			}

			var m = function(n, v){

				var self = {
					'name': function(){ return n; },
					'verb': function(){ return v; },
				};

				return self;
			};

			return m(name, args["verb"]);
		},

		'call': function(method, data, on_success, on_error){

			if (typeof(method) == "string"){
				method = self.method(method);
			}

			var dothis_onsuccess = function(rsp){

				if (on_success){
					on_success(rsp);
				}
			};

			var dothis_onerror = function(rsp){

				console.log("ERROR", rsp);

				if (on_error){
					on_error(rsp);
				}
			};

			var form_data = data;

			if ((! form_data) || (! form_data.append)){

				form_data = new FormData();

				for (key in data){
					form_data.append(key, data[key]);
				}
			}

			form_data.append('method', method.name());

			var get_endpoint = self.get_handler('endpoint');

			if (! get_endpoint){
				dothis_onerror(self.destruct("Missing endpoint handler"));
				return false
			}

			var endpoint = get_endpoint();

			if (! endpoint){
				dothis_onerror(self.destruct("Endpoint handler returns no endpoint!"));
				return false
			}

			if (! form_data.get("api_key")){

				var set_authentication = self.get_handler('authentication');

				if (! set_authentication){
					dothis_onerror(self.destruct("there is no authentication handler"));
					return false;
				}

				set_authentication(form_data);
			}

			var onload = function(rsp){

				var target = rsp.target;

				if (target.readyState != 4){
					return;
				}

				var status_code = target['status'];
				var status_text = target['statusText'];

				var raw = target['responseText'];
				var data = undefined;

				var fmt = form_data.get("format");

				if ((fmt == "json") || (fmt == "geojson") || (fmt == null)){

					try {
						data = JSON.parse(raw);
					}

					catch (e){
						dothis_onerror(self.destruct("failed to parse JSON " + e));
						return false;
					}

					if (data['stat'] != 'ok'){
						dothis_onerror(data);
						return false;
					}
				}

				else {
					data = raw;
				}

				dothis_onsuccess(data);
				return true;
			};

			var onprogress = function(rsp){
				// console.log("progress");
			};

			var onfailed = function(rsp){
				dothis_onerror(self.destruct("connection failed " + rsp));
			};

			var onabort = function(rsp){
				dothis_onerror(self.destruct("connection aborted " + rsp));
			};

			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data

			try {
				var req = new XMLHttpRequest();

				req.addEventListener("load", onload);
				req.addEventListener("progress", onprogress);
				req.addEventListener("error", onfailed);
				req.addEventListener("abort", onabort);

				if (method.verb() == "GET"){

					if (form_data.keys()){

						var query = [];

						for (var pair of form_data.entries()) {
							query.push(pair[0] + "=" + encodeURIComponent(pair[1]));
						}

						var query_string = query.join("&");
						var sep = (endpoint.indexOf('?') == -1) ? '?' : '&';

						endpoint = endpoint + sep + query.join("&");
					}

					req.open("GET", endpoint, true);
					req.send();

					return;
				}

				req.open("POST", endpoint, true);
				req.send(form_data);

			} catch (e) {

				dothis_onerror(self.destruct("failed to send request, because " + e));
				return false;
			}

			return false;
		},

		'call_paginated': function(method, data, on_page, on_error, on_complete){

			var results = [];

			var dothis_oncomplete = function(rsp) {

				results.push(rsp);

				if (on_page) {
					on_page(rsp);
				}

				if (rsp.next_query) {

					var args = rsp.next_query.split('&');

					for (var i = 0; i < args.length; i++) {
						var arg = args[i].split('=');
						var key = decodeURIComponent(arg[0]);
						var value = decodeURIComponent(arg[1]);
						data[key] = value;
					}

					self.call(method, data, dothis_oncomplete, on_error);

				}  else if (on_complete) {
					on_complete(results);
				}
			};

			self.call(method, data, dothis_oncomplete, on_error);
		},

		'execute_method': function(method, data, on_success, on_error){
			self.call(method, data, on_success, on_error);
		},

		'execute_method_paginated': function(method, data, on_page, on_error, on_complete){
			self.call_paginated(method, data, on_page, on_error, on_complete);
		},

		'destruct': function(msg){

			return {
				'stat': 'error',
				'error': {
					'code': 999,
					'message': msg
				}
			};

		}
	}

	return self;

}));
