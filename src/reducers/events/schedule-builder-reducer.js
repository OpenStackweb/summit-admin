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
    REQUEST_PROPOSED_SCHEDULE,
    RECEIVE_PROPOSED_SCHEDULE,
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
    SET_SLOT_SIZE,
    SET_SOURCE,
    CLEAR_PROPOSED_EVENTS,
    PROPOSED_EVENTS_PUBLISHED,
    RECEIVE_SHOW_ALWAYS_EVENTS,
    RECEIVE_PROPOSED_SCHED_LOCKS,
    UNLOCK_PROPOSED_SCHED
} from '../../actions/summit-builder-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {SummitEvent} from "openstack-uicore-foundation/lib/models";

import { SET_CURRENT_SUMMIT, RECEIVE_SUMMIT } from '../../actions/summit-actions'

import {DefaultEventMinutesDuration} from "../../utils/constants";

const DEFAULT_STATE = {
    scheduleEvents :  [],
    unScheduleEvents : [],
    proposedSchedEvents : [],
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
    slotSize: DefaultEventMinutesDuration,
    selectedSource: 'unscheduled',
    proposedSchedDay : null,
    proposedSchedLocation : null,
    proposedSchedTrack : null,
    proposedSchedLock : null,
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
            return {...state, currentDay: day};
        }
        case SET_SLOT_SIZE: {
            const {slotSize} = payload;
            return {...state, slotSize};
        }
        case SET_SOURCE: {
            const {selectedSource} = payload;
            return {...state, selectedSource};
        }
        case CHANGE_CURRENT_EVENT_TYPE: {
            let {eventType} = payload;
            return {...state, currentEventType : eventType};
        }
        case CHANGE_CURRENT_PRESENTATION_SELECTION_STATUS: {
            let {presentationSelectionStatus} = payload;
            return {...state, currentPresentationSelectionStatus : presentationSelectionStatus};
        }
        case CHANGE_CURRENT_PRESENTATION_SELECTION_PLAN: {
            let {presentationSelectionPlan} = payload;
            return {...state, currentPresentationSelectionPlan : presentationSelectionPlan};
        }
        case RECEIVE_EMPTY_SPOTS:{
            let { data } = payload.response;
            return {...state, emptySpots : data, searchingEmpty: true};
        }
        case CLEAR_EMPTY_SPOTS: {
            return {...state, emptySpots : [], searchingEmpty: false};
        }
        case CLEAR_PUBLISHED_EVENTS:{
            return {...state, scheduleEvents : []};
        }
        case CLEAR_PROPOSED_EVENTS:{
            const {proposedSchedDay, proposedSchedLocation, proposedSchedTrack} = payload;
            return {...state, proposedSchedEvents : [], proposedSchedDay, proposedSchedLocation, proposedSchedTrack};
        }
        case CHANGE_CURRENT_ORDER_BY:{
            let {orderBy} = payload;
            return {...state, currentUnScheduleOrderBy : orderBy};
        }
        case CHANGE_CURRENT_TRACK: {
            let {track} = payload;
            return {...state, currentTrack: track};
        }
        case CHANGE_CURRENT_DURATION: {
            let {duration} = payload;
            return {...state, currentDuration: duration};
        }
        case CHANGE_CURRENT_LOCATION: {
            let { location } = payload;
            if(location == null){
                return {...state, currentLocation: null, scheduleEvents: []};
            }
            return {...state, currentLocation: location};
        }
        case CHANGE_CURRENT_UNSCHEDULE_SEARCH_TERM:{
            let {term} = payload;
            return {...state, unScheduleEventsCurrentSearchTerm : term};
        }
        case CHANGE_CURRENT_SCHEDULE_SEARCH_TERM:{
            let {term}               = payload;
            let scheduleEventsSearch = (term == null || term === '') ? [] : state.scheduleEventsSearch;
            return {...state, scheduleEventsSearch, scheduleEventsCurrentSearchTerm : term };
        }
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
        case REQUEST_PROPOSED_SCHEDULE:{
            const { proposedSchedDay, proposedSchedLocation, proposedSchedTrack } = payload;
            return {...state, proposedSchedDay, proposedSchedLocation, proposedSchedTrack };
        }
        case RECEIVE_PROPOSED_SCHEDULE:{
            const { data } = payload.response;
            const proposedSchedEvents = data.map(ev => {
                const {summit_event, ...rest} = ev;
                return ({...rest, id: summit_event.id, title: summit_event.title, description: summit_event.description, published: summit_event.published});
            });
            return {...state, proposedSchedEvents};
        }
        case RECEIVE_SHOW_ALWAYS_EVENTS: {
            const { data } = payload.response;
            const {proposedSchedEvents} = state;
            const showAlwaysEvents = data.map(ev => ({
                ...ev,
                static: true
            }));
            return {...state, proposedSchedEvents: [...proposedSchedEvents, ...showAlwaysEvents] };
        }
        case PROPOSED_EVENTS_PUBLISHED: {
            return {...state, currentLocation: state.proposedSchedLocation, currentDay: state.proposedSchedDay}
        }
        case RECEIVE_PROPOSED_SCHED_LOCKS: {
            const locks = payload.response.data;
            const proposedSchedLock = locks.find(lock => lock.track_id === state.proposedSchedTrack?.id);
            
            return {...state, proposedSchedLock};
        }
        case UNLOCK_PROPOSED_SCHED: {
            return {...state, proposedSchedLock: null}
        }
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
        case ERROR_PUBLISH_EVENT:
            // force update of schedule events ...
            return {...state,
                scheduleEvents: [...state.scheduleEvents],
            };
        case CHANGE_SUMMIT_BUILDER_FILTERS: {
            return {...state, selectedFilters: payload}
        }
        case LOGOUT_USER:
        case SET_CURRENT_SUMMIT:
        case RECEIVE_SUMMIT:
            return DEFAULT_STATE;
        default:
            return state;
    }
};

export default scheduleBuilderReducer;
