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

import { createStore, applyMiddleware, compose} from 'redux';
import baseReducer from './reducers/base-reducer'
import currentSummitReducer from './reducers/summits/current-summit-reducer';
import directoryReducer from './reducers/summits/directory-reducer';
import scheduleBuilderReducer from './reducers/events/schedule-builder-reducer';
import eventListReducer from './reducers/events/event-list-reducer';
import summitEventReducer from './reducers/events/summit-event-reducer';
import speakerListReducer from './reducers/speakers/speaker-list-reducer';
import speakerReducer from './reducers/speakers/speaker-reducer';
import speakerMergeReducer from './reducers/speakers/speaker-merge-reducer';
import summitEventBulkActionReducer from './reducers/events/summit-event-bulk-actions-reducer';
import attendeeListReducer from './reducers/attendees/attendee-list-reducer';
import attendeeReducer from './reducers/attendees/attendee-reducer';
import promocodeListReducer from './reducers/promocodes/promocode-list-reducer';
import promocodeReducer from './reducers/promocodes/promocode-reducer';
import speakerAttendanceListReducer from './reducers/summit_speakers/speaker-attendance-list-reducer';
import speakerAttendanceReducer from './reducers/summit_speakers/speaker-attendance-reducer';
import eventTypeListReducer from './reducers/events/event-type-list-reducer';
import eventTypeReducer from './reducers/events/event-type-reducer';
import eventCategoryListReducer from './reducers/events/event-category-list-reducer';
import eventCategoryReducer from './reducers/events/event-category-reducer';
import eventCategoryGroupListReducer from './reducers/events/event-category-group-list-reducer';
import eventCategoryGroupReducer from './reducers/events/event-category-group-reducer';
import eventMaterialReducer from './reducers/events/event-material-reducer';
import locationListReducer from './reducers/locations/location-list-reducer';
import locationReducer from './reducers/locations/location-reducer';
import floorReducer from './reducers/locations/floor-reducer';
import roomReducer from './reducers/locations/room-reducer';
import locationImageReducer from './reducers/locations/location-image-reducer';
import locationMapReducer from './reducers/locations/location-map-reducer';
import rsvpTemplateListReducer from './reducers/rsvps/rsvp-template-list-reducer';
import rsvpTemplateReducer from './reducers/rsvps/rsvp-template-reducer';
import rsvpQuestionReducer from './reducers/rsvps/rsvp-question-reducer';
import ticketTypeListReducer from './reducers/tickets/ticket-type-list-reducer';
import ticketTypeReducer from './reducers/tickets/ticket-type-reducer';
import taxTypeListReducer from './reducers/taxes/tax-type-list-reducer';
import taxTypeReducer from './reducers/taxes/tax-type-reducer';
import pushNotificationListReducer from './reducers/push_notifications/push-notification-list-reducer';
import pushNotificationReducer from './reducers/push_notifications/push-notification-reducer';
import selectionPlanReducer from './reducers/summits/selection-plan-reducer';
import roomOccupancyReducer from "./reducers/events/room-occupancy-reducer";
import tagGroupListReducer from "./reducers/tags/tag-group-list-reducer";
import tagGroupReducer from "./reducers/tags/tag-group-reducer";
import reportReducer from "./reducers/reports/report-reducer";
import { loggedUserReducer } from "openstack-uicore-foundation/lib/security/reducers";
import roomBookingReducer from "./reducers/room_bookings/room-booking-reducer";
import roomBookingListReducer from "./reducers/room_bookings/room-booking-list-reducer";
import roomBookingAttributeTypeReducer from "./reducers/room_bookings/room-booking-attribute-type-reducer";
import badgeTypeListReducer from './reducers/badges/badge-type-list-reducer';
import badgeTypeReducer from './reducers/badges/badge-type-reducer';
import viewTypeListReducer from './reducers/badges/view-type-list-reducer';
import viewTypeReducer from './reducers/badges/view-type-reducer';
import badgeFeatureListReducer from './reducers/badges/badge-feature-list-reducer';
import badgeFeatureReducer from './reducers/badges/badge-feature-reducer';
import accessLevelListReducer from './reducers/badges/access-level-list-reducer';
import accessLevelReducer from './reducers/badges/access-level-reducer';
import orderExtraQuestionListReducer from './reducers/orders/order-extra-question-list-reducer';
import orderExtraQuestionReducer from './reducers/orders/order-extra-question-reducer';
import purchaseOrderListReducer from './reducers/orders/purchase-order-list-reducer';
import purchaseOrderReducer from './reducers/orders/purchase-order-reducer';
import sponsorListReducer from './reducers/sponsors/sponsor-list-reducer';
import sponsorReducer from './reducers/sponsors/sponsor-reducer';
import sponsorshipListReducer from './reducers/sponsorships/sponsorship-list-reducer';
import sponsorshipReducer from './reducers/sponsorships/sponsorship-reducer';
import summitSponsorshipListReducer from './reducers/sponsors/summit-sponsorship-list-reducer';
import summitSponsorshipReducer from './reducers/sponsors/summit-sponsorship-reducer';
import refundPolicyListReducer from './reducers/refund_policies/refund-policy-list-reducer';
import paymentProfileListReducer from './reducers/payment_profiles/payment-profile-list-reducer';
import ticketListReducer from './reducers/tickets/ticket-list-reducer';
import ticketReducer from './reducers/tickets/ticket-reducer';
import badgeScansListReducer from './reducers/sponsors/badge-scans-list-reducer';
import marketingSettingListReducer from './reducers/marketing/marketing-setting-list-reducer';
import marketingSettingReducer from './reducers/marketing/marketing-setting-reducer';
import paymentProfileReducer from './reducers/payment_profiles/payment-profile-reducer';
import emailTemplateReducer from './reducers/emails/email-template-reducer';
import emailTemplateListReducer from './reducers/emails/email-template-list-reducer';
import sentEmailListReducer from './reducers/emails/sent-email-list-reducer';
import summitDocListReducer from './reducers/summitdoc/summitdoc-list-reducer';
import summitDocReducer from "./reducers/summitdoc/summitdoc-reducer";
import emailFlowEventsListReducer from "./reducers/email_flow_events/email-flow-events-list-reducer";
import emailFlowEventReducer from './reducers/email_flow_events/email-flows-event-reducer'
import RegistrationInvitationListReducer from './reducers/tickets/registration-invitation-list-reducer';
import adminAccessListReducer from './reducers/admin_access/admin-access-list-reducer';
import adminAccessReducer from './reducers/admin_access/admin-access-reducer';
import mediaFileTypeListReducer from './reducers/media_file_types/media-file-type-list-reducer';
import mediaFileTypeReducer from './reducers/media_file_types/media-file-type-reducer';
import mediaUploadListReducer from "./reducers/media_uploads/media-uploads-list-reducer";
import mediaUploadReducer from "./reducers/media_uploads/media-upload-reducer";
import registrationInvitationReducer from "./reducers/tickets/registration-invitation-reducer";
import companyListReducer from './reducers/companies/company-list-reducer';
import companyReducer from './reducers/companies/company-reducer';
import tagListReducer from './reducers/tags/tag-list-reducer';
import tagReducer from './reducers/tags/tag-reducer';
import featuredSpeakersReducer from './reducers/summit_speakers/featured-speakers-reducer';
import trackChairListReducer from "./reducers/track_chairs/track-chair-list-reducer";
import progressFlagsReducer from "./reducers/track_chairs/progress-flags-reducer";
import sponsoredProjectListReducer from "./reducers/sponsored_projects/sponsored-project-list-reducer";
import sponsoredProjectReducer from "./reducers/sponsored_projects/sponsored-project-reducer";
import sponsoredProjectSponsorshipTypeReducer from "./reducers/sponsored_projects/sponsored-project-sponsorship-type-reducer";
import sponsoredProjectSponsorshipTypeSupportingCompanyReducer from "./reducers/sponsored_projects/sponsored-project-sponsorship-type-supporting-company-reducer";
import scheduleSettingsReducer from "./reducers/schedule-settings/schedule-settings-reducer";
import scheduleSettingsListReducer from "./reducers/schedule-settings/schedule-settings-list-reducer";
import selectionPlanExtraQuestionReducer from "./reducers/summits/selection-plan-extra-question-reducer";
import registrationCompanyListReducer from "./reducers/companies/registration-companies-list-reducer";
import orderExtraQuestionRuleReducer from './reducers/orders/order-extra-question-rule-reducer';
import presentationVotesReducer from "./reducers/events/summit-presentation-votes-reducer";
import ratingTypeReducer from "./reducers/ranking/rating-type-reducer";
import scoreTypeReducer from './reducers/ranking/score-type-reducer';
import summitSpeakersListReducer from './reducers/summit_speakers/summit-speakers-list-reducer';
import summitSubmittersListReducer from './reducers/summit_submitters/summit-submitters-list-reducer';
import summitStatsReducer from './reducers/summits/summit-stats-reducer';
import sponsorAdvertisementReducer from './reducers/sponsors/sponsor-advertisement-reducer';
import sponsorMaterialReducer from './reducers/sponsors/sponsor-material-reducer';
import sponsorSocialNetworkReducer from './reducers/sponsors/sponsor-social-network-reducer';
import auditLogReducer from './reducers/audit_log/audit-log-reducer';
import eventCommentReducer from './reducers/events/event-comment-reducer';
import SubmmissionInvitationListReducer from './reducers/speakers/submission-invitation-list-reducer';
import submissionInvitationReducer from './reducers/speakers/submission-invitation-reducer';
import thunk from 'redux-thunk';
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage'

 // default: localStorage if web, AsyncStorage if react-native

const config = {
    key: 'root',
    storage,
};

const reducers = persistCombineReducers(config, {
    loggedUserState: loggedUserReducer,
    baseState: baseReducer,
    directoryState: directoryReducer,
    currentSummitState: currentSummitReducer,
    currentScheduleBuilderState: scheduleBuilderReducer,
    currentSummitEventState: summitEventReducer,
    currentEventListState: eventListReducer,
    currentSpeakerListState: speakerListReducer,
    currentSpeakerState: speakerReducer,
    currentSpeakerMergeState: speakerMergeReducer,
    summitEventsBulkActionsState: summitEventBulkActionReducer,
    currentAttendeeListState: attendeeListReducer,
    currentAttendeeState: attendeeReducer,
    currentPromocodeListState: promocodeListReducer,
    currentPromocodeState: promocodeReducer,
    currentSummitSpeakersListState: summitSpeakersListReducer,
    currentSpeakerAttendanceListState: speakerAttendanceListReducer,
    currentSpeakerAttendanceState: speakerAttendanceReducer,
    currentSummitSubmittersListState: summitSubmittersListReducer,
    currentEventTypeListState: eventTypeListReducer,
    currentEventTypeState: eventTypeReducer,
    currentEventCategoryListState: eventCategoryListReducer,
    currentEventCategoryState: eventCategoryReducer,
    currentEventCategoryGroupListState: eventCategoryGroupListReducer,
    currentEventCategoryGroupState: eventCategoryGroupReducer,
    currentEventMaterialState: eventMaterialReducer,
    currentEventCommentState: eventCommentReducer,
    currentLocationListState: locationListReducer,
    currentLocationState: locationReducer,
    currentFloorState: floorReducer,
    currentRoomState: roomReducer,
    currentLocationImageState: locationImageReducer,
    currentLocationMapState: locationMapReducer,
    currentRsvpTemplateListState: rsvpTemplateListReducer,
    currentRsvpTemplateState: rsvpTemplateReducer,
    currentRsvpQuestionState: rsvpQuestionReducer,
    currentTicketTypeListState: ticketTypeListReducer,
    currentTicketTypeState: ticketTypeReducer,
    currentTaxTypeListState: taxTypeListReducer,
    currentTaxTypeState: taxTypeReducer,
    currentPushNotificationListState: pushNotificationListReducer,
    currentPushNotificationState: pushNotificationReducer,
    currentSelectionPlanState: selectionPlanReducer,
    currentRoomOccupancyState: roomOccupancyReducer,
    currentTagGroupListState: tagGroupListReducer,
    currentTagGroupState: tagGroupReducer,
    currentReportState: reportReducer,
    currentRoomBookingState: roomBookingReducer,
    currentRoomBookingListState: roomBookingListReducer,
    currentRoomBookingAttributeTypeState: roomBookingAttributeTypeReducer,
    currentBadgeTypeListState: badgeTypeListReducer,
    currentBadgeTypeState: badgeTypeReducer,
    currentBadgeFeatureListState: badgeFeatureListReducer,
    currentBadgeFeatureState: badgeFeatureReducer,
    currentAccessLevelListState: accessLevelListReducer,
    currentAccessLevelState: accessLevelReducer,
    currentViewTypeListState: viewTypeListReducer,
    currentViewTypeState: viewTypeReducer,
    currentOrderExtraQuestionListState: orderExtraQuestionListReducer,
    currentOrderExtraQuestionState: orderExtraQuestionReducer,
    currentOrderExtraQuestionRuleState: orderExtraQuestionRuleReducer,
    currentPurchaseOrderListState: purchaseOrderListReducer,
    currentPurchaseOrderState: purchaseOrderReducer,
    currentSponsorListState: sponsorListReducer,
    currentSponsorState: sponsorReducer,
    currentSponsorAdvertisementState: sponsorAdvertisementReducer,
    currentSponsorMaterialState: sponsorMaterialReducer,
    currentSponsorSocialNetworkState: sponsorSocialNetworkReducer,
    currentSummitSponsorshipListState: summitSponsorshipListReducer,
    currentSummitSponsorshipState: summitSponsorshipReducer,
    currentSponsorshipListState: sponsorshipListReducer,
    currentSponsorshipState: sponsorshipReducer,
    currentRefundPolicyListState: refundPolicyListReducer,
    currentPaymentProfileListState: paymentProfileListReducer,
    currentPaymentProfileState: paymentProfileReducer,
    currentTicketListState: ticketListReducer,
    currentTicketState: ticketReducer,
    badgeScansListState: badgeScansListReducer,
    marketingSettingListState: marketingSettingListReducer,
    marketingSettingState: marketingSettingReducer,
    emailTemplateState: emailTemplateReducer,
    emailTemplateListState: emailTemplateListReducer,
    sentEmailListState: sentEmailListReducer,
    summitDocListState: summitDocListReducer,
    summitDocState: summitDocReducer,
    emailFlowEventsListState: emailFlowEventsListReducer,
    emailFLowEventState: emailFlowEventReducer,
    RegistrationInvitationListState: RegistrationInvitationListReducer,
    SubmmissionInvitationListState: SubmmissionInvitationListReducer,
    currentSubmissionInvitationState: submissionInvitationReducer,
    adminAccessListState: adminAccessListReducer,
    adminAccessState: adminAccessReducer,
    mediaFileTypeListState: mediaFileTypeListReducer,
    mediaFileTypeState: mediaFileTypeReducer,
    mediaUploadListState: mediaUploadListReducer,
    mediaUploadState: mediaUploadReducer,
    currentRegistrationInvitationState: registrationInvitationReducer,
    currentCompanyListState: companyListReducer,
    currentCompanyState: companyReducer,
    currentTagListState: tagListReducer,
    currentTagState: tagReducer,
    featuredSpeakersState: featuredSpeakersReducer,
    trackChairListState: trackChairListReducer,
    progressFlagsState: progressFlagsReducer,
    sponsoredProjectListState: sponsoredProjectListReducer,
    sponsoredProjectState : sponsoredProjectReducer,
    sponsoredProjectSponsorshipTypeState : sponsoredProjectSponsorshipTypeReducer,
    sponsoredProjectSponsorshipTypeSupportingCompanyState: sponsoredProjectSponsorshipTypeSupportingCompanyReducer,
    scheduleSettingsState: scheduleSettingsReducer,
    scheduleSettingsListState: scheduleSettingsListReducer,
    currentSelectionPlanExtraQuestionState: selectionPlanExtraQuestionReducer,
    currentPresentationVotesState: presentationVotesReducer,
    currentRegistrationCompanyListState: registrationCompanyListReducer,
    ratingTypeState: ratingTypeReducer,
    scoreTypeState: scoreTypeReducer,
    summitStatsState: summitStatsReducer,
    auditLogState: auditLogReducer
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

const onRehydrateComplete = () => {
    // repopulate access token on global access variable
    window.sessionState = store.getState().loggedUserState.sessionState;
}

export const persistor = persistStore(store, null, onRehydrateComplete);
export default store;
