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

import moment from 'moment-timezone';
import
{
    RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY,
    RECEIVE_EVENTS_FOR_OCCUPANCY, REQUEST_CURRENT_EVENT_FOR_OCCUPANCY,
    REQUEST_EVENTS_FOR_OCCUPANCY,
    UPDATE_EVENT
} from '../../actions/event-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    events          : [],
    currentEvent    : {},
    term            : null,
    roomId          : null,
    currentEvents   : false,
    order           : 'start_date',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalEvents     : 0,
    summitTZ        : ''
};

const roomOccupancyReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_EVENTS_FOR_OCCUPANCY: {
            let {order, orderDir, term, roomId, currentEvents, summitTZ} = payload;

            return {...state, order, orderDir, term, roomId, currentEvents, summitTZ }
        }
        case REQUEST_CURRENT_EVENT_FOR_OCCUPANCY: {
            let {summitTZ} = payload;

            return {...state, summitTZ }
        }
        case RECEIVE_EVENTS_FOR_OCCUPANCY: {
            let {current_page, total, last_page} = payload.response;
            let events = payload.response.data.map(e => {

                return {
                    id: e.id,
                    title: e.title,
                    start_date: moment(e.start_date * 1000).tz(state.summitTZ).format('ddd h:mm a'),
                    room: (e.location) ? e.location.name : '',
                    occupancy: e.occupancy,
                    speakers: (e.speakers) ? e.speakers.map(s => s.first_name + ' ' + s.last_name).join(',') : ''
                };
            });

            return {...state, events: events, currentPage: current_page, totalEvents: total, lastPage: last_page };
        }
        case RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY: {
            let currentEvent = {};
            let payloadEvent = null;

            if (payload.response.hasOwnProperty('data') && payload.response.data.length === 1) {
                payloadEvent = payload.response.data[0];
            } else if (payload.response.hasOwnProperty('id')){
                payloadEvent = {... payload.response};
            }

            if (payloadEvent) {
                currentEvent = {
                    id: payloadEvent.id,
                    title: payloadEvent.title,
                    start_date: moment(payloadEvent.start_date * 1000).tz(state.summitTZ).format('ddd h:mm a'),
                    end_date: moment(payloadEvent.end_date * 1000).tz(state.summitTZ).format('ddd h:mm a'),
                    room: (payloadEvent.location) ? payloadEvent.location.name : '',
                    occupancy: payloadEvent.occupancy,
                    speakers: (payloadEvent.speakers) ? payloadEvent.speakers.map(s => s.first_name + ' ' + s.last_name).join(',') : ''
                };
            }

            return {...state, currentEvent: currentEvent };
        }
        case UPDATE_EVENT: {
            let updatedEvent = payload;
            let currentEvent = state.currentEvent;

            let events = state.events.map( e => {
                if (e.id === updatedEvent.id) return updatedEvent;
                else return e;
            });

            if(currentEvent.id === updatedEvent.id) {
                currentEvent = {...updatedEvent};
            }


            return {...state,  events: [...events], currentEvent: currentEvent};
        }
        default:
            return state;
    }
};

export default roomOccupancyReducer;
