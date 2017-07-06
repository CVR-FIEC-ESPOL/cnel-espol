

var PoleOverlay = function(map,cfg,data){ 
	this.map = map;
	this.data = data;
  this.setMap(map);
  this.initialize(cfg || {});
  this.markers = [];
  //this.observable = new Observable();
};

PoleOverlay.prototype = new google.maps.OverlayView();

PoleOverlay.prototype.rebuild = function(map,cfg,locations){
  this.map = map;
  this.cfg = cfg;
  this.data = locations;
  this.setMap(this.map);
  this.initialize(this.cfg);
}

PoleOverlay.prototype.initialize = function(cfg){
	this.cfg = cfg;
	//this.bounds_ = cfg.bounds;
  this.svg = null
  var map = this.map = this.getMap();
  var container = this.container = document.createElement('div');
  var mapDiv = map.getDiv();
  var width = this.width = mapDiv.clientWidth;
  var height = this.height = mapDiv.clientHeight;

  container.style.cssText = 'width:' + width +'px;height:' + height+'px;';

  this.max = 1;
  this.min = 0;

  cfg.container = container;
}

/*PoleOverlay.prototype = Object.create(Observable.prototype);*/

PoleOverlay.prototype.handleBoundsChanged = function(){
  console.log("hola mundo");
  //this.draw();
  //
  
  //this.onAdd();
}

PoleOverlay.prototype.onAdd = function() {

  var div = document.createElement('div');
  div.id = "my-container";
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';
  this.div = div;

  var that = this;
  google.maps.event.addListener(this.map,'bounds_changed',function() { 
    return that.update(); 
  });
  
  this.draw();

};

PoleOverlay.prototype.draw = function() {
  // We use the south-west and north-east
  // coordinates of the overlay to peg it to the correct position and size.
  // To do this, we need to retrieve the projection from the overlay.
  // Retrieve the south-west and north-east coordinates of this overlay
  // in LatLngs and convert them to pixel coordinates.
  // We'll use these coordinates to resize the div.
  var zoom, scale, bounds, topLeft;
  bounds = this.map.getBounds();
  topLeft = new google.maps.LatLng(
    bounds.getNorthEast().lat(),
    bounds.getSouthWest().lng()
  );

  zoom = this.map.getZoom();
  scale = Math.pow(2, zoom);
  var latLngPoints = this.project(topLeft,this.data);
  
  this.draw_points(latLngPoints,scale);
};

PoleOverlay.prototype.project = function(topLeft,data){
	var latLngPoints = [];
	// iterate through data 
  var bounds = this.map.getBounds();
	var len = data.length;
	var layerProjection = this.getProjection();
	var layerOffset = layerProjection.fromLatLngToDivPixel(topLeft);
	//var valueField = this.cfg.valueField;

	while (len--) {
	  var entry = data[len];
	  //var value = entry.valueField;
	  var latlng = new google.maps.LatLng(entry['LAT'], entry['LNG']);
	  // we don't wanna render points that are not even on the map ;-)
	  if (!bounds.contains(latlng)) {
	    continue;
	  }
	  var point = layerProjection.fromLatLngToDivPixel(latlng);
	  //var latlngPoint = { x: Math.round(point.x - layerOffset.x), y: Math.round(point.y - layerOffset.y) , valueField : value};
	  var latlngPoint = { x: Math.round(point.x ), y: Math.round(point.y)};
    latLngPoints.push(latlngPoint);
	}
	return latLngPoints;
}

PoleOverlay.prototype.zoom_pole = function(object_id){
  var map = this.map
  var self = this;
  console.log(this.markers);

  for(var i in this.markers){
    this.markers[i].setMap(null);
  }

  d3.selectAll("circle").each( function(d, i){
    if(d.value['OBJECT_ID'] == object_id){
      //alert(d.value['OBJECT_ID']);
      var latlng = new google.maps.LatLng(d.value['LAT'], d.value['LNG']);
      map.setCenter(latlng);
      map.setZoom(20);
      
      var marker = new google.maps.Marker({
        position: latlng,
        map: map
      });

      self.markers.push(marker);

      var infowindow = new google.maps.InfoWindow({
        content: "<div style='overflow:hidden; font-size:8px;' > <h1> Poste " + d.value['CODE'] + "</h1></div>"
      });
      infowindow.open(map, marker);
      
      marker.addListener('click', function() {
        
      });
      
    }
  });
}

PoleOverlay.prototype.draw_pole = function(object_id,color){
  d3.selectAll("circle").each( function(d, i){
    if(d.value['OBJECT_ID'] == object_id){
      d3.select(this).attr({ fill: color, r: 5 });
    }
  });
}

PoleOverlay.prototype.delete_pole = function(object_id){
  d3.selectAll("circle").each( function(d, i){
    if(d.value['OBJECT_ID'] == object_id){
      d3.select(this).attr({ fill: "#ff6961", r: 5 });
    }
  });
}


PoleOverlay.prototype.draw_points = function(scale){
	//var svg_element = document.createElementNS('http://www.w3.org/2000/svg','svg');
	//svg_element.setAttribute("id","mysvg");
  $('#my-container').remove();
  var that = this;
	var width = 650,
	height = 700;

  var bounds = this.map.getBounds();
  var projection = this.getProjection(),
    padding = 10,
    sw = projection.fromLatLngToDivPixel(bounds.getSouthWest()),
    ne = projection.fromLatLngToDivPixel(bounds.getNorthEast());
      // extend the boundaries so that markers on the edge aren't cut in half
    sw.x -= padding;
    sw.y += padding;
    ne.x += padding;
    ne.y -= padding;

  this.svg = d3.select(this.getPanes().overlayLayer).append("div")
  .attr('id','my-container')
  .append("svg")
  .attr("class", "locations")
  .attr("id","pole_overlay")
  //.attr("width", width)
  //.attr("height", height)
  .attr('width',(ne.x - sw.x) + 'px')
  .attr('height',(sw.y - ne.y) + 'px')
  .style('position','absolute')
  .style('left',sw.x+'px')
  .style('top',ne.y+'px');

  this.svg.selectAll("circle")
    .data(d3.entries(this.data))
    .enter().append("circle")
    .attr("data-id",function(pole){
      return pole.value['OBJECT_ID'];
    })
    .attr("class", "marker")
    .attr('cx',function(d) {
      latlng = new google.maps.LatLng(d.value['LAT'], d.value['LNG']);
      d = projection.fromLatLngToDivPixel(latlng);
      return d.x-sw.x;
    })
    .attr('cy',function(d) {
      latlng = new google.maps.LatLng(d.value['LAT'], d.value['LNG']);
      d = projection.fromLatLngToDivPixel(latlng);
      return d.y-ne.y;
    })
    .attr("r",5)
    .attr("fill",function(pole){ 
      if (window.sessionStorage) {
        var id = String(pole.value['OBJECT_ID']);
        var poles = JSON.parse(sessionStorage.getItem("poles"));
        var pole_saved = poles[id];
        if(pole_saved){
          return 'green';
        }
      }
      return '#ff6961';
    });
}

PoleOverlay.prototype.update = function() {
  //d3.select("#pole_overlay").remove();
  //$('#my-container').empty();
  this.draw();
};