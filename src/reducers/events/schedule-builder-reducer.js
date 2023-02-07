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

import
{
    RECEIVE_UNSCHEDULE_EVENTS_PAGE,
    REQUEST_PUBLISH_EVENT,
    CHANGE_CURRENT_DAY,
    CHANGE_CURRENT_LOCATION,
    RECEIVE_SCHEDULE_EVENTS_PAGE,
    CHANGE_CURRENT_EVENT_TYPE,
    CHANGE_CURRENT_TRACK,
    CHANGE_CURRENT_DURATION,
    CHANGE_CURRENT_PRESENTATION_SELECTION_STATUS,
    CHANGE_CURRENT_PRESENTATION_SELECTION_PLAN,
    CHANGE_CURRENT_UNSCHEDULE_SEARCH_TERM,
    CHANGE_CURRENT_SCHEDULE_SEARCH_TERM,
    UNPUBLISHED_EVENT,
    RECEIVE_SCHEDULE_EVENTS_SEARCH_PAGE,
    CHANGE_CURRENT_ORDER_BY,
    RECEIVE_EMPTY_SPOTS,
    CLEAR_EMPTY_SPOTS,
    ERROR_PUBLISH_EVENT,
    CLEAR_PUBLISHED_EVENTS,
    CHANGE_SUMMIT_BUILDER_FILTERS,
    SET_SLOT_SIZE
} from '../../actions/summit-builder-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {SummitEvent} from "openstack-uicore-foundation/lib/models";

import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions'

import {DefaultEventMinutesDuration} from "../../utils/constants";

const DEFAULT_STATE = {
    scheduleEvents :  [],
    unScheduleEvents : [],
    unScheduleEventsCurrentPage : null,
    unScheduleEventsLasPage : null,
    currentDay : null,
    currentLocation : null,
    currentEventType : null,
    currentTrack : null,
    currentDuration : null,
    currentPresentationSelectionStatus: null,
    currentPresentationSelectionPlan: null,
    unScheduleEventsCurrentSearchTerm: null,
    scheduleEventsCurrentSearchTerm: null,
    scheduleEventsSearch: [],
    currentUnScheduleOrderBy : null,
    emptySpots: [],
    searchingEmpty: false,
    selectedFilters: [],
    slotSize: DefaultEventMinutesDuration
};

const scheduleBuilderReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case RECEIVE_UNSCHEDULE_EVENTS_PAGE:
            let { data, current_page, last_page } = payload.response;
            return {...state,
                     unScheduleEvents: data,
                     unScheduleEventsCurrentPage: current_page ,
                     unScheduleEventsLasPage: last_page
                   };
        case CHANGE_CURRENT_DAY: {
            let {day} = payload;
            if(day == null){
                return {...state, currentDay : null, scheduleEvents : []};
            }
            return {...state, currentDay : day};
        }
        case SET_SLOT_SIZE: {
            const {slotSize} = payload;
            return {...state, slotSize};
        }
        case CHANGE_CURRENT_EVENT_TYPE: {
            let {eventType} = payload;
            return {...state, currentEventType : eventType};
        }
        break;
        case CHANGE_CURRENT_PRESENTATION_SELECTION_STATUS: {
            let {presentationSelectionStatus} = payload;
            return {...state, currentPresentationSelectionStatus : presentationSelectionStatus};
        }
        break;
        case CHANGE_CURRENT_PRESENTATION_SELECTION_PLAN: {
            let {presentationSelectionPlan} = payload;
            return {...state, currentPresentationSelectionPlan : presentationSelectionPlan};
        }
        break;
        case RECEIVE_EMPTY_SPOTS:{
            let { data } = payload.response;
            return {...state, emptySpots : data, searchingEmpty: true};
        }
        break;
        case CLEAR_EMPTY_SPOTS: {
            return {...state, emptySpots : [], searchingEmpty: false};
        }
        break;
        case CLEAR_PUBLISHED_EVENTS:{
            return {...state, scheduleEvents : []};
        }
        break;
        case CHANGE_CURRENT_ORDER_BY:{
            let {orderBy} = payload;
            return {...state, currentUnScheduleOrderBy : orderBy};
        }
        break;
        case CHANGE_CURRENT_TRACK: {
            let {track} = payload;
            return {...state, currentTrack: track};
        }
        break;
        case CHANGE_CURRENT_DURATION: {
            let {duration} = payload;
            return {...state, currentDuration: duration};
        }
        break;
        case CHANGE_CURRENT_LOCATION: {
            let { location } = payload;
            if(location == null){
                return {...state, currentLocation : null, scheduleEvents : []};
            }
            return {...state, currentLocation : location};
        }
        break;
        case CHANGE_CURRENT_UNSCHEDULE_SEARCH_TERM:{
            let {term} = payload;
            return {...state, unScheduleEventsCurrentSearchTerm : term};
        }
        break;
        case CHANGE_CURRENT_SCHEDULE_SEARCH_TERM:{
            let {term}               = payload;
            let scheduleEventsSearch = (term == null || term === '') ? [] : state.scheduleEventsSearch;
            return {...state, scheduleEventsSearch, scheduleEventsCurrentSearchTerm : term };
        }
        break;
        case RECEIVE_SCHEDULE_EVENTS_SEARCH_PAGE:{
            let { data } = payload.response;
            return {...state,
                scheduleEventsSearch: data
            };
        }
        case RECEIVE_SCHEDULE_EVENTS_PAGE:{
            let { data } = payload.response;
            return {...state,
                scheduleEvents  : data
            };
        }
        break;
        case UNPUBLISHED_EVENT:
        {
            let { event } = payload;

            // remove from scheduled events
            let scheduleEvents =  state.scheduleEvents.filter(item => event.id !== item.id);

            // main
            return {...state,
                unScheduleEvents: [...state.unScheduleEvents,
                    {...event,
                        is_published: false,
                    }
                ],
                scheduleEvents
            };
        }
        break;
        case REQUEST_PUBLISH_EVENT:
            const {currentSummit, currentLocation, event, startTime, day, minutes } = payload;
            let eventModel        = new SummitEvent(event, currentSummit);
            let [eventStarDateTime, eventEndDateTime ] = eventModel.calculateNewDates(day, startTime, minutes);

            // console.log(`publishing event ${event.title} - ${event.id} - start date ${eventStarDateTime.format()} - end date ${eventEndDateTime.format()}`);
            // published

            if(eventModel.isPublished()){

                let scheduleEvents = state.scheduleEvents.map(evt => {
                    return evt.id === event.id ?
                        {
                            ...event,
                            start_date: eventStarDateTime.valueOf()/1000,
                            end_date: eventEndDateTime.valueOf()/1000,
                            location_id : currentLocation.id,
                            is_published: true
                        } : evt;
                });

                return {...state, scheduleEvents};
            }

            // not published

            // remove from no scheduled events
            let unScheduleEvents =  state.unScheduleEvents.filter(item => event.id !== item.id);

            // main
            return {...state,
                scheduleEvents: [...state.scheduleEvents,
                    {...event,
                        start_date: eventStarDateTime.valueOf()/1000,
                        end_date: eventEndDateTime.valueOf()/1000,
                        location_id : currentLocation.id,
                        is_published: true,
                    }
                ],
                unScheduleEvents
            };
        break;
        case ERROR_PUBLISH_EVENT:
            // force update of schedule events ...
            return {...state,
                scheduleEvents: [...state.scheduleEvents],
            };
            break;
        case CHANGE_SUMMIT_BUILDER_FILTERS: {
            return {...state, selectedFilters: payload}
        }
        break;
        case LOGOUT_USER:
        case SET_CURRENT_SUMMIT:
            return DEFAULT_STATE;
            break;
        default:
            return state;
            break;
    }
};

export default scheduleBuilderReducer;
