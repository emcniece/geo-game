function PolyLineContext() {
  this.currentPath = null;
  this.currentIndex = 0;
}

PolyLineContext.prototype.beginPath = function(){};
PolyLineContext.prototype.moveTo = function(x,y){
  if(this.currentPath){
    var latLng = new google.maps.LatLng(y,x);
    this.currentPath.setAt(this.currentIndex, latLng);
    this.currentIndex++;
  }
}
PolyLineContext.prototype.lineTo = function(x,y){
  if(this.currentPath){
    var latLng = new google.maps.LatLng(y,x);
    this.currentPath.setAt(this.currentIndex, latLng);
    this.currentIndex++;
  }
}
PolyLineContext.prototype.arc = function(x,y,radius,startAngle,endAngle){};
PolyLineContext.prototype.closePath = function(){};

PolyLineContext.prototype.setCurrent = function (path) {
    this.currentPath = path;
};