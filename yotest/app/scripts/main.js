console.log('\'Allo \'Allo!');

mapboxgl.accessToken = 'pk.eyJ1IjoiYmlya2lyIiwiYSI6ImNpdHp1cDR6YTAwNWkyeW4ycnJtMG41aGkifQ.hVHpiqX8pFDlwbVSfpqZWQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-96, 37.8],
  zoom: 3
});

var json = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'someAirports.json',
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();


map.on('load', function () {
  map.addSource("points", {
      "type": "geojson",
      "data": {
          "type": "FeatureCollection",
          "features": json
      }
  });

  map.addLayer({
      "id": "points",
      "type": "circle",
      "source": "points",
      // "layout": {
      //     "icon-image": "{icon}-15",
      //     "text-field": "{iata}",
      //     "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      //     "text-offset": [0, 0.6],
      //     "text-anchor": "top"
      // },
      "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
      }
  });
  map.addLayer({
      "id": "points-data",
      "type": "symbol",
      "source": "points",
      "layout": {
          "icon-image": "{icon}-15",
          "text-field": "{iata}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0.6],
          "text-anchor": "top"
      }
  });
});


map.on('click', function (e) {
    // Use queryRenderedFeatures to get features at a click event's point
    // Use layer option to avoid getting results from other layers
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });
    // if there are features within the given radius of the click event,
    // fly to the location of the click event
    if (features.length) {
        // Get coordinates from the symbol and center the map on those coordinates
        map.flyTo({center: features[0].geometry.coordinates});
    }
});


// Use the same approach as above to indicate that the symbols are clickable
// by changing the cursor style to 'pointer'.
map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });
    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
});


