/* global localStorage */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { routeReducer, UPDATE_PATH } from 'redux-simple-router';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

const initialState = {
  jurisdiction: {
    id: null
  },
  stateChange: {
    status: false
  }
};


const jurisdiction = function (state = {}, action) {
  switch (action.type) {
    case 'FETCH_JURISDICTION':
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
};

const stateChange = function (state = {}, action) {
  switch (action.type) {
    case UPDATE_PATH:
      return Object.assign({}, state, {status: true});
    case 'CANCEL':
      return Object.assign({}, state, {status: action.data})
    default:
      return state;
  }
}


const rootReducer = combineReducers({
  jurisdiction,
  stateChange,
  routing: routeReducer
});

export default createStoreWithMiddleware(rootReducer, initialState);
