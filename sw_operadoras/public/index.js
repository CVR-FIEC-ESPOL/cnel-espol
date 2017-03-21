var pole_data_manager = null;
var drawer = null;
var pole_overlay = null;

var user = "movistar";
var map;
var bounds;
var url = "/get_poles";

var config = { 
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  zoom: 17,
  center: {lat:-2.148018, lng: -79.882666},
  dissipating: true,
  zoomControl: true
}

google.maps.event.addDomListener(window, 'load', function(){
  map = new google.maps.Map(document.getElementById('map'),config);

  bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-5.163956, -81.510653),
    new google.maps.LatLng(1.696088, -74.686098));

  google.maps.event.addListenerOnce(map,"bounds_changed",function() {
    var bounding_box = get_current_bounds();
    get_data(bounding_box,url);
  });

  google.maps.event.addListener(map,'dragend',function(){
    var bounding_box = get_current_bounds();//nuevo bounding box
    get_data(bounding_box,url);
  })

  $('#radio_container input:radio').click(function() {
    if ($(this).val() === '1') {
      bounding = get_current_bounds();
      url = "/get_poles";
      console.log(url);
      get_data(bounding,url);
    } else if ($(this).val() === '2') {
      bounding = get_current_bounds();
      url = "/get_poles_with_tags";
      console.log(url);
      get_data(bounding,url);
    }
  });

});

function get_data(bounding_box,url){
  if(pole_data_manager!=null){
    pole_data_manager.set_bounding_box(bounding_box);//establece nuevo bounding box 
  }else{
    pole_data_manager = new PoleDataManager(bounding_box);//instancia pole_data_manager con las coordenas actuales
    drawer = new Drawer(map);
    drawer.add_observer(pole_data_manager);
  }
  
  pole_data_manager.download(url).then(function(response){
    add_layer(parse_poles(response));
  },function(xhr, status, error){
    console.log(error);
  });
  
  //pole_data_manager.storage.restore();

}


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
    locations.push({'object_id': location.OBJECT_ID ,'lat': parseFloat(location.LAT), 'lng': parseFloat(location.LNG)});
  }


  return locations;
}

function add_layer(locations){
  pole_overlay = new PoleOverlay(map, { 'bounds': bounds }, locations);

  pole_data_manager.set_layer(pole_overlay);
}

