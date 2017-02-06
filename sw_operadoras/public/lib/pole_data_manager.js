
var Observer = function(){

}

Observer.prototype.update = function(data){

}

var PoleDataManager = function(bounding_box){ 
	this.bounding_box = bounding_box;
	this.util = new Util();
}

PoleDataManager.prototype = Object.create(Observer.prototype);

PoleDataManager.prototype.download = function() {
	// obtiene informacion de los postes del servidor
	this.data = []
	var self = this;

	var promise = $.ajax({
	  dataType: "json",
	  url: "/get_poles",
	  data: { 'bounding_box' : this.bounding_box },
	});
	
	promise.done(function(response){
		var poles = response['locations'];
		self.data = poles;
	});
	return promise;
};

PoleDataManager.prototype.upload = function(){
	//subir info al webservices
}

PoleDataManager.prototype.update = function(data){
	if(data!=null){
		if('region' in data){
			this.polygon_region = data['region'];
			this.show_selected_poles(this.polygon_region);
		}

		if('location' in data){
			console.log("location here")
		}

		if('click' in data){
			var id = data['click']['object_id']
			this.save(data['click']);
			this.add_pole_container(id,0);
		}
	}
}

PoleDataManager.prototype.save = function(data){
	if (window.sessionStorage) {
		var id = data['object_id'];
		var location = {'lat': data['lat'],'lng': data['lng']};
	  	sessionStorage.setItem(id,JSON.stringify(location));
	}
}

PoleDataManager.prototype.restore = function(){
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


PoleDataManager.prototype.show_selected_poles  = function(polygon){
  var poles_selected = [];
  var id_poles = []
  var self = this;

  $('#modal_message').modal('show');

  $("#btn_send_message").click(function(){
  	for (var i in self.data){
	  	var location = self.data[i];
	  	var latlng_obj = new google.maps.LatLng(location.lat,location.lng);
	    var result = google.maps.geometry.poly.containsLocation(latlng_obj, polygon);
	    if(result){
	      poles_selected.push(location);
	      id_poles.push(location.object_id);
	    }
  	}
  	$('#modal_message').modal('hide');
  	
  	for(var i in id_poles){
  		var id = id_poles[i].object_id;
  		self.add_pole_container(id,1);
  		self.save(poles_selected[i]);
  	}
  	/*$.ajax({
  	  dataType: "json",
	  url: "/get_tags",
	  data: { 'poles' : id_poles},
	  success: self.populate_list_poles.bind(self),
	  error: function(err){
	  	console.log(err);
	  }
	});*/
  })
}

PoleDataManager.prototype.populate_list_poles = function(poles_tags){
	for(var i in poles_tags){
		this.add_pole_container(poles_tags[i].object_id,1);
	}
}

PoleDataManager.prototype.add_pole_container = function(pole_id,num_tag){
	var li = $("<li class='list-group-item pole-info-item'></li>");
	var id_container = $("<div class='pole-info-id col-md-7 row-flex justify-content-start align-items-center'></div>");
	var id_span = $("<span>Poste N°" + pole_id  + "</span>");
    li.data("id",pole_id);
    li.click(this.show_info_pole);
    var tags_container = $("<div class='pole-info-tags col-md-3 row-flex justify-content-start align-items-center'><button class='btn btn-primary' data-toggle='modal' data-target='#myModal' type='button'>Tags <span class='badge'>" + num_tag + "</span></button></div>");
 
    $(id_container).append(id_span);
    $(li).append(id_container);
    $(li).append(tags_container);
    $("#pole-list").append(li);
}

PoleDataManager.prototype.show_info_pole = function(e){
	console.log(e);
}