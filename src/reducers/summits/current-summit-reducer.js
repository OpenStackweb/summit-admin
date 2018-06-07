import{ LOGOUT_USER } from '../../actions/auth-actions';
import { SET_CURRENT_SUMMIT, RECEIVE_SUMMIT, SUMMIT_UPDATED, SUMMIT_ADDED, RESET_SUMMIT_FORM } from '../../actions/summit-actions';
import { EVENT_CATEGORY_UPDATED, EVENT_CATEGORY_ADDED, EVENT_CATEGORY_DELETED, EVENT_CATEGORIES_SEEDED } from '../../actions/event-category-actions';
import { EVENT_TYPE_UPDATED, EVENT_TYPE_ADDED, EVENT_TYPE_DELETED, EVENT_TYPES_SEEDED } from '../../actions/event-type-actions';
import { LOCATION_UPDATED, LOCATION_ADDED, LOCATION_DELETED } from '../../actions/location-actions';
import { SELECTION_PLAN_DELETED } from "../../actions/selection-plan-actions";

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    active: false,
    attendees_count: 0,
    available_on_api: false,
    calendar_sync_desc: '',
    calendar_sync_name: '',
    dates_label: '',
    end_date: 0,
    event_types: [],
    external_summit_id: '',
    link: '',
    locations: [],
    logo: null,
    max_submission_allowed_per_user: 0,
    page_url: '',
    presentation_voters_count: 0,
    presentation_votes_count: 0,
    presentations_submitted_count: 0,
    published_events_count: 0,
    registration_begin_date: 0,
    registration_end_date: 0,
    registration_link: '',
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
    ticket_types: [],
    time_zone: {},
    time_zone_id: '',
    timestamp: 0,
    tracks: [],
    type_id: 0,
    wifi_connections: [],
    selection_plans: []
}

const DEFAULT_STATE = {
    currentSummit: DEFAULT_ENTITY,
    errors: {}
}

const currentSummitReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
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
        case SUMMIT_ADDED:
        case RECEIVE_SUMMIT: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, currentSummit: entity};
        }
        break;
        case SUMMIT_UPDATED: {
            return state;
        }
        break;
        case EVENT_TYPE_UPDATED: {
            let { response } = payload;
            let eventTypes = state.currentSummit.event_types.filter(e => e.id != response.id);
            return {...state, currentSummit: {...state.currentSummit, event_types: [...eventTypes, response]}};
        }
        case EVENT_TYPE_ADDED: {
            let { response } = payload;
            return {...state, currentSummit: {...state.currentSummit, event_types: [...state.currentSummit.event_types, response]}};
        }
        break;
        case EVENT_TYPE_DELETED: {
            let {eventTypeId} = payload;
            let eventTypes = state.currentSummit.event_types.filter(e => e.id != eventTypeId);
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
            let tracks = state.currentSummit.tracks.filter(t => t.id != response.id);
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
            let tracks = state.currentSummit.tracks.filter(t => t.id != trackId);
            return {...state, currentSummit: {...state.currentSummit, tracks: tracks}};
        }
        break;
        case LOCATION_UPDATED: {
            let { response } = payload;
            let locations = state.currentSummit.locations.filter(l => l.id != response.id);
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
            let locations = state.currentSummit.locations.filter(l => l.id != locationId);
            return {...state, currentSummit: {...state.currentSummit, locations: locations}};
        }
        break;
        case SELECTION_PLAN_DELETED: {
            let {selectionPlanId} = payload;
            let selection_plans = state.currentSummit.selection_plans.filter(sp => sp.id != selectionPlanId);
            return {...state, currentSummit: {...state.currentSummit, selection_plans: selection_plans}};
        }
        break;
        default:
            return state;
    }

}

export default currentSummitReducer