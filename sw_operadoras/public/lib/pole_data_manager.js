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
	this.storage = new PoleStorage();
	console.log("storage", this.storage);
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
				var id = pole['OBJECT_ID'];//recibir el id del poste seleccionado
				if(!id || id == 'undefined'){
					return;
				}
				this.layer.draw_pole(id);
				this.storage.save(id,[]);//almacena el pole marcado en la cache
				this.add_pole_container(id,0);//agrega el pole marcado a la lista de poles
			}
		}
		if('disable_marker_location' in data){
			var query = data['disable_marker_location'];
			var pole = this.get_pole(query);
			if(pole!=null){
				var id = pole['OBJECT_ID'];//recibir el id del poste seleccionado
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
		var distance = this.util.getDistanceFromLocations(pole['LAT'],pole['LNG'],lat_query,lng_query);
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
				self.storage.save(id);
			}
			$('#modal_message').modal('hide');
		}
	})
  	

}

PoleDataManager.prototype.populate_list_poles = function(poles_tags){
	for(var i in poles_tags){
		this.add_pole_container(poles_tags[i].object_id,1);
	}
}

PoleDataManager.prototype.add_pole_container = function(pole_id,num_tag){
	var pole_div = $("#pole-list").find("[data-id=" + pole_id  + "]");
	var self = this;
	if(pole_div.length==0){
		var li = $("<li data-id=" + pole_id  + " class='list-group-item pole-info-item'></li>");
		var id_container = $("<div class='pole-info-id col-md-7 row-flex justify-content-start align-items-center'></div>");
		var id_span = $("<span>Poste N°" + pole_id  + "</span>");
		li.data("id",pole_id);
		li.click(function(){
			var object_id = $(this).data("id");
			self.show_info_pole(self,object_id);
		});
		var tags_container = $("<div class='pole-info-tags col-md-3 row-flex justify-content-start align-items-center'><button class='btn btn-primary' data-toggle='modal' data-target='#pole_modal' type='button'>Tags <span class='badge'>" + num_tag + "</span> </button></div>"); 
		
		console.log(li);

		$(id_container).append(id_span);
		$(li).append(id_container);
		$(li).append(tags_container);
		$("#pole-list").append(li);
	}
}

PoleDataManager.prototype.remove_pole_container = function(pole_id){
	$("#pole-list").find("[data-id=" + pole_id  + "]").remove();
}

PoleDataManager.prototype.show_info_pole = function(self,object_id){
	$.ajax({
  	  dataType: "json",
	  url: "/get_tags/" + object_id,
	  success: function(results){
	  	var tags = 	JSON.parse(results);
	  	if(Object.keys(tags).length === 0){
	  		console.log("no hay tags");
	  		self.add_tags(object_id,[]);
	  	}else{
	  		self.add_tags(object_id,tags);
	  	}
	  },
	  error: function(err){
	  	console.log(err);
	  }
	});

}

PoleDataManager.prototype.add_tags = function(object_id,tags){
	$("#tags-list").empty();

	var objectid_container = $('<input type="hidden" name="object_id" value=' +  object_id + ' >');
	$("#tags-list").append(objectid_container);
	var tag_container = "";

	if(tags.length > 0){
		for(var i in tags){
			console.log(tags[i]);
			var tag_id = tags[i]['TAG'];
			var operadora_id = tags[i]['OPERADORA_ID'];
			var li = $("<li class='list-group-item'></li>");
			var div = $("<div class='checkbox'></div>");
			name = "tag_" + tag_id;
			if(operadora_id == -1){
				tag_container = "<label><input type='checkbox' name=" + name  + " value=" + tag_id + " >Tag" + tag_id + "</label>";
			}else{
				tag_container = "<label><input type='checkbox' name=" + name  + " value=" + tag_id + " checked >Tag" + tag_id + "</label>";
			}
			$(div).append(tag_container);
			$(li).append(div);
			$("#tags-list").append(li);
		}
	}
	var li = $("<li data-id='tag_virtual' class='list-group-item'></li>");
	var div = $("<div class='checkbox'></div>");
	var tag_container = '<label><input type="checkbox" name="tag_virtual" value="0" >Tag Virtual</label>'
	$(div).append(tag_container);
	$(li).append(div);
	$("#tags-list").append(li);

}

PoleDataManager.prototype.restore = function(){
	var id_poles = this.storage.get_keys();
	console.log("restore",id_poles);
	
	for(var i in id_poles){
		var id = id_poles[i];
		var tags = this.storage.get_pole(id);
		console.log(tags);
		if(tags!=null){
			var num_tags = tags.length;
			this.add_pole_container(id,num_tags);
		}else{
			this.add_pole_container(id,0);
		}
		/*
		var pole = poles[id];
		console.log(pole);
		var tags = JSON.parse(sessionStorage.getItem(id));
		console.log(tags);
		*/
	}	
}