angular.module('starter.directives', [])

.directive('map', function() {

  var map;
  var polyline;

  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(48.4616116, -123.3763815),
          zoom: 13,
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
      }

      function d3init() {
        width = map.getDiv().offsetWidth;
        height = map.getDiv().offsetHeight;

        projection = d3.geo.equirectangular()
          .translate([0,0])
          .scale(57.29578)
          .precision(.1)

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
