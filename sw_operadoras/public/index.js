var user = "movistar";
var map;
var bounds;

var config = { 
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  zoom: 18,
  center: {lat:-2.140870, lng: -79.909108},
  dissipating: true,
  zoomControl: true
}


var Factory = function(div,config){
  this.map = new google.maps.Map(document.getElementById(div),config);
  this.map.setOptions({ minZoom: 16, maxZoom: 20 });
  this.pole_data_manager = null;
  this.drawer = null;
  this.pole_overlay = null;
  this.url = "/get_poles";
}

Factory.prototype.get_current_bounds = function(){
  var ne = this.map.getBounds().getNorthEast();
  var sw = this.map.getBounds().getSouthWest();

  var bounding_box = {};
  bounding_box['min_lat'] = sw.lat();
  bounding_box['min_lng'] = sw.lng();
  
  bounding_box['max_lat']= ne.lat();
  bounding_box['max_lng'] = ne.lng();
  
  return bounding_box;
}

Factory.prototype.init_factory = function(){
  var bounding_box = this.get_current_bounds();
  console.log(bounding_box);

  if(this.pole_data_manager!=null){
    this.pole_data_manager.set_bounding_box(bounding_box);//establece nuevo bounding box 
  }else{
    this.pole_data_manager = new PoleDataManager(bounding_box);//instancia pole_data_manager con las coordenas actuales
    this.drawer = new Drawer(this.map);
    this.drawer.add_observer(this.pole_data_manager);
  }
}

Factory.prototype.init_overlay_map = function(locations){
  var bounds = this.get_current_bounds();
  console.log("bounds",bounds);
  //this.pole_overlay = new PoleOverlay(this.map, { 'bounds': bounds }, locations);
  if(this.pole_overlay!=null){
    var markers = this.pole_overlay.markers;
    this.pole_overlay = new PoleOverlay(this.map, { 'bounds': bounds }, locations);
    this.pole_overlay.markers = markers;
  }else{
    this.pole_overlay = new PoleOverlay(this.map, { 'bounds': bounds }, locations);
  }
  this.pole_data_manager.set_layer(this.pole_overlay);
}

Factory.prototype.retrieve_pole_data = function(){
  var self = this;

  this.pole_data_manager.download(this.url).then(function(response){
    var locations = self.parse_poles(response);
    console.log(locations);
    
    self.pole_data_manager.data = locations;
    self.init_overlay_map(locations);
    self.pole_data_manager.get_poles();

    setTimeout(function(){ 
      self.pole_data_manager.mark_poles(); 
    }, 1000);

  },function(xhr, status, error){
    console.log(error);
    alert(error);
  });
}

Factory.prototype.parse_poles = function(response){
  var poles = response['locations'];
  var locations = [];
  for(var i in poles){
    var location = poles[i];
    locations.push({
      'CODE': location.CODE,
      'OBJECT_ID': location.OBJECT_ID,
      'LAT': parseFloat(location.LAT), 
      'LNG': parseFloat(location.LNG)
    });
  }
  return locations;
}

Factory.prototype.save_tags = function(){
  var self = this;

  $("#tags_form").on('submit', function (e) {
    var $inputs = $('#tags_form :input');
    var d_array = []; var form = {}

    $inputs.each(function() {
      tag = {};
      tag['name'] = this.name;
      tag['value'] = $(this).val();
      tag['checked'] = this.checked;
      d_array.push(tag);
    });

    form['tags'] = []
    for(var i in d_array){
      var data = d_array[i];
      if(data["name"]=="object_id"){
        form['object_id'] = data["value"];
      }else{
        form['tags'].push({ 'checked': data["checked"] , 'value': data["value"] });
      }
    }
    $.ajax({    
      type: 'POST',
      url: '/save_tags', 
      data: form,
      success: function(){
        $("#pole_modal").modal('hide');
        var object_id = form['object_id'];
        var id="num_tags_" + object_id;
        var num_tags = $('#tags_form').serializeArray().length - 1;
        $("[data-id=" + id + "]").html(num_tags);
        switch(num_tags){
          case 0:
            alert('No hay tags registrados en el poste ' + form['object_id']);
            self.pole_overlay.draw_pole(form['object_id'],"#ff6961");
            self.pole_data_manager.storage.remove(form['object_id']);
            self.pole_data_manager.remove_pole_container(form['object_id']);
            break;
          case 1:
            alert('El Poste ' + form['object_id'] + " ha registrado un tag" );
            self.pole_overlay.draw_pole(form['object_id'],'blue');
            self.pole_data_manager.storage.remove(form['object_id']);
            break;
          default:
            alert('El Poste ' + form['object_id'] + " ha registrado " + num_tags + " tags " );
            self.pole_overlay.draw_pole(form['object_id'],'blue');
            self.pole_data_manager.storage.remove(form['object_id']);
            break;
        }
      }
    });
    e.preventDefault();
  });
}


google.maps.event.addDomListener(window, 'load', function(){
  var builder = new Factory('map',config);
  
  google.maps.event.addListenerOnce(builder.map,"bounds_changed",function(){
    builder.init_factory();
    builder.retrieve_pole_data();
  });

  google.maps.event.addListener(builder.map,"dragend",function(){
    builder.init_factory();
    builder.retrieve_pole_data();
  });

  google.maps.event.addListener(builder.map,'zoom_changed', function() {
    builder.init_factory();
    builder.retrieve_pole_data();
  });
  

  google.maps.event.addListener(builder.map, 'idle',function(){
    builder.init_factory();
    builder.retrieve_pole_data();
  })

  builder.save_tags();
  
  $("#close_session").on('click', function (e) {
    alert("Cerrar sesion");
    $.ajax({    
      type: 'GET',
      url: '/close_session',
      success: function(results){
        window.location.href = "/";
      }
    });
  });

})


