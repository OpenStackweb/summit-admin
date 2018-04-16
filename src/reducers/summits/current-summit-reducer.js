import{ LOGOUT_USER } from '../../actions/auth-actions';
import { SET_CURRENT_SUMMIT, RECEIVE_SUMMIT } from '../../actions/summit-actions';
import { EVENT_CATEGORY_UPDATED, EVENT_CATEGORY_ADDED, EVENT_CATEGORY_DELETED, EVENT_CATEGORIES_SEEDED } from '../../actions/event-category-actions';
import { EVENT_TYPE_UPDATED, EVENT_TYPE_ADDED, EVENT_TYPE_DELETED, EVENT_TYPES_SEEDED } from '../../actions/event-type-actions';
import { LOCATION_UPDATED, LOCATION_ADDED, LOCATION_DELETED } from '../../actions/location-actions';

const DEFAULT_STATE = {
    currentSummit: null,
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
        case RECEIVE_SUMMIT: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            entity.time_zone_name = entity.time_zone ? entity.time_zone.name : '';
            return {...state, currentSummit: entity};
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
        default:
            return state;
    }

}

export default currentSummitReducer