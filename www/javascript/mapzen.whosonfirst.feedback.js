var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.feedback = (function(){

		var _timeout = undefined;

		var self = {

			'append': function(msg){

				var enc_msg = mapzen.whosonfirst.php.htmlspecialchars(msg);
				var text = document.createTextNode(enc_msg);

				var item = document.createElement("li");

				var dt = new Date();
				var ts = dt.toISOString();
				item.setAttribute("ts", ts);

				item.appendChild(text);

				var list = self._list();
				list.appendChild(item);

				if (_timeout){
					// removeTimeout(_timeout);
				}

				var _this = self;

				_timeout = setTimeout(function(){
					_this.prune();
				}, 10000);
			},

			'prune': function(){

				var now = new Date();

				var list = self._list();
				var children = list.children;
				var count = children.length;

				for (var i=0; i < count; i++){

					var item = children[i];

					if (! item){
						continue;
					}

					var ts = item.getAttribute("ts");
					var dt = new Date(ts);

					var diff = now - dt;

					if (diff > 2000){
						list.removeChild(item);
					}
				}
			},
			
			'_list': function(){

				var list = document.getElementById("whereami-feedback-list");

				if (! list){
					var list = document.createElement("ul");
					list.setAttribute("id", "whereami-feedback-list");

					var container = document.getElementById("whereami-feedback");
					container.appendChild(list);
				}

				return list;
			},
		};
	
	return self;

})();
