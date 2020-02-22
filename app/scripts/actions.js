'use strict';

import ky from 'ky';
import url from 'url';
import config from './config.js';

export function receiveJurisdiction (next) {
  return { type: 'RECEIVE_JURISDICTION', next };
}

export function resetJurisdiction () {
  return { type: 'RESET_JURISDICTION' };
}

export function notFoundJurisdiction () {
  return { type: 'NOTFOUND_JURISDICTION' };
}

export function receiveStateJurisdictions (next) {
  return { type: 'RECEIVE_STATE_JURISDICTIONS', next };
}

export function resetStateJurisdictions () {
  return { type: 'RESET_STATE_JURISDICTIONS' };
}

export function receivePages ({ slug, page }) {
  return { type: 'RECEIVE_PAGES', next: { page, slug } };
}

export function notFoundPage ({ slug }) {
  return { type: 'NOTFOUND_PAGE', next: { slug } };
}

export function receiveStates (next) {
  return { type: 'RECEIVE_STATES', next };
}

export function showSurveyModal () {
  return { type: 'SHOW_SURVEY_MODAL' };
}

export function hideSurveyModal () {
  return { type: 'HIDE_SURVEY_MODAL' };
}

export function submitSuveyStarted () {
  return { type: 'SUBMIT_SURVEY_STARTED' };
}

export function submitSuveySucceeded () {
  return { type: 'SUBMIT_SURVEY_SUCCEEDED' };
}

export function submitSuveyFailed () {
  return { type: 'SUBMIT_SURVEY_FAILED' };
}

export function surveyHasMissingFields (fields) {
  return { type: 'SURVEY_MISSING_FIELDS', next: fields };
}

export function updateInputValue (value) {
  return { type: 'UPDATE_INPUT_VALUE', next: value };
}

export function cleanSuggestions () {
  return { type: 'CLEAR_SUGGESTIONS' };
}

export function loadSuggestionsBegin () {
  return { type: 'LOAD_SUGGESTIONS_BEGIN' };
}

export function maybeUpdateSuggestions (suggestions, value) {
  return { type: 'MAYBE_UPDATE_SUGGESTIONS', next: { suggestions, value } };
}

export function submitFormStarted () {
  return { type: 'SUBMIT_FORM_STARTED' };
}

export function submitFormSucceeded () {
  return { type: 'SUBMIT_FORM_SUCCEEDED' };
}

export function submitFormFailed () {
  return { type: 'SUBMIT_FORM_FAILED' };
}

export function formHasMissingFields (fields) {
  return { type: 'FORM_MISSING_FIELDS', next: fields };
}

export function fetchJurisdiction (id) {
  return (dispatch) => {
    dispatch(resetJurisdiction());
    let jurisdiction;
    const geometryUrl = `${config.apiUrl}/jurisdictions/${id}/geojson/`;
    ky.get(`${config.apiUrl}/jurisdictions/${id}/`).json()
      .then((resp) => {
        jurisdiction = resp;
        return ky.get(geometryUrl).json();
      })
      .then((resp) => {
        jurisdiction.geometry = resp;
        dispatch(receiveJurisdiction(jurisdiction));
      })
      .catch((e) => {
        console.log(e);
        dispatch(notFoundJurisdiction());
      });
  };
}

export function fetchStates () {
  return dispatch => {
    ky.get(`${config.apiUrl}/states/`).json()
      .then((resp) => dispatch(receiveStates(resp.results)))
      .catch(console.log);
  };
}

export function fetchPage (slug) {
  return dispatch => {
    ky.get(`${config.apiUrl}/pages/${slug}/`).json()
      .then((resp) => dispatch(receivePages({ slug, page: resp })))
      .catch((e) => {
        console.log(e);
        dispatch(notFoundPage({ slug }));
      });
  };
}

export function fetchStateJurisdictions (stateId) {
  return dispatch => {
    const uri = `${config.apiUrl}/jurisdictions/?summary=true&state_id=${stateId}`;
    ky.get(uri).json()
      .then((resp) => {
        resp.stateId = stateId;
        dispatch(receiveStateJurisdictions(resp));
      })
      .catch(console.log);
  };
}

export function postSurveyResults (values) {
  return (dispatch) => {
    const uri = `${config.apiUrl}/contacts/survey/`;
    ky.post(uri, { json: values }).json()
      .then(() => {
        dispatch(submitSuveySucceeded());
      })
      .catch((e) => dispatch(submitSuveyFailed()));
  };
}

export function postForm (path, values) {
  return (dispatch) => {
    const uri = url.resolve(config.apiUrl, path);
    console.log(uri)
    ky.post(uri, { json: values }).json()
      .then(() => {
        dispatch(submitFormSucceeded());
      })
      .catch((e) => dispatch(submitFormFailed()));
  };
}

export function loadSuggestions (value) {
  return dispatch => {
    dispatch(loadSuggestionsBegin());

    const uri = `${config.apiUrl}/search/`;
    ky.get(`${uri}?q=${value}`).json()
      .then((resp) => dispatch(maybeUpdateSuggestions(resp, value)))
      .catch(console.log);
  };
}
