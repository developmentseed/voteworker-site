'use strict';

import d3 from 'd3';
import nets from 'nets';

export function fetch (url, callback) {
  nets({
    method: 'get',
    timeout: 2000,
    encoding: undefined,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    url: url
  }, function (err, resp, body) {
    callback(err, resp, body);
  });
};

export function checkUrl (url) {
  let myRe = /(http:\/\/|https:\/\/)/;
  if (!myRe.test(url)) {
    return 'http://' + url;
  } else {
    return url;
  }
};

export function shape (el, geojson) {
  var map = d3.select(el);

  var width = parseInt(map.style('width'), 10);
  var height = parseInt(map.style('height'), 10);

  var vis = map.append('svg')
      .attr('width', width).attr('height', height);

  // create a first guess for the projection
  var center = d3.geo.centroid(geojson);
  var scale = 150;
  var offset = [width / 2, height / 2];
  var projection = d3.geo.mercator().scale(scale).center(center)
      .translate(offset);

  // create the path
  var path = d3.geo.path().projection(projection);

  // using the path determine the bounds of the current map and use
  // these to determine better values for the scale and translation
  var bounds = path.bounds(geojson);
  var hscale = scale * width / (bounds[1][0] - bounds[0][0]);
  var vscale = scale * height / (bounds[1][1] - bounds[0][1]);
  scale = (hscale < vscale) ? hscale : vscale;
  offset = [width - (bounds[0][0] + bounds[1][0]) / 2,
                    height - (bounds[0][1] + bounds[1][1]) / 2];

  // new projection
  projection = d3.geo.mercator().center(center)
    .scale(scale).translate(offset);
  path = path.projection(projection);

  // add a rectangle to see the bound of the svg
  vis.append('rect').attr('width', width).attr('height', height)
    .style('fill', 'none');

  vis.selectAll('path').data([geojson]).enter().append('path')
    .attr('d', path)
    .style('fill', '#ccc')
    .style('stroke-width', '1');
};
