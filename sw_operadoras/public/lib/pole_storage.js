var PoleStorage = function(){
	/*cache*/
}

PoleStorage.prototype.save = function(data){
	if (window.sessionStorage) {
		var id = data['object_id'];
		var location = {'lat': data['lat'],'lng': data['lng']};
	  	sessionStorage.setItem(id,JSON.stringify(location));
	}
}

PoleStorage.prototype.remove = function(data){
	if (window.sessionStorage) {
		var id = data['object_id'];
		sessionStorage.removeItem(id);
	}
}

PoleStorage.prototype.restore = function(){
	$("#pole-list").empty(); 
	if (window.sessionStorage) {
		var self = this;
		$.each(sessionStorage, function(key, value){
			var pole_saved = JSON.parse(sessionStorage.getItem(key));
			if(pole_saved){
				self.add_pole_container(key,0);
			}
		});
	}
}
