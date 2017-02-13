var pole_data_manager = null;
var drawer = null;
var pole_overlay = null;

var user = "movistar";
var map;
var bounds;

var config = { 
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  zoom: 17,
  center: {lat:-2.148018, lng: -79.882666},
  dissipating: true,
  zoomControl: true
}

var url_data = "/data/locations.json";

google.maps.event.addDomListener(window, 'load', function(){
  map = new google.maps.Map(document.getElementById('map'),config);

  bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-5.163956, -81.510653),
    new google.maps.LatLng(1.696088, -74.686098));

  google.maps.event.addListenerOnce(map,"bounds_changed",function() {
    var bounding_box = get_current_bounds();
    
    pole_data_manager = new PoleDataManager(bounding_box);//instancia pole_data_manager con las coordenas actuales

    pole_data_manager.download().then(function(response){
      add_layer(parse_poles(response));
      pole_data_manager.restore();
    },function(err){
      console.log(err);
    });

    drawer = new PolygonDrawer(map);
    drawer.add_observer(pole_data_manager);
  });

  google.maps.event.addListener(map,'dragend',function(){
    if(pole_data_manager!=null){
      var bounding_box = get_current_bounds();//nuevo bounding box
      pole_data_manager.set_bounding_box(bounding_box);//establece nuevo bounding box 
      pole_data_manager.download().then(function(response){//descarga datos dentro del nuevo bounding box
        add_layer(parse_poles(response));
        pole_data_manager.restore();//carga datos marcados desde session storage
      },function(err){
        console.log(err);
      });
    }
  })

});

function get_current_bounds(){
  var ne = map.getBounds().getNorthEast();
  var sw = map.getBounds().getSouthWest();

  var bounding_box = {};
  bounding_box['min_lat'] = sw.lat();
  bounding_box['min_lng'] = sw.lng();
  
  bounding_box['max_lat']= ne.lat();
  bounding_box['max_lng'] = ne.lng();
  
  return bounding_box;
}

function parse_poles(response){
  var poles = response['locations'];
  var locations = [];
  
  for(var i in poles){
    var location = poles[i];
    locations.push({'object_id': location.object_id ,'lat': parseFloat(location.lat), 'lng': parseFloat(location.lng),'marked':false});
  }

  return locations;
}

function add_layer(locations){
  pole_overlay = new PoleOverlay(map, { 'bounds': bounds }, locations);

  pole_data_manager.set_layer(pole_overlay);

  //pole_overlay.observable.remove_observers();
  //pole_overlay.observable.add_observer(pole_data_manager);
}