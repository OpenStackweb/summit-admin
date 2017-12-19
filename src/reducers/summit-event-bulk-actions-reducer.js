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
    UPDATE_VALIDATION_STATE
} from '../actions/summit-event-bulk-actions';

import{ LOGOUT_USER } from '../actions/auth-actions';

import
{
    CLEAR_PUBLISHED_EVENTS,
    RECEIVE_UNSCHEDULE_EVENTS_PAGE,
    RECEIVE_SCHEDULE_EVENTS_PAGE

} from '../actions/summit-builder-actions';

import SummitEvent from "../models/summit-event";

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
            let { currentSummit }      = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                let model = new SummitEvent(event, currentSummit)
                return {...event, is_valid : model.isValid()}
            });
            return { ... state, eventOnBulkEdition}
            break;
        }
        case RECEIVE_SELECTED_EVENTS:
            let { data } = payload.response;
            return {...state,
                eventOnBulkEdition: data.map((event) => ({ ...event, is_valid: false}))
            };
            break;
        case UPDATE_LOCAL_EVENT:
            let { eventId, mutator }   = payload;
            let { eventOnBulkEdition } = state;
            eventOnBulkEdition = eventOnBulkEdition.map(event => {
                return event.id == eventId ? mutator(event) : event
            });
            return { ... state, eventOnBulkEdition}
            break;
        case UPDATE_EVENT_SELECTED_STATE:
        {
            let { event } = payload;
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
        case LOGOUT_USER:{
            return DEFAULT_STATE;
        }
        case UPDATED_REMOTE_EVENTS:
        default:
            return state;
            break;
    }
}

export default summitEventBulkActionReducer