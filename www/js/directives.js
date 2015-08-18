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
          var radius = 100; //radius in meters

          // Render grid
          drawHorizontalHexagonGrid(map,radius);

        });

      }

      function drawHorizontalHexagonGrid(map,radius){

        var bounds = map.getBounds();
        var topLeft = new google.maps.LatLng( map.getBounds().getNorthEast().lat(), map.getBounds().getSouthWest().lng() );
        var topRight = map.getBounds().getNorthEast();
        var btmLeft = map.getBounds().getSouthWest();
        var btmRight = new google.maps.LatLng( map.getBounds().getSouthWest().lat(),map.getBounds().getNorthEast().lng()  );

        //var cols = 11;
        var rows = 4;

        var curCol = topLeft;
        var curRow = topLeft;
        var direction = 90;
        var width = radius * 2 * Math.sqrt(3)/2;

        // Calculate how many columns we can display
        var boundWidth = google.maps.geometry.spherical.computeDistanceBetween(topLeft, topRight);
        var boundHeight = google.maps.geometry.spherical.computeDistanceBetween(topLeft, btmLeft);
        var maxCols = Math.round(boundWidth / width)+1; // adding 1 because the left-most starts half off the screen
        var maxRows = Math.round(boundHeight / width)+1;
        console.log(topLeft, btmLeft, boundHeight, maxRows)

        for(var k=0;k<maxRows;k++){              // Rows

          for(var i = 0;i < maxCols; i++){    // Cols

            // Mark starting column for next row calc
            if(i === 0) startCol = curCol;

            // Draw and increment in 90deg direction (east)
            drawHorizontalHexagon(map,curCol,radius);
            curCol = google.maps.geometry.spherical.computeOffset(curCol, width,90);

          }

          // Increment row (South)
          curCol = google.maps.geometry.spherical.computeOffset(startCol, width,180);

          // Shift horizontally
          direction = (k%2) ? 90 : 270;
          curCol = google.maps.geometry.spherical.computeOffset(curCol, width/2,direction);
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
