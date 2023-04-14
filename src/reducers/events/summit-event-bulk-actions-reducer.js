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

import { RECEIVE_SELECTED_EVENTS,
    UPDATE_LOCAL_EVENT,
    UPDATED_REMOTE_EVENTS,
    UPDATE_EVENT_SELECTED_STATE,
    UPDATE_EVENT_SELECTED_STATE_BULK,
    UPDATE_VALIDATION_STATE,
    UPDATE_LOCATION_BULK,
    UPDATE_SELECTION_PLAN_BULK,
    UPDATE_TYPE_BULK,
    UPDATE_START_DATE_BULK,
    UPDATE_END_DATE_BULK,
    UPDATE_ACTIVITY_TYPE_BULK,
    UPDATE_ACTIVITY_CATEGORY_BULK,
    UPDATE_DURATION_BULK,
    UPDATE_STREAMING_URL_BULK,
    UPDATE_STREAMING_TYPE_BULK,
    UPDATE_MEETING_URL_BULK,
    UPDATE_ETHERPAD_URL_BULK,
} from '../../actions/summit-event-bulk-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {SummitEvent} from "openstack-uicore-foundation/lib/models";

import
{
    CLEAR_PUBLISHED_EVENTS,
    RECEIVE_UNSCHEDULE_EVENTS_PAGE,
    RECEIVE_SCHEDULE_EVENTS_PAGE

} from '../../actions/summit-builder-actions';

const DEFAULT_STATE = {
    eventOnBulkEdition: [],
    selectedPublishedEvents:[],
    selectedUnPublishedEvents:[],
}

const summitEventBulkActionReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch(type){
        case CLEAR_PUBLISHED_EVENTS:
        case RECEIVE_SCHEDULE_EVENTS_PAGE:
        {
            return { ... state, selectedPublishedEvents: [], eventOnBulkEdition: []}
        }
        break;
        case RECEIVE_UNSCHEDULE_EVENTS_PAGE:
        {
            return { ... state, selectedUnPublishedEvents: [], eventOnBulkEdition: []}
        }
        break;
        case UPDATE_VALIDATION_STATE:{
            const { currentSummit }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                let model = new SummitEvent(event, currentSummit)
                return {...event, is_valid : model.isValid()}
            });
            return { ... state, eventOnBulkEdition}
        }
       break;
        case RECEIVE_SELECTED_EVENTS:
            const { data } = payload.response;
            return {...state,
                eventOnBulkEdition: data.map((event) => ({ ...event, is_valid: false}))
            };
            break;
        case UPDATE_LOCAL_EVENT:
            const { eventId, mutator }   = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return event.id === eventId ? mutator(event) : event
            });
            return { ... state, eventOnBulkEdition}
            break;
        case UPDATE_EVENT_SELECTED_STATE:
        {
            const { event } = payload;
            let { selectedPublishedEvents, selectedUnPublishedEvents } = state;
            // event is published
            if(event.hasOwnProperty('is_published') && event.is_published){
                if(selectedPublishedEvents.includes(event.id)){
                    // unchecked action
                    selectedPublishedEvents = selectedPublishedEvents.filter(function(item) {
                        return item !== event.id
                    })
                }
                else{
                    selectedPublishedEvents.push(event.id)
                }
                // clear unpublished ( just in case)
                selectedUnPublishedEvents = selectedUnPublishedEvents.filter(function(item) {
                    return item !== event.id
                })

                return {...state, selectedPublishedEvents, selectedUnPublishedEvents};
            }

            // unpublished events

            if(selectedUnPublishedEvents.includes(event.id)){
                // unchecked action
                selectedUnPublishedEvents = selectedUnPublishedEvents.filter(function(item) {
                    return item !== event.id
                })
            }
            else{
                selectedUnPublishedEvents.push(event.id)
            }
            selectedPublishedEvents = selectedPublishedEvents.filter(function(item) {
                return item !== event.id
            })

            return {...state, selectedPublishedEvents, selectedUnPublishedEvents};
        }
        break;
        case UPDATE_EVENT_SELECTED_STATE_BULK:{
            let { events, selectedState, published } = payload;
            if(published){
                let { selectedPublishedEvents} = state;
                selectedPublishedEvents = selectedState ? events.map((event) => event.id) : [];
                return {...state, selectedPublishedEvents}
            }
            let { selectedUnPublishedEvents} = state;
            selectedUnPublishedEvents = selectedState ? events.map((event) => event.id) : [];
            return {...state, selectedUnPublishedEvents}
        }
        break;
        case UPDATE_LOCATION_BULK:{
            let { location }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, location_id : location.id}
            });
            return { ... state, eventOnBulkEdition}
        }
        break;
        case UPDATE_SELECTION_PLAN_BULK:{
            let { selectionPlan }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, selection_plan_id : selectionPlan.id}
            });
            return { ... state, eventOnBulkEdition}
        }
        case UPDATE_TYPE_BULK:{
            let { eventType }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, type_id : eventType.id}
            });
            return { ... state, eventOnBulkEdition}
        }
        break;
        case UPDATE_START_DATE_BULK:{
            let { start_date }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, start_date:start_date }
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_END_DATE_BULK:{
            let { end_date }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, end_date}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_ACTIVITY_TYPE_BULK: {
            let { activityType }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, type_id : activityType}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_ACTIVITY_CATEGORY_BULK: {
            let { activityCategory }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, track_id: activityCategory}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_DURATION_BULK: {
            let { duration }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, duration}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_STREAMING_URL_BULK: {
            let { streamingURL }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, streaming_url: streamingURL}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_STREAMING_TYPE_BULK: {
            let { streamingType }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, streaming_type: streamingType}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_MEETING_URL_BULK: {
            let { meetingURL }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, meeting_url: meetingURL}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case UPDATE_ETHERPAD_URL_BULK: {
            let { etherpadURL }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return {...event, etherpad_link: etherpadURL}
            });
            return { ... state, eventOnBulkEdition}
        }
            break;
        case LOGOUT_USER:{
            return DEFAULT_STATE;
        }
            break;
        case UPDATED_REMOTE_EVENTS:
        default:
            return state;
            break;
    }
}

export default summitEventBulkActionReducer