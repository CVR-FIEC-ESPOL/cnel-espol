

var PolygonDrawer = function(map){ 
	this.map = map;
	this.data_points = []
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
  	$("#remove_selected_pole").click(this.remove_selected_pole.bind(this));

  	$("#active_drawing").click(this.on_active_drawing.bind(this));
  	$("#draw_polygon" ).click(this.on_draw_polygon.bind(this));

  	$("#search_poles" ).click(this.on_search_poles.bind(this));
  	$("#ok_search").click(this.search_location.bind(this));
  	//$("#remove_polygon" ).click(this.on_remove_polygon.bind(this));
}
 

PolygonDrawer.prototype = Object.create(Observable.prototype);

PolygonDrawer.prototype.set_state = function(state){
	if(this.state){
		this.state.change();
	}
	this.state = state;
}

PolygonDrawer.prototype.add_data_point = function(location){
	this.data_points.push(location);
}

PolygonDrawer.prototype.on_select_pole = function(){
	var current_state = new SingleMarker();
	this.set_state(current_state);
	this.state.do_action(this);
}

PolygonDrawer.prototype.remove_selected_pole = function(){
	var current_state = new RemoverSingleMarker();
	this.set_state(current_state);
	this.state.do_action(this);
}

PolygonDrawer.prototype.on_active_drawing = function(){
	var current_state = new MarkerVertex();
	this.set_state(current_state);
	this.state.do_action(this);
}

PolygonDrawer.prototype.on_draw_polygon = function(){
	var current_state = new PolygonLinker();
	this.set_state(current_state);
	this.state.do_action(this);
}

PolygonDrawer.prototype.on_search_poles = function(){
	$('#modal_search').modal('show');
	this.init_autocomplete();
}

PolygonDrawer.prototype.init_autocomplete = function() {
  autocomplete = new google.maps.places.Autocomplete(( document.getElementById('address') ),{ types: ['geocode'] });
  //autocomplete.addListener('place_changed', this.search_location);
}

PolygonDrawer.prototype.search_location = function(){
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