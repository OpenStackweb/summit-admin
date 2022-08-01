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
    REQUEST_ATTENDANCES,
    RECEIVE_ATTENDANCES,
    ATTENDANCE_DELETED
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {formatEpoch} from 'openstack-uicore-foundation/lib/methods'
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    attendances         : [],
    term                : null,
    order               : '',
    orderDir            : 1,
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalAttendances    : 0
};

const speakerAttendanceListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_ATTENDANCES: {
            let {order, orderDir, term} = payload;
            return {...state, order, orderDir, term};
        }
        case RECEIVE_ATTENDANCES: {
            let {current_page, total, last_page} = payload.response;
            let attendances = payload.response.data.map(a => ({
                ...a,
                created: formatEpoch(a.created),
                speaker_name: a.speaker.first_name + ' ' + a.speaker.last_name,
                speaker_email: a.speaker.email,
                registered: (a.registered ? 'Yes' : 'No'),
                checked_in: (a.checked_in ? 'Yes' : 'No'),
                is_confirmed: (a.is_confirmed ? 'Yes' : 'No'),
                confirmation_date: formatEpoch(a.confirmation_date)
            }))

            return {
                ...state,
                attendances: attendances,
                currentPage: current_page,
                totalAttendances: total,
                lastPage: last_page,
            };
        }
        case ATTENDANCE_DELETED: {
            let {attendanceId} = payload;
            return {...state, attendances: state.attendances.filter(a => a.id !== attendanceId)};
        }
        default:
            return state;
    }
};

export default speakerAttendanceListReducer;
