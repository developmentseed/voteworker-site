import React from 'react';
import config from '../config'
import mapboxgl from 'mapbox-gl';

let Map = React.createClass({

  componentDidMount: function () {
    mapboxgl.accessToken = config.accessToken;

    let map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/devseed/cife4hfep6f88smlxfhgdmdkk',
      zoom: 4,
      minZoom: 2,
      doubleClickZoom: false,
      center: [-97.43, 38.54]
    });

    map.on('style.load', function () {
      map.addSource('counties', {
        type: 'vector',
        url: 'mapbox://devseed.66m20amp'
      });
      map.addLayer({
        "id": "county-fill",
        "type": "fill",
        "source": "counties",
        "source-layer": "jursidictions",
        "interactive": true,
        "layout": {},
        "paint": {
          "fill-color": "rgba(138,255,247,0.4)",
          "fill-opacity": 1
        }
      });
      map.addLayer({
        "id": "county-line",
        "type": "line",
        "source": "counties",
        "source-layer": "jursidictions",
        "layout": {},
        "paint": {
          "line-color": "#9fb7bf",
          "line-width": 0.4
        }
      });
      map.addLayer({
        "id": "county-hover",
        "type": "fill",
        "source": "counties",
        "source-layer": "jursidictions",
        "layout": {},
        "paint": {
        "fill-color": "#fff64d",
        "fill-opacity": 0.6
        },
        "filter": ["==", "NAME", ""]
      });
    });

   map.on("click", function(e) {
      map.featuresAt(e.point, {
          radius: 5,
          layers: ["county-fill"]
      }, function (err, features) {
        console.log(features[0].properties.NAME)
        if (!err && features.length) {
          map.setFilter("county-hover", ["==", "NAME", features[0].properties.NAME]);
        } else {
          map.setFilter("county-hover", ["==", "NAME", ""]);
        }
      });
    });

    let usemap = document.querySelector('.usemap');
    let toggle = document.querySelector('.User-Locate-return');

    usemap.addEventListener("click", function(){
      document.querySelector('#Search-container').style.display = 'none';
      toggle.style.display = 'block';
    });

    toggle.addEventListener("click", function(){
      document.querySelector('#Search-container').style.display = 'block';
      toggle.style.display = 'none';
    });

  },

  render: function () {
    return (
      <div id="map"></div>
    );
  }
});

module.exports = Map;
