'use strict';

import isEmpty from 'lodash.isempty';
import defaultsDeep from 'lodash.defaultsdeep';
import isNull from 'lodash.isnull';
import omitBy from 'lodash.omitby';
import { connect } from 'react-redux';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Loader from 'react-loader';
import { Choose, When, Otherwise, If } from 'react-conditioner';
import Box from '../components/box';
import Apply from '../components/results/apply';
import Application from '../components/application';
import MoreInfo from '../components/results/info';
import Empty from './404';
import Conditional from '../components/results/conditional';
import { fetchJurisdiction } from '../actions';
import { shape, getUrlName} from '../utils';
import stateJson from '../../states_hash.json';


const NoValue = 'Please contact your local election official for more information';

class Jurisdiction extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      applicationIsShown: false,
      applicaitonIsSubmitted: false
    };

    this.shapeId = 'jurisdictionShape';
    this.showApplication = this.showApplication.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  getJurisdictionId () {
    return this.props.match.params.jurisdictionId;
  }

  showApplication () {
    this.setState({ applicationIsShown: true });
  }

  onSubmit () {
    this.setState({
      applicationIsSubmitted: true,
      applicationIsShown: false
    });
  }

  componentDidMount () {
    this.props.fetchJurisdiction(this.getJurisdictionId());
  }

  componentDidUpdate (prevProps) {
    const oldId = prevProps.match.params.jurisdictionId;
    const newId = this.getJurisdictionId();
    if (oldId !== newId) {
      this.props.fetchJurisdiction(newId);
    }

    const { jurisdiction } = this.props;

    if (jurisdiction.geometry) {
      shape(document.getElementById(this.shapeId), jurisdiction.geometry);
    }
  }

  render () {
    let { jurisdiction, notFound } = this.props;
    let loaded = false;
    let secondColumn;

    if (!isEmpty(jurisdiction)) {
      loaded = true;
    }

    // omit nulls
    jurisdiction = omitBy(jurisdiction, isNull);

    // Set defaults for strings that we're checking
    defaultsDeep(jurisdiction, {
      registration_status: '',
      full_day_req: '',
      training: '',
      complete_training: ''
    });

    if (notFound) {
      return (
        <Empty />
      );
    }

    const fullStateName = stateJson[jurisdiction.state.alpha];

    if (this.state.applicationIsShown) {
      secondColumn = (
        <Application jurisdiction_id={jurisdiction.id} onSubmit={this.onSubmit} />
      );
    } else {
      let message;
      if (this.state.applicationIsSubmitted) {
        message = (
          <div className='callout success' >
            <p>Your email was submitted. Please direct any follow-up messages to your jurisdiction's election officials. Thank you!</p>
          </div>
        );
      }
      if (jurisdiction.display === 'Y') {
        secondColumn = (
          <div>
            {message}

            <If condition={ jurisdiction.registration_status.length > 0}>
              <div className='text-header'>Voter Registration Requirements</div>
              <ul>
                <Choose>
                  <When condition={ jurisdiction.registration_status === 'S' }>
                    <li><p>You must be registered to vote in {fullStateName} to work on Election Day in {jurisdiction.name}.</p></li>
                  </When>
                  <When condition={ jurisdiction.registration_status === 'J' }>
                    <li><p>You must be registered to vote in {jurisdiction.name} to work on Election Day</p></li>
                  </When>
                  <When condition={ jurisdiction.student_website }>
                    <li><p>NOTE: Registration requirements do not apply if your state allows 16 and 17 year old student poll workers.</p></li>
                  </When>
                  <Otherwise>
                    <If condition={ jurisdiction.registration_status.length > 0}>
                      <li><p>{jurisdiction.registration_status}</p></li>
                    </If>
                  </Otherwise>
                </Choose>
              </ul>
            </If>

            <div className='text-header'>Hours and Compensation</div>
            <ul>
              <li>
                <Conditional title='Start Time' value={jurisdiction.hours_start} else={NoValue}/>
              </li>
              <li>
                <Conditional title='End Time' value={jurisdiction.hours_end} else={NoValue} />
              </li>
              <li>
                <Conditional title='Compensation' value={jurisdiction.compensation} else={NoValue} />
              </li>
              <Choose>
                <When condition={ jurisdiction.full_day_req === 'Y' }>
                  <li><p>You must work the full day.</p></li>
                </When>
                <When condition={ jurisdiction.full_day_req === 'N' }>
                  <li><p>Part-day poll worker shifts are available.</p></li>
                </When>
                <Otherwise>
                  <If condition={ jurisdiction.full_day_req.length > 0 }>
                    <li><p>{ jurisdiction.full_day_req }</p></li>
                  </If>
                </Otherwise>
              </Choose>
            </ul>

            <div className='text-header'>Work Requirements</div>
            <ul>
              <li>
                <Conditional title='Minimum Age' value={jurisdiction.minimum_age} else={NoValue} />
              </li>

              <Choose>
                <When condition={ jurisdiction.training === 'Y' }>
                  <li><p>You must attend a training session.</p></li>
                </When>
                <Otherwise>
                  <If condition={ jurisdiction.training.length > 0 }>
                    <li><p>{jurisdiction.training}</p></li>
                  </If>
                </Otherwise>
              </Choose>
              <Choose>
                <When condition={ jurisdiction.complete_training === 'Y' }>
                  <li><p>You must complete training for each election.</p></li>
                </When>
                <When condition={ jurisdiction.complete_training === 'N' }>
                  <li><p>Once you are trained, you do not need to attend training for each election. The local election official will let you know when new training is required.</p></li>
                </When>
                <Otherwise>
                  <If condition={ jurisdiction.complete_training.length > 0}>
                    <li><p>{jurisdiction.complete_training}</p></li>
                  </If>
                </Otherwise>
              </Choose>
              <Choose>
                <When condition={ jurisdiction.training_note }>
                  <li><p><b>Training Details: </b>{jurisdiction.training_note}</p></li>
                </When>
                <Otherwise><span /></Otherwise>
              </Choose>
            </ul>

            <If condition={jurisdiction.further_notes || jurisdiction.trusted_notes}>
              <div className='text-header'>Further Notes</div>
              <p>{jurisdiction.further_notes}</p>
              <p dangerouslySetInnerHTML={{
                __html: jurisdiction.trusted_notes
              }}></p>
            </If>

          </div>
        );
      } else {
        secondColumn = (
          <div>
            {message}
            <p>Workelections.com does not yet have information for this jurisdiction. Please contact your local election official for more information about being a poll worker in this area.</p>
          </div>
        );
      }
    }

    let pageTitle = '';
    let category = '';
    if (jurisdiction.name) {
      pageTitle = `${jurisdiction.name}, ${jurisdiction.state.alpha}`;
      category = `${jurisdiction.state.alpha} - ${jurisdiction.name}`;
    }

    // Results HTML
    return (
      <Box>
        <Loader loaded={loaded}>
          <Helmet>
            <title>{pageTitle}</title>
          </Helmet>
          <div className='results-split-container medium-5 columns'>
            <div className='juris-header'>{pageTitle}</div>
            {jurisdiction.jurisdiction_link
              ? <sub> {jurisdiction.jurisdiction_link_text} <Link to={`/j/${jurisdiction.jurisdiction_link.id}/${getUrlName(jurisdiction.jurisdiction_link.name)}`}>click here.</Link></sub>
              : null}
            <div className='county-image'>
              <div id={this.shapeId}></div>
            </div>
            <MoreInfo url={jurisdiction.website} category={`${category} - moreinfo`} />
            <MoreInfo url={jurisdiction.student_website} value="Student Poll Worker Information" category={`${category} - studentinfo`} />
            <Apply url={jurisdiction.application} email={jurisdiction.email} click={this.showApplication} category={`${category} - application`} />
            <br/>
            <div className='text-header'>Contact Information</div>
            <Conditional title='Phone' value={jurisdiction.telephone} />
            <Conditional title='Email' value={jurisdiction.email} />
            <Conditional title='Office Address' value={jurisdiction.office_address} />
            <Conditional title='Mailing Address' value={jurisdiction.mailing_address} />
          </div>
          <div className='results-split-container medium-6 columns'>
            {secondColumn}
          </div>
        </Loader>
      </Box>
    );
  }
}

function mapStateToProps (state) {
  return {
    jurisdiction: state.jurisdiction.data,
    notFound: state.jurisdiction.notFound
  };
}

export default connect(
  mapStateToProps,
  { fetchJurisdiction }
)(Jurisdiction);
