
module.exports.fetchJurisdiction = function fetchJurisdiction (jurisdiction) {
  return { type: 'FETCH_JURISDICTION', data: jurisdiction };
};

module.exports.stateChangeToFalse = function () {
  return { type: 'CANCEL', data: false };
};
