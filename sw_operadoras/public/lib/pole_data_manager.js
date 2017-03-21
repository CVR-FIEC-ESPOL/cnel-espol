var Observer = function(){

}

Observer.prototype.update = function(data){

}

var PoleDataManager = function(bounding_box){ 
	this.bounding_box = bounding_box;
	this.util = new Util();
	this.data = []
	this.polygon_region = null
	this.layer = null
	this.storage = PoleStorage();
}

PoleDataManager.prototype = Object.create(Observer.prototype);


PoleDataManager.prototype.set_bounding_box = function(bounding_box){
	this.bounding_box = bounding_box;
}

PoleDataManager.prototype.set_layer = function(layer){
	this.layer = layer;
}

PoleDataManager.prototype.download = function(url) {
	// obtiene informacion de los postes del servidor
	var self = this;
	console.log(self.bounding_box);
	
	var promise = $.ajax({
	  dataType: "json",
	  url: url,
	  data: { 'bounding_box' : self.bounding_box },
	});
	
	console.log("enviado peticion");

	promise.done(function(response){
		console.log(response);
		var poles = response['locations'];
		self.data = poles;
	})
	return promise;
};

PoleDataManager.prototype.upload = function(){
	//subir info al webservices
}

PoleDataManager.prototype.update = function(data){
	if(data!=null){
		if('draw_polygon' in data){
			this.polygon_region = data['region'];
			$('#modal_message').modal('show');
			this.show_selected_poles(this.polygon_region);
		}

		if('region_has_changed' in data){
			this.polygon_region = data['region'];
			this.show_selected_poles(this.polygon_region);
		}

		if('simple_marker_location' in data){
			var query = data['simple_marker_location'];
			var pole = this.get_pole(query);
			if(pole!=null){
				var id = pole['object_id'];//recibir el id del poste seleccionado
				this.layer.draw_pole(id);
				this.storage.save(pole);//almacena el pole marcado en la cache
				this.add_pole_container(id,0);//agrega el pole marcado a la lista de poles
			}
		}
		if('disable_marker_location' in data){
			var query = data['disable_marker_location'];
			var pole = this.get_pole(query);
			if(pole!=null){
				var id = pole['object_id'];//recibir el id del poste seleccionado
				this.layer.delete_pole(id);
				this.storage.remove(pole);//quita el pole marcado de la cache
				this.remove_pole_container(id);//agrega el pole marcado a la lista de poles
			}
		}
	}
}

PoleDataManager.prototype.get_pole = function(query){
	var posibles_poles = []
	for(var i in this.data){
		var pole = this.data[i];
		var lat_query = query['lat'];
		var lng_query = query['lng'];
		var distance = this.util.getDistanceFromLocations(pole['lat'],pole['lng'],lat_query,lng_query);
		if(distance<5){
			pole['distance'] = distance;
			posibles_poles.push(pole);	
		}
	}
	if(posibles_poles.length == 1){
		return posibles_poles[0];
	}else if (posibles_poles.length >1){

		posibles_poles.sort(function(a, b) {
    		return a['distance'] - b['distance']
		})
		return posibles_poles[0];		
	
	}else{
		return null;
	}
}

PoleDataManager.prototype.show_selected_poles  = function(polygon){
  var poles_selected = [];
  var id_poles = []
  var self = this;

	$("#btn_mark_tags").click(function(){
		for (var i in self.data){
		var pole = self.data[i];
		var latlng_obj = new google.maps.LatLng(pole.lat,pole.lng);
	    var result = google.maps.geometry.poly.containsLocation(latlng_obj, polygon);
	    if(result){
		    poles_selected.push(pole);
		    //id_poles.push(location.object_id);
		    var id = pole.object_id;
		    self.layer.draw_pole(id);
	  		self.add_pole_container(id,1);
	  		self.storage.save(pole);
	    }
	    $('#modal_message').modal('hide');
		}
	})
  	
  	/*$.ajax({
  	  dataType: "json",
	  url: "/get_tags",
	  data: { 'poles' : id_poles},
	  success: self.populate_list_poles.bind(self),
	  error: function(err){
	  	console.log(err);
	  }
	});*/

}

PoleDataManager.prototype.populate_list_poles = function(poles_tags){
	for(var i in poles_tags){
		this.add_pole_container(poles_tags[i].object_id,1);
	}
}

PoleDataManager.prototype.add_pole_container = function(pole_id,num_tag){
	var pole_div = $("#pole-list").find("[data-id=" + pole_id  + "]");
	if(pole_div.length==0){
		var li = $("<li data-id=" + pole_id  + " class='list-group-item pole-info-item'></li>");
		var id_container = $("<div class='pole-info-id col-md-7 row-flex justify-content-start align-items-center'></div>");
		var id_span = $("<span>Poste N°" + pole_id  + "</span>");
		li.data("id",pole_id);
		li.click(this.show_info_pole);
		var tags_container = $("<div class='pole-info-tags col-md-3 row-flex justify-content-start align-items-center'><button class='btn btn-primary' data-toggle='modal' data-target='#myModal' type='button'>Tags <span class='badge'>" + num_tag + "</span> </button></div>"); 
		$(id_container).append(id_span);
		$(li).append(id_container);
		$(li).append(tags_container);
		$("#pole-list").append(li);
	}
}

PoleDataManager.prototype.remove_pole_container = function(pole_id){
	$("#pole-list").find("[data-id=" + pole_id  + "]").remove();
}

PoleDataManager.prototype.show_info_pole = function(e){
	console.log(e);
}