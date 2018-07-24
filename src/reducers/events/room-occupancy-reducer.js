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
    RECEIVE_EVENTS_FOR_OCCUPANCY,
    REQUEST_EVENTS_FOR_OCCUPANCY,
    UPDATE_EVENT
} from '../../actions/event-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';

const DEFAULT_STATE = {
    events          : [],
    term            : null,
    roomId          : null,
    currentEvents   : false,
    order           : 'id',
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
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_EVENTS_FOR_OCCUPANCY: {
            let {order, orderDir, term, roomId, currentEvents, summitTZ} = payload;

            return {...state, order, orderDir, term, roomId, currentEvents, summitTZ }
        }
        break;
        case RECEIVE_EVENTS_FOR_OCCUPANCY: {
            let {current_page, total, last_page} = payload.response;
            let events = payload.response.data.map(e => {

                return {
                    id: e.id,
                    title: e.title,
                    start: moment(e.start_date * 1000).tz(state.summitTZ).format('ddd h:mm a'),
                    room: e.location.name,
                    occupancy: e.occupancy,
                    speakers: (e.speakers) ? e.speakers.map(s => s.first_name + ' ' + s.last_name).join(',') : ''
                };
            });

            return {...state, events: events, currentPage: current_page, totalEvents: total, lastPage: last_page };
        }
        break;
        case UPDATE_EVENT: {
            return {...state,  events: [...state.events, {...payload}]};
        }
            break;
        default:
            return state;
    }
};

export default roomOccupancyReducer;
