/**
 * Copyright 2017 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

import { getSummitById }  from '../actions/summit-actions';

import SummitDashboardPage from '../pages/summits/summit-dashboard-page'
import EditSummitPage from '../pages/summits/edit-summit-page'
import EventTypeLayout from './event-type-layout'
import SpeakerAttendanceLayout from './speaker-attendance-layout'
import EventLayout from './event-layout'
import AttendeeLayout from './attendee-layout'
import PromocodeLayout from './promocode-layout'
import EventCategoryLayout from './event-category-layout'
import LocationLayout from './location-layout'
import RsvpTemplateLayout from './rsvp-template-layout'
import TicketTypeLayout from './ticket-type-layout'


class SummitIdLayout extends React.Component {

    componentWillMount() {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(!currentSummit.id || currentSummit.id != summitId){
            this.props.getSummitById(summitId);
        }
    }

    render(){
        let { match, currentSummit } = this.props;

        if (!currentSummit.id) return(<div></div>);

        return(
            <div>
                <Breadcrumb data={{ title: currentSummit.name, pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route path={`${match.url}/speaker-attendances`} {...this.props} component={SpeakerAttendanceLayout}/>
                    <Route path={`${match.url}/events`} component={EventLayout}/>
                    <Route path={`${match.url}/event-types`} component={EventTypeLayout}/>
                    <Route path={`${match.url}/attendees`} component={AttendeeLayout}/>
                    <Route path={`${match.url}/promocodes`} component={PromocodeLayout}/>
                    <Route path={`${match.url}/event-categories`} component={EventCategoryLayout}/>
                    <Route path={`${match.url}/locations`} component={LocationLayout}/>
                    <Route path={`${match.url}/rsvp-templates`} component={RsvpTemplateLayout}/>
                    <Route path={`${match.url}/ticket-types`} component={TicketTypeLayout}/>
                    <Route exact path={`${match.url}/dashboard`} component={SummitDashboardPage}/>
                    <Route exact path={`${match.url}`} component={EditSummitPage}/>
                    <Route render={props => (<Redirect to={`${match.url}/dashboard`}/>)}/>
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit   : currentSummitState.currentSummit
})

export default connect (
    mapStateToProps,
    {
        getSummitById
    }
)(SummitIdLayout);


