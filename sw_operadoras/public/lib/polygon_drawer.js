

var Drawer = function(map){ 
	this.map = map;
	this.polygon_vertices = []
	this.points_reference_cfg = {
	    strokeColor: '#FF0000',
	    strokeOpacity: 0.8,
	    strokeWeight: 2,
	    fillColor: '#FF0000',
	    fillOpacity: 0.35,
	    radius: 20
	}
	this.region_cfg = {}
	this.active = false;
	this.state = new SingleMarker();
	this.state.do_action(this);
	
	this.region = null;
	//$("#draw_polygon").attr('disabled','disabled');
  	//.attr('disabled','disabled');
  	//$("#remove_polygon").attr('disabled','disabled');

  	$("#select_pole").click(this.on_select_pole.bind(this));
  	$("#remove_selected_pole").click(this.on_remove_selected_pole.bind(this));
  	$("#active_drawing").click(this.on_active_drawing.bind(this));
  	$("#draw_polygon" ).click(this.on_draw_polygon.bind(this));
  	$("#search_poles" ).click(this.on_search_poles.bind(this));
  	$("#ok_search").click(this.on_search_location.bind(this));
  	//$("#remove_polygon" ).click(this.on_remove_polygon.bind(this));
}
 
Drawer.prototype = Object.create(Observable.prototype);

Drawer.prototype.set_state = function(state){
	if(this.state){
		this.state.change();
	}
	this.state = state;
}

Drawer.prototype.add_polygon_vertex = function(location){
	this.polygon_vertices.push(location);
}

Drawer.prototype.on_select_pole = function(){
	console.log("single marker active");
	var current_state = new SingleMarker();
	this.set_state(current_state);
	this.state.do_action(this);
}

Drawer.prototype.on_remove_selected_pole = function(){
	var current_state = new RemoverSingleMarker();
	this.set_state(current_state);
	this.state.do_action(this);
}

Drawer.prototype.on_active_drawing = function(){
	var current_state = new MarkerVertex();
	this.set_state(current_state);
	this.state.do_action(this);
}

Drawer.prototype.on_draw_polygon = function(){
	var current_state = new PolygonLinker();
	this.set_state(current_state);
	this.state.do_action(this);
}

Drawer.prototype.on_search_poles = function(){
	$('#modal_search').modal('show');
	autocomplete = new google.maps.places.Autocomplete(( document.getElementById('address') ),{ types: ['geocode'] });
}

Drawer.prototype.on_search_location = function(){
	var address = document.getElementById('address').value;
	console.log(address);
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode({'address': address}, function(results, status) {
	  
	  if (status === google.maps.GeocoderStatus.OK) {
	    var lat = results[0].geometry.location.lat();
	    var lng = results[0].geometry.location.lng(); 
	    console.log(lat);
	    console.log(lng);
	  	self.map.setCenter(results[0].geometry.location);
	  	/*marker.setMap(null);
	  	marker = new google.maps.Marker({
	    	map: mapViewer,
	    	position: results[0].geometry.location
	  	});*/

	  } else {
	  	alert('Geocode was not successful for the following reason: ' + status);
	  }

  	});
  	$('#modal_search').modal('hide');
}