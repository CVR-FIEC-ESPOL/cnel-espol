var PoleStorage = function(){
	/*cache*/
	sessionStorage.setItem("poles",JSON.stringify({}));
}

PoleStorage.prototype.save = function(id,tags){
	if (window.sessionStorage) {
		var poles = JSON.parse(sessionStorage.getItem("poles"));
		if(tags.length >0){
			for(var i in tags){
				poles[id].push(tags[i]);
			}
		}else{
			poles[id] = [];
		}
		console.log("saving poles",poles);
		sessionStorage.setItem("poles",JSON.stringify(poles));
	}
}

PoleStorage.prototype.remove = function(data){
	if (window.sessionStorage) {
		var id = data['object_id'];
		sessionStorage.removeItem(id);
	}
}

PoleStorage.prototype.get = function(){
	var poles = [];
	if (window.sessionStorage) {
		poles = JSON.parse(sessionStorage.getItem("poles"));
	}
	return poles
}

PoleStorage.prototype.get_pole = function(id){
	var poles;
	if (window.sessionStorage) {
		poles = JSON.parse(sessionStorage.getItem("poles"));
		return poles[id];
	}
}


PoleStorage.prototype.get_keys = function(){
	$("#pole-list").empty(); 
	var poles = this.get();
	return Object.keys(poles) ;
}
