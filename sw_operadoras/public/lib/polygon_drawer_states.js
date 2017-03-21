
var SingleMarker = function(){
	this.btn_id = "select_pole";
}

SingleMarker.prototype.do_action = function(context){
	$("#"+this.btn_id).attr('class','btn btn-danger');
	var map = context.map;
	var self = this;

	this.handler = google.maps.event.addListener(map, 'click', function(e) {
		context.notify({ 'simple_marker_location': { 'lat': e.latLng.lat(),'lng':e.latLng.lng() } });
	});
}

SingleMarker.prototype.change = function(){
	$("#"+this.btn_id).attr('class','btn btn-primary');
}

var RemoverSingleMarker = function(){
	this.btn_id = "remove_selected_pole";
}

RemoverSingleMarker.prototype.do_action = function(context){
	$("#"+this.btn_id).attr('class','btn btn-danger');
	var map = context.map;
	var self = this;

	this.handler = google.maps.event.addListener(map, 'click', function(e) {
		context.notify({ 'disable_marker_location': { 'lat': e.latLng.lat(),'lng':e.latLng.lng() } });
	});
}

RemoverSingleMarker.prototype.change = function(){
	$("#"+this.btn_id).attr('class','btn btn-primary');
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
		self.context.add_polygon_vertex(location);  	
		var circle = new google.maps.Circle(this.points_reference_cfg);
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
	$("#"+this.btn_id).attr('class','btn btn-primary');
}

var PolygonLinker = function(){
	this.region = null;
	this.btn_id = "draw_polygon";
}

PolygonLinker.prototype.do_action = function(context){
	var polygon_vertices = context.polygon_vertices;
	var map = context.map;
	var self = this;
	$("#"+this.btn_id).attr('class','btn btn-danger');

	if(polygon_vertices.length<2){
		alert("No ha marcado puntos para formar el polígono");
		return;
	}
	
    this.region = new google.maps.Polygon({
      paths: polygon_vertices,
      strokeColor: '#0000FF',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      draggable: false,
      editable: true
    });
    this.region.setMap(map);

    context.polygon_vertices = []
    context.region = this.region;

    google.maps.event.addListener(this.region.getPath(), "set_at", function(){
		context.notify({'draw_polygon': self.region});
	});

	google.maps.event.addListener(this.region.getPath(), "insert_at", function(){
		context.notify({'draw_polygon': self.region});
	});

	context.notify({'draw_polygon':this.region});
}

PolygonLinker.prototype.change = function(){
	if(this.region){
		this.region.setMap(null);
		this.region = null;
	}
	$("#"+this.btn_id).attr('class','btn btn-primary');
}