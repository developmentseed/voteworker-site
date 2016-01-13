'use strict';

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchStates } from '../actions/action';

let States = React.createClass({
  propTypes: {
    states: React.PropTypes.array,
    dispatch: React.PropTypes.func,
    params: React.PropTypes.object
  },

  componentDidMount: function () {
    if (this.props.states.length === 0) {
      this.props.dispatch(fetchStates());
    }
  },

  render: function () {
    let { states } = this.props;
    let list = [];

    if (this.props.params.state_id && states.length > 0) {
      let obj = _.find(states, {'id': parseInt(this.props.params.state_id)});
      list.push(<p key={obj.id}><Link to={`/states/${obj.id}`}>{obj.name}</Link></p>)
    } else {
      for (let i in states) {
        list.push(<p key={states[i].id}><Link to={`/states/${states[i].id}`}>{states[i].name}</Link></p>);
      }
    }

    // Results HTML
    return (
      <div className='large'>
        <div id='results-container'>
          <br />
          <div className='columns medium-centered'>
            <div className='results-sub-container columns large medium-centered row'>
              <div className='results-split-container medium-5 columns'>
              {list}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

});

function mapStateToProps (state) {
  // Check if it is state or county

  return {
    states: state.states
  };
}

export default connect(mapStateToProps)(States);