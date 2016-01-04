import _ from 'lodash';
import geo from 'mapbox-geocoding';
import React from 'react';
import config from '../config'
import store from '../store'
import nets from 'nets';
import { pushPath } from 'redux-simple-router'
import Autosuggest from 'react-autosuggest';

let juris = {}

let Search = React.createClass({

  getSuggestions: function (input, callback) {
    let options = new Set();
    geo.setAccessToken(config.accessToken);
    geo.geocode('mapbox.places', input, function (err, geoData) {
      if (geoData){
        for (let i = 0; i < geoData.features.length; i++) {
          let coords = geoData.features[i].geometry.coordinates
          nets({
            method: 'get',
            encoding: undefined,
            headers: {
              "Content-Type": "application/json"
            },
            url: `${config.apiUrl}/jurisdictions/?contains=${coords.toString()}`
          }, function(err, resp, body) {
            let results = JSON.parse(body).results;
            for (let j = 0; j < results.length; j++) {
              juris[results[j].name] = results[j].id;
              options.add(results[j].name)
            }
            callback(null, Array.from(options));
          });

        }


      }

    });
  },

  onSuggestionSelected: function (value, event) {
    console.log('hi')
    store.dispatch(pushPath(`jurisdictions/${juris[value]}`))
  },

  render: function () {
    return (
      <div>
        <div id='Search-container'>
          <div id="Address-Finder">
            <div className="center-text"></div>
            <Autosuggest suggestions={this.getSuggestions} onSuggestionSelected={this.onSuggestionSelected}/>
            <div className="usemap">Locate via map</div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Search;
