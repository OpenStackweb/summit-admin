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
    RECEIVE_ATTENDEES
} from '../actions/attendee-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { SET_CURRENT_SUMMIT } from '../actions/summit-actions';

const DEFAULT_STATE = {
    attendees       : {},
    term            : null,
    order           : null,
    orderDir        : null,
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
        case RECEIVE_ATTENDEES: {
            let {current_page, total, last_page} = payload.response;
            let attendees = payload.response.data.map(s => ({
                ...s,
                name: s.first_name + ' ' + s.last_name,
                presentation_count: Object.keys(s.presentations).length,
                on_site_phone: (s.hasOwnProperty('summit_assistance') ? s.summit_assistance.on_site_phone : ''),
                registration_code: (s.hasOwnProperty('registration_code') ? s.registration_code.code : '')
            }))

            return {...state, attendees: attendees, currentPage: current_page, totalAttendees: total, lastPage: last_page };
        }
        break;
        default:
            return state;
    }
};

export default attendeeListReducer;
