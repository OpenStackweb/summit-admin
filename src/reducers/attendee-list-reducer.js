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
    RECEIVE_ATTENDEES,
    REQUEST_ATTENDEES,
    ATTENDEE_DELETED,
} from '../actions/attendee-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { SET_CURRENT_SUMMIT } from '../actions/summit-actions';

const DEFAULT_STATE = {
    attendees       : {},
    term            : null,
    order           : 'name',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalAttendees  : 0
};

const attendeeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        break;
        case REQUEST_ATTENDEES: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_ATTENDEES: {
            let {current_page, total, last_page} = payload.response;
            let attendees = payload.response.data.map(a => {
                let bought_date = Math.max(a.tickets.map(t => {return t.bought_date ? t.bought_date : 0;})) * 1000;
                bought_date = (bought_date > 0 ? moment(bought_date).format('MMMM Do YYYY, h:mm:ss a') : '-');

                return {
                    id: a.id,
                    member_id: a.member.id,
                    name: a.member.first_name + ' ' + a.member.last_name,
                    email: a.member.email,
                    eventbrite_id: a.tickets.map(t => t.external_order_id).join(', '),
                    bought_date: bought_date,
                    summit_hall_checked_in: (a.summit_hall_checked_in ? 'Yes' : 'No'),
                    schedule: a.schedule
                };
            })

            return {...state, attendees: attendees, currentPage: current_page, totalAttendees: total, lastPage: last_page };
        }
        break;
        case ATTENDEE_DELETED: {
            let {attendeeId} = payload;
            return {...state, attendees: state.attendees.filter(a => a.id != attendeeId)};
        }
        break;
        default:
            return state;
    }
};

export default attendeeListReducer;
