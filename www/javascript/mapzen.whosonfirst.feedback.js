var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.feedback = (function(){

		var _timeout = undefined;
		var _schedule = 2000;
		var _limit = 4000;

		var self = {

			'alert': function(msg){
				this.append(msg, "alert");
			},

			'info': function(msg){
				this.append(msg, "info");
			},

			'append': function(msg, cls){

				mapzen.whosonfirst.log.debug(msg);

				var enc_msg = mapzen.whosonfirst.php.htmlspecialchars(msg);
				var enc_cls = mapzen.whosonfirst.php.htmlspecialchars(cls);
				var text = document.createTextNode(enc_msg);

				var item = document.createElement("li");

				var dt = new Date();
				var ts = dt.toISOString();
				item.setAttribute("ts", ts);
				item.setAttribute("class", enc_cls);

				item.appendChild(text);

				var list = self._list();
				list.appendChild(item);
				
				self.schedule();
			},

			'schedule': function(){

				if (_timeout){
					// removeTimeout(_timeout);
				}

				var _this = self;

				_timeout = setTimeout(function(){
					_this.prune();
				}, _schedule);
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
					var cls = item.getAttribute("cls");

					var dt = new Date(ts);
					var diff = now - dt;

					var limit = _limit;

					if (cls == "alert"){
						limit = limit * 2;
					}

					if (diff > limit){
						list.removeChild(item);
					}
				}

				var children = list.children;
				var count = children.length;

				if (count){
					self.schedule();
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
