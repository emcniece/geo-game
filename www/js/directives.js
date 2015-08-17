angular.module('starter.directives', [])

.directive('map', function() {

  var map;
  var polyline;
  var initial_render = false;

  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(48.4616116, -123.3763815),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: mapStyle
        };

        map = new google.maps.Map($element[0], mapOptions);
        polyline = new google.maps.Polyline({
          map: map
        });

        d3init();

        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });


        google.maps.event.addListener(map, 'idle', function(event) {
          if( initial_render) return;

          initial_render = true;
          var bounds = map.getBounds();
          var topLeft = new google.maps.LatLng( map.getBounds().getNorthEast().lat(), map.getBounds().getSouthWest().lng() );
          var topRight = map.getBounds().getNorthEast();
          var btmLeft = map.getBounds().getSouthWest().lat();
          var btmRight = new google.maps.LatLng( map.getBounds().getSouthWest().lat(),map.getBounds().getNorthEast().lng()  );

          var radius = 100 * 1; //radius in meters
          drawHorizontalHexagonGrid(map,topLeft,radius);

        });

      }

      function drawHorizontalHexagonGrid(map,startPosition,radius){

        var cols = 11;
        var rows = 4;

        var curCol = startPosition;
        var curRow = startPosition;
        var width = radius * 2 * Math.sqrt(3)/2;

        for(var k = 0; k<rows; k++){      // Rows
          curCol = google.maps.geometry.spherical.computeOffset(startPosition,width,90);

          for(var i = 0;i < cols; i++){    // Cols
            drawHorizontalHexagon(map,curCol,radius);
            curCol = google.maps.geometry.spherical.computeOffset(curCol, width,90);
          }
        }

      }

      function drawHorizontalHexagon(map,position,radius){
        var coordinates = [];
        for(var angle= 0;angle < 360; angle+=60) {
           coordinates.push(google.maps.geometry.spherical.computeOffset(position, radius, angle));
        }

        // Construct the polygon.
        var polygon = new google.maps.Polygon({
            paths: coordinates,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35
        });
        polygon.setMap(map);
        //map.setCenter(position);


      }

      function d3init() {
        width = map.getDiv().offsetWidth;
        height = map.getDiv().offsetHeight;

        projection = d3.geo.equirectangular()
          .translate([0,0])
          .scale(57.29578)
          .precision(.1);

        context = new PolyLineContext();
        path = d3.geo.path().projection(projection).context(context);
        equator = {type: 'LineString', coordinates: [[-180,20],[-90,0], [0,-20], [90,0], [180,20] ] }

        render();
      }

      function render() {
        polyline.setOptions({
          strokeColor: 'red',
          strokeWeight: 2
        });
        context.setCurrent(polyline.getPath());
        path(equator);
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);

      }
    }
  }
});
