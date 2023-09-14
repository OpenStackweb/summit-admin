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
import { Switch, Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";

import { getSummitById, resetSummitForm, getAllSummits }  from '../actions/summit-actions';
import {getUserRolesBySummit} from "../actions/user-chat-roles-actions";

import SummitDashboardPage from '../pages/summits/summit-dashboard-page'
import EditSummitPage from '../pages/summits/edit-summit-page'
import SelectionPlanLayout from './selection-plan-layout'
import EventTypeLayout from './event-type-layout'
import SpeakerAttendanceLayout from './speaker-attendance-layout'
import EventLayout from './event-layout'
import AttendeeLayout from './attendee-layout'
import PromocodeLayout from './promocode-layout'
import EventCategoryLayout from './event-category-layout'
import EventCategoryGroupLayout from './event-category-group-layout'
import LocationLayout from './location-layout'
import SignagePage from '../pages/signage'
import RsvpTemplateLayout from './rsvp-template-layout'
import TicketTypeLayout from './ticket-type-layout'
import TaxTypeLayout from './tax-type-layout'
import RefundPolicyListPage from '../pages/tickets/refund-policy-list-page'
import PushNotificationLayout from './push-notification-layout'
import RoomOccupancyLayout from './room-occupancy-layout'
import TagGroupLayout from './tag-group-layout'
import ReportsLayout from './reports-layout'
import RoomBookingsLayout from './room-bookings-layout';
import RoomBookingAttributeLayout from './room-booking-attribute-layout';
import BadgeFeatureLayout from './badge-feature-layout'
import AccessLevelLayout from './access-level-layout'
import BadgeTypeLayout from './badge-type-layout'
import PurchaseOrderLayout from './purchase-order-layout'
import OrderExtraQuestionLayout from './order-extra-question-layout'
import SponsorLayout from './sponsor-layout'
import SummitSponsorshipLayout from './summit-sponsorship-layout'
import BadgeScansListPage from '../pages/sponsors/badge-scans-list-page';
import NoMatchPage from '../pages/no-match-page';
import TicketListPage from "../pages/tickets/ticket-list-page";
import MarketingLayout from "./marketing-layout";
import PaymentProfileLayout from "./payment-profile-layout";
import SummitDocsLayout from "./summitdocs-layout";
import EmailFlowEventLayout from "./email-flow-event-layout";
import RegistrationInvitationLayout from "./registration-invitation-layout";
import MediaUploadLayout from "./media-upload-layout";
import ScheduleSettingsLayout from "./schedule-settings-layout";
import FeaturedSpeakersPage from '../pages/summit_speakers/featured-speakers-page';
import TrackChairsLayout from "./track-chairs-layout";
import SummitPresentationsVotesPage from "../pages/events/summit-presentations-votes-page";
import RegistrationCompaniesLayout from './registration-companies-layout';
import SummitSpeakersLayout from './summit-speakers-layout';
import ViewTypeLayout from './view-type-layout'
import RegistrationStatsPage from '../pages/registration/registration-stats-page'
import AuditLogPage from '../pages/audit-log/audit-log-page'
import SubmissionInvitationLayout from "./submission-invitation-layout";
import RegFeedMetadataLayout from './reg-feed-metadata-layout';
import { getMarketingSettingsForRegLite, getMarketingSettingsForPrintApp } from '../actions/marketing-actions';
import { getRegFeedMetadataBySummit } from '../actions/reg-feed-metadata-actions';

class SummitIdLayout extends React.Component {

    componentDidMount() {
        let summitId = this.props.match.params.summit_id;

        if (!summitId) {
            this.props.resetSummitForm();
        } else {
            this.props.getSummitById(summitId).then(() => {
                this.props.getMarketingSettingsForRegLite();
                this.props.getMarketingSettingsForPrintApp();
                this.props.getUserRolesBySummit();
                this.props.getRegFeedMetadataBySummit();
            });
            // this is needed for summit dropdown, runs on background
            this.props.getAllSummits();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        const oldId = prevProps.match.params.summit_id;
        const newId = this.props.match.params.summit_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetSummitForm();
            } else {
                this.props.getSummitById(newId);
            }
        }
    }

    render(){
        const { match, currentSummit,loading } = this.props;
        let summitId = this.props.match.params.summit_id;
        let breadcrumb = currentSummit.id ? currentSummit.name : T.translate("general.new_summit");

        if (!currentSummit.id || parseInt(summitId) !== currentSummit.id || loading) return (<div />);

        return(
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />

                <Switch>
                    <Route strict exact path={`${match.url}/dashboard`} component={SummitDashboardPage} />
                    <Route strict exact path={match.url} component={EditSummitPage} />
                    <Route path={`${match.url}/room-booking-attributes`} component={RoomBookingAttributeLayout}/>
                    <Route path={`${match.url}/events`} component={EventLayout}/>
                    <Route path={`${match.url}/voteable-presentations`} component={SummitPresentationsVotesPage}/>
                    <Route path={`${match.url}/event-types`} component={EventTypeLayout}/>
                    <Route path={`${match.url}/event-categories`} component={EventCategoryLayout}/>
                    <Route path={`${match.url}/event-category-groups`} component={EventCategoryGroupLayout}/>
                    <Route path={`${match.url}/attendees`} component={AttendeeLayout}/>
                    <Route path={`${match.url}/speaker-attendances`} component={SpeakerAttendanceLayout}/>
                    <Route path={`${match.url}/speakers`} component={SummitSpeakersLayout}/>
                    <Route path={`${match.url}/featured-speakers`} component={FeaturedSpeakersPage}/>
                    <Route path={`${match.url}/locations`} component={LocationLayout}/>
                    <Route path={`${match.url}/signage`} component={SignagePage}/>
                    <Route path={`${match.url}/rsvp-templates`} component={RsvpTemplateLayout}/>
                    <Route path={`${match.url}/promocodes`} component={PromocodeLayout}/>
                    <Route path={`${match.url}/ticket-types`} component={TicketTypeLayout}/>
                    <Route path={`${match.url}/tax-types`} component={TaxTypeLayout}/>
                    <Route path={`${match.url}/refund-policies`} component={RefundPolicyListPage}/>
                    <Route path={`${match.url}/payment-profiles`} component={PaymentProfileLayout}/>
                    <Route path={`${match.url}/room-bookings`} component={RoomBookingsLayout}/>
                    <Route path={`${match.url}/push-notifications`} component={PushNotificationLayout}/>
                    <Route path={`${match.url}/room-occupancy`} component={RoomOccupancyLayout}/>
                    <Route path={`${match.url}/tag-groups`} component={TagGroupLayout}/>
                    <Route path={`${match.url}/reports`} component={ReportsLayout}/>
                    <Route path={`${match.url}/selection-plans`} component={SelectionPlanLayout}/>
                    <Route path={`${match.url}/reg-feed-metadata`} component={RegFeedMetadataLayout}/>
                    <Route path={`${match.url}/badge-features`} component={BadgeFeatureLayout}/>
                    <Route path={`${match.url}/badge-types`} component={BadgeTypeLayout}/>
                    <Route path={`${match.url}/access-levels`} component={AccessLevelLayout}/>
                    <Route path={`${match.url}/view-types`} component={ViewTypeLayout}/>
                    <Route path={`${match.url}/purchase-orders`} component={PurchaseOrderLayout}/>
                    <Route path={`${match.url}/tickets`} component={TicketListPage}/>
                    <Route path={`${match.url}/registration-invitations`} component={RegistrationInvitationLayout}/>
                    <Route path={`${match.url}/submission-invitations`} component={SubmissionInvitationLayout}/>
                    <Route path={`${match.url}/order-extra-questions`} component={OrderExtraQuestionLayout}/>
                    <Route path={`${match.url}/sponsors`} component={SponsorLayout}/>
                    <Route path={`${match.url}/sponsorships`} component={SummitSponsorshipLayout}/>
                    <Route path={`${match.url}/badge-scans`} component={BadgeScansListPage}/>
                    <Route path={`${match.url}/marketing`} component={MarketingLayout}/>
                    <Route path={`${match.url}/summitdocs`} component={SummitDocsLayout}/>
                    <Route path={`${match.url}/email-flow-events`} component={EmailFlowEventLayout}/>
                    <Route path={`${match.url}/media-uploads`} component={MediaUploadLayout}/>
                    <Route path={`${match.url}/track-chairs`} component={TrackChairsLayout}/>
                    <Route path={`${match.url}/schedule-settings`} component={ScheduleSettingsLayout}/>
                    <Route path={`${match.url}/registration-companies`} component={RegistrationCompaniesLayout}/>
                    <Route path={`${match.url}/registration-stats`} component={RegistrationStatsPage}/>
                    <Route path={`${match.url}/audit-log`} component={AuditLogPage}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    loading : currentSummitState.loading,
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        resetSummitForm,
        getAllSummits,
        getUserRolesBySummit,
        getMarketingSettingsForRegLite,
        getMarketingSettingsForPrintApp,
        getRegFeedMetadataBySummit
    }
)(SummitIdLayout);


