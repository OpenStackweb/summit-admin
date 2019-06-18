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
import T from "i18n-react/dist/i18n-react";

import { getSummitById, resetSummitForm }  from '../actions/summit-actions';

import SummitDashboardPage from '../pages/summits/summit-dashboard-page'
import EditSummitPage from '../pages/summits/edit-summit-page'
import EditSelectionPlanPage from '../pages/summits/edit-selection-plan-page'
import EventTypeLayout from './event-type-layout'
import SpeakerAttendanceLayout from './speaker-attendance-layout'
import EventLayout from './event-layout'
import AttendeeLayout from './attendee-layout'
import PromocodeLayout from './promocode-layout'
import EventCategoryLayout from './event-category-layout'
import EventCategoryGroupLayout from './event-category-group-layout'
import LocationLayout from './location-layout'
import RsvpTemplateLayout from './rsvp-template-layout'
import TicketTypeLayout from './ticket-type-layout'
import PushNotificationLayout from './push-notification-layout'
import RoomOccupancyLayout from './room-occupancy-layout'
import TagGroupLayout from './tag-group-layout'
import ReportsLayout from './reports-layout'
import NoMatchPage from "../pages/no-match-page";


class SummitIdLayout extends React.Component {

    componentDidMount() {
        let summitId = this.props.match.params.summit_id;

        if (!summitId) {
            this.props.resetSummitForm();
        } else {
            this.props.getSummitById(summitId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.summit_id;
        let newId = newProps.match.params.summit_id;

        if (newId != oldId) {
            if (!newId) {
                this.props.resetSummitForm();
            } else {
                this.props.getSummitById(newId);
            }
        }
    }

    render(){
        let { match, currentSummit } = this.props;
        let summitId = this.props.match.params.summit_id;
        let breadcrumb = currentSummit.id ? currentSummit.name : T.translate("general.new_summit");

        if (!currentSummit.id || summitId != currentSummit.id) return (<div></div>);

        return(
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route strict exact path={`${match.url}/dashboard`} component={SummitDashboardPage} />
                    <Route strict exact path={match.url} component={EditSummitPage} />
                    <Route path={`${match.url}/events`} component={EventLayout}/>
                    <Route path={`${match.url}/event-types`} component={EventTypeLayout}/>
                    <Route path={`${match.url}/event-categories`} component={EventCategoryLayout}/>
                    <Route path={`${match.url}/event-category-groups`} component={EventCategoryGroupLayout}/>
                    <Route path={`${match.url}/attendees`} component={AttendeeLayout}/>
                    <Route path={`${match.url}/speaker-attendances`} component={SpeakerAttendanceLayout}/>
                    <Route path={`${match.url}/locations`} component={LocationLayout}/>
                    <Route path={`${match.url}/rsvp-templates`} component={RsvpTemplateLayout}/>
                    <Route path={`${match.url}/promocodes`} component={PromocodeLayout}/>
                    <Route path={`${match.url}/ticket-types`} component={TicketTypeLayout}/>
                    <Route path={`${match.url}/push-notifications`} component={PushNotificationLayout}/>
                    <Route path={`${match.url}/room-occupancy`} component={RoomOccupancyLayout}/>
                    <Route path={`${match.url}/tag-groups`} component={TagGroupLayout}/>
                    <Route path={`${match.url}/reports`} component={ReportsLayout}/>
                    <Route path={`${match.url}/selection-plans`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_selection_plan.selection_plans"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/new`} component={EditSelectionPlanPage} />
                                    <Route strict exact path={`${props.match.url}/:selection_plan_id(\\d+)`} component={EditSelectionPlanPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route component={NoMatchPage}/>
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
        getSummitById,
        resetSummitForm
    }
)(SummitIdLayout);


