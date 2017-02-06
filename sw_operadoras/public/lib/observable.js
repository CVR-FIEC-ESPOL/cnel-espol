
var Observable = function(){	
}

Observable.prototype.observers = [];

Observable.prototype.add_observer = function(observer){
	this.observers.push(observer);
}

Observable.prototype.remove_observers = function(){
	this.observers = []
}

Observable.prototype.notify = function(data){
	this.observers.forEach(function(observer,index, array){
		observer.update(data);
	})
}