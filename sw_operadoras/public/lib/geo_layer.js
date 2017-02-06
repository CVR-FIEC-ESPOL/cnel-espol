

var PoleOverlay = function(map,cfg,data){ 
	this.map = map;
	this.data = data;
  this.setMap(map);
  this.initialize(cfg || {});
  this.observable = new Observable();
};

PoleOverlay.prototype = new google.maps.OverlayView();

PoleOverlay.prototype.initialize = function(cfg){
	this.cfg = cfg;
	//this.bounds_ = cfg.bounds;

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
	var len = data.length;
	var layerProjection = this.getProjection();
	var layerOffset = layerProjection.fromLatLngToDivPixel(topLeft);
	//var valueField = this.cfg.valueField;

	while (len--) {
	  var entry = data[len];
	  //var value = entry.valueField;
	  var latlng = new google.maps.LatLng(entry['lat'], entry['lng']);
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

PoleOverlay.prototype.draw_points = function(tweets,scale){
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

  var svg = d3.select(this.getPanes().overlayMouseTarget).append("div")
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

  svg.selectAll("circle")
    .data(d3.entries(this.data))
    .enter().append("circle")
    .on("click", function(d) {
      that.observable.notify({ 'click': d.value });
      d3.select(this).attr({ fill: "blue", r: 5 });
    })
    .attr("class", "marker")
    .attr('cx',function(d) {
      latlng = new google.maps.LatLng(d.value['lat'], d.value['lng']);
      d = projection.fromLatLngToDivPixel(latlng);
      return d.x-sw.x;
    })
    .attr('cy',function(d) {
      latlng = new google.maps.LatLng(d.value['lat'], d.value['lng']);
      d = projection.fromLatLngToDivPixel(latlng);
      return d.y-ne.y;
    })
    .attr("r",5)
    .attr("fill",function(pole){ 
      if (window.sessionStorage) {
        var id = pole.value['object_id']
        var pole_saved = sessionStorage.getItem(id);
        if(pole_saved){
          return '#0000ff';
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