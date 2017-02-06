
var SingleMarker = function(){
	this.btn_id = "select_pole";
}

SingleMarker.prototype.do_action = function(context){
	$("#"+this.btn_id).attr('class','btn btn-danger');
	var map = context.map;
	var self = this;

	this.handler = google.maps.event.addListener(map, 'mouseup', function(e) {
		
		/*context.notify({'location': e.latLng});*/

	});
}

SingleMarker.prototype.change = function(){
	$("#"+this.btn_id).attr('class','btn btn-success');
}

var MarkerVertex = function(){
	this.reference_points = []
	this.context = null;
	this.btn_id = "active_drawing";
}

MarkerVertex.prototype.do_action = function(context){
	var self = this;

	$("#"+this.btn_id).attr('class','btn btn-danger');

	this.context = context;
	var map = this.context.map;

	this.handler = google.maps.event.addListener(map, 'mouseup', function(e) {
		var location = e.latLng;
		self.context.add_data_point(location);  	
		var circle = new google.maps.Circle(this.points_reference_cfg);
		//circle.setCenter(location);
		//circle.setMap(this.map);
		var marker = new google.maps.Marker({
	        position: location,
	        map: map
	    });
	    self.reference_points.push(marker);
	    self.context.notify(null);//notifica a los observers que ha existido un cambio, en este caso los observadores no haran nada frente a este cambio
	});
}

MarkerVertex.prototype.change = function(){
	for (var i in this.reference_points){
	    this.reference_points[i].setMap(null);
	}
	this.reference_points = []
	google.maps.event.removeListener(this.handler);
	$("#"+this.btn_id).attr('class','btn btn-success');
}

var PolygonLinker = function(){
	this.region = null;
	this.btn_id = "draw_polygon";
}

PolygonLinker.prototype.do_action = function(context){
	var data_points = context.data_points;
	var map = context.map;
	$("#"+this.btn_id).attr('class','btn btn-danger');

	if(data_points.length<2){
		return;
	}
	
    this.region = new google.maps.Polygon({
      paths: data_points,
      strokeColor: '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      editable: false,
      draggable: false
    });
    this.region.setMap(map);

    context.data_points = []
    context.region = this.region;
	context.notify({'region':this.region});
}

PolygonLinker.prototype.change = function(){
	this.region = null;
	$("#"+this.btn_id).attr('class','btn btn-success');
}

var DragerPolygon = function(){
	this.region = null;
	this.btn_id = "drag_polygon";
}

DragerPolygon.prototype.do_action = function(context){
	var self = this;

	$("#"+this.btn_id).attr('class','btn btn-danger');
	
	this.region = context.region;

	if(!this.region){
		return
	}
	this.region.setDraggable(true);
	
	google.maps.event.addListener(this.region.getPath(), "dragend", function(){
		self.region.setOptions({
			strokeColor: '#0000FF',
			fillColor: '#0000FF'
		})
	});

	this.region.setOptions({
		strokeColor: '#FF0000',
		fillColor: '#FF0000'
	});
}

DragerPolygon.prototype.change = function(){
	$("#"+this.btn_id).attr('class','btn btn-success');
	if(!this.region){
		return
	}
	this.region.setDraggable(false);
}


var EditorPolygon = function(){
	this.region = null;
	this.btn_id = "edit_polygon";
}

EditorPolygon.prototype.do_action = function(context){
	this.region = context.region;
	$("#"+this.btn_id).attr('class','btn btn-danger');
	if(!this.region){
		return
	}
	this.region.setEditable(true);
}

EditorPolygon.prototype.change = function(){
	$("#"+this.btn_id).attr('class','btn btn-success');
	if(!this.region){
		return
	}
	this.region.setEditable(false);
}
