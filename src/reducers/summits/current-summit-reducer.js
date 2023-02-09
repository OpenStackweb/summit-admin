import{ VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import{ LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT, REQUEST_SUMMIT,RECEIVE_SUMMIT, UPDATE_SUMMIT, SUMMIT_ADDED, RESET_SUMMIT_FORM, SUMMIT_LOGO_ATTACHED, SUMMIT_LOGO_DELETED, CLEAR_SUMMIT } from '../../actions/summit-actions';
import { EVENT_CATEGORY_UPDATED, EVENT_CATEGORY_ADDED, EVENT_CATEGORY_DELETED, EVENT_CATEGORIES_SEEDED } from '../../actions/event-category-actions';
import { EVENT_TYPE_UPDATED, EVENT_TYPE_ADDED, EVENT_TYPE_DELETED, EVENT_TYPES_SEEDED } from '../../actions/event-type-actions';
import { LOCATION_UPDATED, LOCATION_ADDED, LOCATION_DELETED } from '../../actions/location-actions';

import {
    SELECTION_PLAN_DELETED,
    SELECTION_PLAN_ADDED
} from "../../actions/selection-plan-actions";

import {
    ROOM_BOOKING_ATTRIBUTE_TYPE_DELETED,
    ROOM_BOOKING_ATTRIBUTE_TYPE_ADDED,
    ROOM_BOOKING_ATTRIBUTE_TYPE_UPDATED,
    ROOM_BOOKING_ATTRIBUTE_ADDED,
    ROOM_BOOKING_ATTRIBUTE_UPDATED,
    ROOM_BOOKING_ATTRIBUTE_DELETED
} from "../../actions/room-booking-actions";

import {
    RECEIVE_BADGE_TYPES,
    RECEIVE_ACCESS_LEVELS,
    RECEIVE_BADGE_FEATURES,
    RECEIVE_VIEW_TYPES
} from "../../actions/badge-actions";

import {
    RECEIVE_USER_ROLES_BY_SUMMIT
} from "../../actions/user-chat-roles-actions.js";

import { RECEIVE_REFUND_POLICIES } from "../../actions/ticket-actions";
import {RECEIVE_ORDER_EXTRA_QUESTIONS, RECEIVE_MAIN_ORDER_EXTRA_QUESTIONS, ORDER_EXTRA_QUESTION_ADDED} from "../../actions/order-actions";

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    active: false,
    allow_update_attendee_extra_questions: false,
    attendees_count: 0,
    available_on_api: false,
    calendar_sync_desc: '',
    calendar_sync_name: '',
    dates_label: '',
    end_date: 0,
    event_types: [],
    link: '',
    locations: [],
    logo: null,
    page_url: '',
    presentation_voters_count: 0,
    presentation_votes_count: 0,
    presentations_submitted_count: 0,
    published_events_count: 0,
    reassign_ticket_till_date: 0,
    registration_begin_date: 0,
    registration_end_date: 0,
    registration_link: '',
    registration_disclaimer_content: '',
    registration_disclaimer_mandatory: false,
    schedule_event_detail_url: '',
    schedule_page_url: '',
    schedule_start_date: 0,
    secondary_registration_label: '',
    secondary_registration_link: '',
    speaker_announcement_email_accepted_alternate_count: 0,
    speaker_announcement_email_accepted_count: 0,
    speaker_announcement_email_accepted_rejected_count: 0,
    speaker_announcement_email_alternate_count: 0,
    speaker_announcement_email_alternate_rejected_count: 0,
    speaker_announcement_email_rejected_count: 0,
    speakers_count: 0,
    start_date: 0,
    start_showing_venues_date: 0,
    slug: '',
    supported_currencies: ['USD', 'EUR'],
    ticket_types: [],
    time_zone: {},
    time_zone_id: '',
    time_zone_label: '',
    timestamp: 0,
    tracks: [],
    type_id: 0,
    wifi_connections: [],
    selection_plans: [],
    meeting_booking_room_allowed_attributes: [],
    meeting_room_booking_end_time: null,
    meeting_room_booking_max_allowed: 0,
    meeting_room_booking_slot_length: 0,
    meeting_room_booking_start_time: null,
    api_feed_type: '',
    api_feed_url: '',
    api_feed_key: '',
    refund_policies: [],
    access_level_types: null,
    badge_types: null,
    badge_features: null,
    badge_view_types: null,
    order_extra_questions: null,
    order_only_extra_questions: null,
    attendee_extra_questions: null,
    attendee_main_extra_questions: null,
    begin_allow_booking_date: 0,
    end_allow_booking_date: 0,
    external_summit_id: null,
    external_registration_feed_type: '',
    external_registration_feed_api_key: null,
    virtual_site_url: null,
    marketing_site_url: null,
    help_users : [],
    registration_send_qr_as_image_attachment_on_ticket_email : false,
    registration_send_ticket_as_pdf_attachment_on_ticket_email : false,
    registration_allow_automatic_reminder_emails : true,
    registration_send_order_email_automatically: true,
    speaker_confirmation_default_page_url: ''
};

const DEFAULT_STATE = {
    currentSummit: DEFAULT_ENTITY,
    errors: {},
    loading:  false,
};

const currentSummitReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case SET_CURRENT_SUMMIT: {
            return {...state, currentSummit: payload.response};
        }
        break;
        case LOGOUT_USER: {
            return DEFAULT_STATE
        }
        break;
        case RESET_SUMMIT_FORM: {
            return DEFAULT_STATE
        }
        break;
        case REQUEST_SUMMIT: {
            const { id } = payload;
            let { currentSummit} = state;
            if (id !== currentSummit.id){
                currentSummit = {...DEFAULT_ENTITY, id: payload.id}
            }
            return {...DEFAULT_STATE, loading: true, currentSummit: currentSummit };
        }
        break;
        case CLEAR_SUMMIT: {
            return DEFAULT_STATE;
        }
        break
        case SUMMIT_ADDED:
        case RECEIVE_SUMMIT: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (!entity.external_registration_feed_type)
                entity.external_registration_feed_type = 'none';

            if (!entity.api_feed_type)
                entity.api_feed_type = 'none';

            return {...state, currentSummit: {...state.currentSummit, ...entity}, errors: {}, loading: false};
        }
        break;
        case UPDATE_SUMMIT: {
            return {...state,  currentSummit: {...payload}, errors: {} };
        }
        break;
        case SUMMIT_LOGO_ATTACHED: {
            let logo = {...payload.response};
            return {...state, currentSummit: {...state.currentSummit, logo: logo.url} };
        }
        break;
        case SUMMIT_LOGO_DELETED: {
            let {summitId} = payload;
            return {...state, currentSummit: {...state.currentSummit, logo: null} };
        }
        break;
        case EVENT_TYPE_UPDATED: {
            let { response } = payload;
            let eventTypes = state.currentSummit.event_types.filter(e => e.id !== response.id);
            return {...state, currentSummit: {...state.currentSummit, event_types: [...eventTypes, response]}};
        }
        case EVENT_TYPE_ADDED: {
            let { response } = payload;
            return {...state, currentSummit: {...state.currentSummit, event_types: [...state.currentSummit.event_types, response]}};
        }
        break;
        case EVENT_TYPE_DELETED: {
            let {eventTypeId} = payload;
            let eventTypes = state.currentSummit.event_types.filter(e => e.id !== eventTypeId);
            return {...state, currentSummit: {...state.currentSummit, event_types: eventTypes}};
        }
        break;
        case EVENT_TYPES_SEEDED: {
            let eventTypesAdded = payload.response.data;

            if (eventTypesAdded.length > 0) {
                return {...state, currentSummit: {...state.currentSummit, event_types: [...state.currentSummit.event_types, ...eventTypesAdded]}};
            } else {
                return state;
            }
        }
        break;
        case EVENT_CATEGORY_UPDATED: {
            let { response } = payload;
            let tracks = state.currentSummit.tracks.filter(t => t.id !== response.id);
            return {...state, currentSummit: {...state.currentSummit, tracks: [...tracks, response]}};
        }
        break;
        case EVENT_CATEGORY_ADDED: {
            let { response } = payload;
            return {...state, currentSummit: {...state.currentSummit, tracks: [...state.currentSummit.tracks, response]}};
        }
        break;
        case EVENT_CATEGORIES_SEEDED: {
            let eventCategoriesAdded = payload.response.data;

            if (eventCategoriesAdded.length > 0) {
                return {...state, tracks: [...state.currentSummit.tracks, ...eventCategoriesAdded] };
            } else {
                return state;
            }
        }
        break;
        case EVENT_CATEGORY_DELETED: {
            let {trackId} = payload;
            let tracks = state.currentSummit.tracks.filter(t => t.id !== trackId);
            return {...state, currentSummit: {...state.currentSummit, tracks: tracks}};
        }
        break;
        case LOCATION_UPDATED: {
            let { response } = payload;
            let locations = state.currentSummit.locations.filter(l => l.id !== response.id);
            return {...state, currentSummit: {...state.currentSummit, locations: [...locations, response]}};
        }
        break;
        case LOCATION_ADDED: {
            let { response } = payload;
            return {...state, currentSummit: {...state.currentSummit, locations: [...state.currentSummit.locations, response]}};
        }
        break;
        case LOCATION_DELETED: {
            let {locationId} = payload;
            let locations = state.currentSummit.locations.filter(l => l.id !== locationId);
            return {...state, currentSummit: {...state.currentSummit, locations: locations}};
        }
        break;
        case SELECTION_PLAN_ADDED: {
            let { response } = payload;
            return {...state, currentSummit: {...state.currentSummit, selection_plans: [...state.currentSummit.selection_plans, response]}};
        }
        break;
        case SELECTION_PLAN_DELETED: {
            let {selectionPlanId} = payload;
            let selection_plans = state.currentSummit.selection_plans.filter(sp => sp.id !== selectionPlanId);
            return {...state, currentSummit: {...state.currentSummit, selection_plans: selection_plans}};
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_TYPE_UPDATED:
        case ROOM_BOOKING_ATTRIBUTE_TYPE_ADDED: {
            let {response} = payload;
            let attributeType = state.currentSummit.meeting_booking_room_allowed_attributes.find(b => b.id === response.id);
            if (attributeType) {
                response.values = attributeType.values;
            }
            let attributeTypes = state.currentSummit.meeting_booking_room_allowed_attributes.filter(b => b.id !== response.id);
            return {
                ...state,
                currentSummit: {
                    ...state.currentSummit,
                    meeting_booking_room_allowed_attributes: [
                        ...attributeTypes,
                        response
                    ]
                }
            };
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_TYPE_DELETED: {
            let {attributeTypeId} = payload;
            let attributeTypes = state.currentSummit.meeting_booking_room_allowed_attributes.filter(a => a.id !== attributeTypeId);
            return {...state, currentSummit: {...state.currentSummit, meeting_booking_room_allowed_attributes: attributeTypes}};
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_UPDATED:
        case ROOM_BOOKING_ATTRIBUTE_ADDED: {
            let {response} = payload;
            let attributeTypes = state.currentSummit.meeting_booking_room_allowed_attributes.filter(b => b.id !== response.type_id);
            let attributeType = state.currentSummit.meeting_booking_room_allowed_attributes.find(b => b.id === response.type_id);
            let values = attributeType.values.filter(v => v.id !== response.id);
            values = [...values, response];
            attributeType = {...attributeType, values: values};
            return {
                ...state,
                currentSummit: {
                    ...state.currentSummit,
                    meeting_booking_room_allowed_attributes: [
                        ...attributeTypes,
                        attributeType
                    ]
                }
            };
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_DELETED: {
            let {attributeTypeId, attributeValueId} = payload;
            let attributeTypes = state.currentSummit.meeting_booking_room_allowed_attributes.filter(a => a.id !== attributeTypeId);
            let attributeType = state.currentSummit.meeting_booking_room_allowed_attributes.find(a => a.id === attributeTypeId);
            let values = attributeType.values.filter(v => v.id !== attributeValueId);
            attributeType = {...attributeType, values: values};
            return {...state, currentSummit: {...state.currentSummit, meeting_booking_room_allowed_attributes: [...attributeTypes, attributeType]}};
        }
        break;
        case RECEIVE_BADGE_TYPES: {
            let badgeTypes = payload.response.data;

            return {...state, currentSummit: {...state.currentSummit, badge_types: badgeTypes} };
        }
        break;
        case RECEIVE_REFUND_POLICIES: {
            let refundPolicies = payload.response.data;

            return {...state, currentSummit: {...state.currentSummit, refund_policies: refundPolicies} };
        }
        break;
        case RECEIVE_ACCESS_LEVELS: {
            let accessLevels = payload.response.data;

            return {...state, currentSummit: {...state.currentSummit, access_level_types: accessLevels} };
        }
        break;
        case RECEIVE_BADGE_FEATURES: {
            let badgeFeatures = payload.response.data;

            return {...state, currentSummit: {...state.currentSummit, badge_features: badgeFeatures} };
        }
        case RECEIVE_VIEW_TYPES: {
            let viewTypes = payload.response.data;

            return {...state, currentSummit: {...state.currentSummit, badge_view_types: viewTypes} };
        }
        break;
        case RECEIVE_ORDER_EXTRA_QUESTIONS: {
            let allExtraQuestions = payload.response.data;

            let order_only_extra_questions = allExtraQuestions.filter(eq => (eq.usage === 'Both' || eq.usage === 'Order'));
            let attendee_extra_questions = allExtraQuestions.filter(eq => (eq.usage === 'Both' || eq.usage === 'Ticket'));

            return {...state, currentSummit: {...state.currentSummit, order_only_extra_questions, attendee_extra_questions } };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case RECEIVE_USER_ROLES_BY_SUMMIT:{
            let helpUsers = payload.response;
            return {...state, currentSummit: {...state.currentSummit, help_users: helpUsers} }
        }
        case RECEIVE_MAIN_ORDER_EXTRA_QUESTIONS: {
            const mainExtraQuestions = payload.response.data;
            return {...state, currentSummit: {...state.currentSummit, attendee_main_extra_questions: mainExtraQuestions } };
        }
        case ORDER_EXTRA_QUESTION_ADDED: {
            const extraQuestion = payload.response;
            return {...state, currentSummit: {...state.currentSummit, order_extra_questions: [...state.currentSummit.order_extra_questions, extraQuestion]}} 
        } 
        break;
        default:
            return state;
    }

}

export default currentSummitReducer
