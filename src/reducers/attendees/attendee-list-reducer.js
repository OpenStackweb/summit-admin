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
    RECEIVE_ATTENDEES,
    REQUEST_ATTENDEES,
    ATTENDEE_DELETED,
    SELECT_ATTENDEE,
    UNSELECT_ATTENDEE,
    CLEAR_ALL_SELECTED_ATTENDEES,
    SET_ATTENDEES_CURRENT_FLOW_EVENT,
    SET_SELECTED_ALL_ATTENDEES,
    SEND_ATTENDEES_EMAILS,
} from '../../actions/attendee-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    attendees       : {},
    term            : null,
    order           : 'full_name',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalAttendees  : 0,
    selectedIds: [],
    currentFlowEvent: '',
    selectedAll: false,
    statusFilter: null,
    memberFilter: null,
    ticketsFilter: 'HAS_TICKETS',
    virtualCheckInFilter: null,
    checkedInFilter: null,
    ticketTypeFilter: [],
    featuresFilter: [],
    badgeTypeFilter: [],
};

const attendeeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        break;
        case REQUEST_ATTENDEES: {
            let {order, orderDir, page, perPage, ...rest} = payload;
            return {...state, order, orderDir, currentPage: page, perPage, ...rest}
        }
        break;
        case RECEIVE_ATTENDEES: {
            let {current_page, total, last_page} = payload.response;
            let attendees = payload.response.data.map(a => {
                let name = 'N/A';
                let email = 'N/A';

                if (a.member) {
                    name = `${a.member.first_name} ${a.member.last_name}`;
                    email = a.member.email;
                } else {
                    if (a.email) email = a.email;
                    if (a.first_name) name = `${a.first_name} ${a.last_name}`;
                }

                return {
                    id: a.id,
                    member_id: (a.member_id) ? a.member_id : 'N/A',
                    name: name,
                    email: email,
                    company: a.company ? a.company : 'TBD',
                    status: a.status,
                    tickets_qty: a.tickets.length ? a.tickets.length : 'N/A',
                };
            })

            return {...state, attendees: attendees, currentPage: current_page,
                    totalAttendees: total, lastPage: last_page};
        }
        break;
        case ATTENDEE_DELETED: {
            let {attendeeId} = payload;
            return {...state, attendees: state.attendees.filter(a => a.id !== attendeeId)};
        }
        break;
        case SELECT_ATTENDEE:{
            return {...state, selectedIds: [...state.selectedIds, payload]};
        }
            break;
        case UNSELECT_ATTENDEE:{
            return {...state, selectedIds: state.selectedIds.filter(element => element !== payload), selectedAll: false};
        }
        case CLEAR_ALL_SELECTED_ATTENDEES:
        {
            return {...state, selectedIds: [], selectedAll: false};
        }
        case SET_ATTENDEES_CURRENT_FLOW_EVENT:{
            return {...state, currentFlowEvent : payload};
        }
            break;
        case SET_SELECTED_ALL_ATTENDEES:{
            return {...state, selectedAll : payload, selectedIds: []};
        }
        break;
        case SEND_ATTENDEES_EMAILS:{
            return {...state,
                selectedIds: [],
                currentFlowEvent: '',
                selectedAll: false
            }
        }
        default:
            return state;
    }
};

export default attendeeListReducer;
