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
	var api = 'http://api.dohop.com/api/v1/livestore/en/IS/per-country/';
	var url = api.concat(dep,"/",date,"/",date,"?currency=ISK");
	var json = null;
	$.ajax({
        'async': false,
        'global': false,
        'url': url,
        'dataType': "json",
        'success': function (data) {
        	function compare(a,b) {
			  if (a.conv_fare < b.conv_fare)
			    return -1;
			  if (a.conv_fare > b.conv_fare)
			    return 1;
			  return 0;
			}
            json = data;
            json.fares.sort(compare);
        }
    });
    return json;
};

var ffKef = getFares("KEF", "2016-10-09");

var airports = (function () {
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
          "features": airports
      }
  });

  map.addLayer({
      "id": "points",
      "type": "circle",
      "source": "points",
      "paint": {
            'circle-radius': {
                'base': 1.75,
                'stops': [[12, 5], [15, 30]]
            },
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
          "text-size": 8,
          "text-offset": [0, 0.6],
          "text-anchor": "top"
      }
  });
});

// var airportPoints = document.getElementById('points');
// var zoomThreshold = 4;
// map.on('zoom', function() {
//     if (map.getZoom() > zoomThreshold) {
//     	airportPoints.paint.circle-radius = 5;
//     } else {
//         airportPoints.paint.circle-radius = 20;
//     }
// });

var linesSourceID;
map.on('click', function (e) {
    // Use queryRenderedFeatures to get features at a click event's point
    // Use layer option to avoid getting results from other layers
    var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });
    var features2 = map.queryRenderedFeatures({ layers: ['points'] });
    // if there are features within the given radius of the click event,
    // fly to the location of the click event
    if (features.length) {
        // Get coordinates from the symbol and center the map on those coordinates
        map.flyTo({center: features[0].geometry.coordinates});
    }
    var feature = features[0];
    linesSourceID = feature.title + Math.random().toString();

    var fares = getFares(feature.properties.iata, "2016-10-09");
    var featureLines = [];
    fares.fares.forEach(function(elem){
    	var result = $.grep(features2, function(e){
    		if(e.properties.iata == elem.b){
    			return e
    		}
    	});
    	if(result.length != 0){
    		var f = {
	    		type: "Feature",
	    		properties: {
	    			price: elem.conv_fare,
	    			from: elem.a,
	    			to: elem.b
	    		},
	    		geometry: {
	    			type: "LineString",
	    			coordinates: [
	    				[feature.geometry.coordinates[0],feature.geometry.coordinates[1]],
	    				[result[0].geometry.coordinates[0], result[0].geometry.coordinates[1]]
	    			]
	    		}
			};
			featureLines.push(f);
		};
    });

  //   features2.forEach(function(feat){
  //   	var f = {
  //   		type: "Feature",
  //   		properties: {},
  //   		geometry: {
  //   			type: "LineString",
  //   			coordinates: [
  //   				[feature.geometry.coordinates[0],feature.geometry.coordinates[1]],
  //   				[feat.geometry.coordinates[0], feat.geometry.coordinates[1]]
  //   			]
		// 	};
		// };
  //   	featureLines.push(f);
  //   });


	//the source from which the line will be drawn gets added0
	map.addSource(linesSourceID, {
		"type": "geojson",
		"data": {
			"type": "FeatureCollection",
			"features": featureLines
		}
	});

	// map.addSource(sourceID, {
	// 	"type": "geojson",
	// 	"data": {
	// 		"type": "Feature",
	// 		"properties": {},
	// 		"geometry": {
	// 			"type": "LineString",
	// 			"coordinates": [
	// 				//this are the departure airport's coordinates
	// 				[feature.geometry.coordinates[0],feature.geometry.coordinates[1]],
	// 				//this will be the destination airpor's coordinates
	// 				[features2[3].geometry.coordinates[0], features2[3].geometry.coordinates[1]]
	// 				//[-10.49378204345702, 125.83368330777276]
	// 			]	
	// 		}
	// 	}
	// });
	//the layer with the line gets added
	map.addLayer({
		"id": "route",
		"type": "line",
		"source": linesSourceID,
		"layout": {
			"line-join": "round",
			"line-cap": "square"
		},
		"paint": {
			"line-color": "#007cbf",
			"line-width": 3
		}
	});
	//to here is the clicky line stuff
	
	//with this you could add a message to the airports
	//popup.setLngLat(feature.geometry.coordinates)
	//	.setText("hey baby ;)")
	//	.addTo(map);
});

var popup = new mapboxgl.Popup({
			    closeButton: false,
			    closeOnClick: false
			});
// Use the same approach as above to indicate that the symbols are clickable
// by changing the cursor style to 'pointer'.
map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['points', 'route'] });
    map.getCanvas().style.cursor = features.length ? 'pointer' : '';

    var featuresFlights = map.queryRenderedFeatures(e.point, { layers: ["route"] });
    if (!featuresFlights.length) {
        popup.remove();
        return;
    }
        if (featuresFlights.length) {
        	popup.setLngLat(e.lngLat)
        		.setHTML(Math.ceil(featuresFlights[0].properties.price) + " ISK")
        		.addTo(map);
            // map.setFilter("route-hover", ["==", "name", features[0].properties.name]);
        }
});


