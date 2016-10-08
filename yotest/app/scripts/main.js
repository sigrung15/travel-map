console.log('\'Allo \'Allo!');

mapboxgl.accessToken = 'pk.eyJ1IjoiYmlya2lyIiwiYSI6ImNpdHp1cDR6YTAwNWkyeW4ycnJtMG41aGkifQ.hVHpiqX8pFDlwbVSfpqZWQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-10, 37.8],
  zoom: 2
});

function getFares(dep, date){
	date = '2016-10-09';
	var api = 'http://api.dohop.com/api/v1/livestore/en/US/per-country/';
	var url = api.concat(dep,"/",date,"/",date);
	var json = null;
	$.ajax({
        'async': false,
        'global': false,
        'url': url,
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
};

var ffKef = getFares("KEF", "2016-10-09")

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
    var feature = features[0];
    var sourceName = feature.properties.name  + Math.random().toString()
			//the source from which the line will be drawn gets added
	map.addSource(sourceName, {
		"type": "geojson",
		"data": {
			"type": "Feature",
			"properties": {},
			"geometry": {
				"type": "LineString",
				"coordinates": [
					//this are the departure airport's coordinates
					[feature.geometry.coordinates[0],feature.geometry.coordinates[1]],
					//this will be the destination airpor's coordinates
					[-10.49378204345702, 125.83368330777276]
				]	
			}
		}
	});
	//the layer with the line gets added
	map.addLayer({
		"id": "route",
		"type": "line",
		"source": sourceName,
		"layout": {
			"line-join": "round",
			"line-cap": "square"
		},
		"paint": {
			"line-color": "#007cbf",
			"line-width": 2
		}
	});
	//to here is the clicky line stuff
	
	//with this you could add a message to the airports
	//popup.setLngLat(feature.geometry.coordinates)
	//	.setText("hey baby ;)")
	//	.addTo(map);
});


// Use the same approach as above to indicate that the symbols are clickable
// by changing the cursor style to 'pointer'.
map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });
    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
});


