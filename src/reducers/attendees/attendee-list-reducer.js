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
    CHANGE_ATTENDEE_SEARCH_TERM,
} from '../../actions/attendee-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

import moment from 'moment-timezone';

const DEFAULT_STATE = {
    attendees       : {},
    term            : null,
    order           : 'full_name',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalRealAttendees  : 0,
    selectedCount  : 0,
    selectedIds: [],
    excludedIds: [],
    currentFlowEvent: '',
    selectedAll: false,
    filters         : {},
    extraColumns    : [],
    summitTz        : '',
};

const attendeeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_ATTENDEES: {
            let { order, orderDir, page, ...rest} = payload;

            if (order !== state.order || orderDir !== state.orderDir || page !== state.currentPage) {
                // if the change was in page or order, keep selection
                return {
                    ...state,
                    order,
                    orderDir,
                    currentPage: page,
                    ...rest
                }
            }

            return {
                ...state,
                order,
                orderDir,
                attendees: [],
                currentPage: page,
                selectedIds: [],
                excludedIds: [],
                selectedCount: 0,
                selectedAll: false,
                ...rest
            }
        }
        case RECEIVE_ATTENDEES: {
            const {current_page, total, last_page} = payload.response;
            const {selectedAll, selectedIds, excludedIds} = state;

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
                    tags: a.tags.map(t => t.tag).join(', '),
                    checked: selectedAll ? !excludedIds.includes(a.id) : selectedIds.includes(a.id),
                    tickets_count: a.tickets.length.toString(),
                    summit_hall_checked_in_date: a.summit_hall_checked_in_date ? moment(a.summit_hall_checked_in_date * 1000).tz(state.summitTZ).format("MMMM Do YYYY, h:mm a") : 'TBD',
                };
            })

            return {...state, attendees, currentPage: current_page, totalRealAttendees: total, lastPage: last_page};
        }
        case ATTENDEE_DELETED: {
            let {attendeeId} = payload;
            return {...state, attendees: state.attendees.filter(a => a.id !== attendeeId)};
        }
        case SELECT_ATTENDEE:{
            const {selectedAll, selectedIds, excludedIds, selectedCount, attendees} = state;
            const attendeeId = payload;
            const attendee = attendees.find(a => a.id === attendeeId);
            attendee.checked = true;

            let newState = {};

            if (selectedAll) {
                newState = { ...state, excludedIds: excludedIds.filter(it => it !== attendeeId), selectedIds: [] }
            } else {
                newState = { ...state, selectedIds: [...selectedIds, attendeeId], excludedIds: [] }
            }

            return {...newState, attendees, selectedCount: selectedCount + 1}
        }
        case UNSELECT_ATTENDEE:{
            const {selectedAll, selectedIds, excludedIds, selectedCount, attendees} = state;
            const attendeeId = payload;
            const attendee = attendees.find(a => a.id === attendeeId);
            attendee.checked = false;

            let newState = {};

            if (selectedAll) {
                newState = { ...state, excludedIds: [...excludedIds, attendeeId], selectedIds: [] }
            } else {
                newState = { ...state, selectedIds: selectedIds.filter(it => it !== attendeeId), excludedIds: [] }
            }

            return {...newState, attendees, selectedCount: selectedCount - 1}
        }
        case CLEAR_ALL_SELECTED_ATTENDEES:
        {
            return {...state, selectedIds: [], excludedIds: [], selectedCount: 0, selectedAll: false};
        }
        case SET_ATTENDEES_CURRENT_FLOW_EVENT:{
            return {...state, currentFlowEvent : payload};
        }
        case SET_SELECTED_ALL_ATTENDEES:{
            const selectedAll = payload;
            const attendees = state.attendees.map(a => ({...a, checked: selectedAll}));
            const selectedCount = selectedAll ? state.totalRealAttendees : 0

            return {...state, selectedAll, selectedIds: [], excludedIds: [], attendees, selectedCount };
        }
        case SEND_ATTENDEES_EMAILS:{
            const newState = {...state, selectedAll: false, selectedIds: [], excludedIds: [], selectedCount: 0 }
            newState.attendees = newState.attendees.map(a => ({...a, checked: false}));

            return { ...newState }
        }
        case CHANGE_ATTENDEE_SEARCH_TERM: {
            let {term} = payload;
            return {...state, term};
        }        
        default:
            return state;
    }
};

export default attendeeListReducer;
