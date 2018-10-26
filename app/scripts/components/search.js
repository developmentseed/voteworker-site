'use strict';

import React from 'react';
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest';
import { updateInputValue, loadSuggestions, cleanSuggestions } from '../actions';

function getSuggestionValue (suggestion) {
  if (suggestion.type === 'jurisdiction') {
    return `${suggestion.name}, ${suggestion.state_alpha}`;
  }
  return suggestion.name;
}

function renderSuggestion (suggestion) {
  return (
    <span>{getSuggestionValue(suggestion)}</span>
  );
}

class Search extends React.Component {
  constructor (props) {
    super(props);
    this.displayName = 'Search';
    this.onChange = this.onChange.bind(this);
  }

  onChange (event, { newValue }) {
    this.props.updateInputValue(newValue);
  }

  onSuggestionsFetchRequested ({ value }) {
    this.props.loadSuggestions(value);
  }

  onSuggestionsClearRequested () {
    this.props.cleanSuggestions();
  }

  onSuggestionSelected (event, context) {
    if (!context.suggestion.noLink) {
      const prefix = context.suggestion.type == 'state' ? 'states' : 'j';
      this.props.history.push(`/${prefix}/${context.suggestion.id}`);
    }
  }

  componentDidMount () {
    this.props.cleanSuggestions();
  }

  render () {
    const { value, suggestions } = this.props.search;
    const inputProps = {
      placeholder: 'type',
      value,
      onChange: this.onChange
    };

    return (
      <div>
        <div id='Search-container'>
          <div id='Address-Finder'>
            <div className='search-label'>Enter your county, city, zip code or address</div>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionSelected={(event, context) => this.onSuggestionSelected(event, context)}
              onSuggestionsFetchRequested={(value) => this.onSuggestionsFetchRequested(value)}
              onSuggestionsClearRequested={() => this.onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={inputProps}
              focusInputOnSuggestionClick={false}
              ref='searchbox' />
          </div>
        </div>
        <div id='Search-enabler'><img src='/graphics/layout/search.png'></img></div>
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    search: state.search
  };
}

const dispatches = {
  updateInputValue,
  loadSuggestions,
  cleanSuggestions
};

export default connect(mapStateToProps, dispatches)(Search);
