import nets from 'nets';
import config from './config.js'

module.exports.fetchJurisditction = function fetchJurisditction (id, callback) {
  let fetchHeaders = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  nets({
    method: 'get',
    encoding: undefined,
    headers: {
      "Content-Type": "application/json"
    },
    url: `${config.apiUrl}/jurisdictions/${id}/`
  }, function(err, resp, body) {
    callback(JSON.parse(body))
  })
};
