/**
 * Copyright 2020 OpenStack Foundation
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
    RECEIVE_INVITATIONS,
    REQUEST_INVITATIONS,
    SELECT_INVITATION,
    UNSELECT_INVITATION,
    CLEAR_ALL_SELECTED_INVITATIONS,
    REGISTRATION_INVITATION_DELETED,
    REGISTRATION_INVITATION_ALL_DELETED,
    SET_CURRENT_FLOW_EVENT,
    SET_SELECTED_ALL,
    SEND_INVITATIONS_EMAILS,
} from '../../actions/registration-invitation-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    invitations: [],
    term: null,
    order: 'id',
    orderDir: 1,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    totalInvitations: 0,
    showNonAccepted: false,
    showNotSent: false,
    selectedInvitationsIds: [],
    currentFlowEvent: '',
    selectedAll: false,
};

const RegistrationInvitationListReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action;
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_INVITATIONS: {
            let {order, orderDir, page, perPage, term, showNonAccepted, showNotSent} = payload;

            return {...state, order, orderDir, currentPage: page, perPage, term, showNonAccepted, showNotSent};
        }
        case RECEIVE_INVITATIONS: {
            let {total, last_page, data} = payload.response;
            data = data.map(i => {
                return {...i, is_accepted: i.is_accepted ? "Yes" : "No", is_sent: i.is_sent ? "Yes" : "No", }
            });
            return {...state, invitations: data, lastPage: last_page, totalInvitations: total};
        }
        case SELECT_INVITATION:{
            return {...state, selectedInvitationsIds: [...state.selectedInvitationsIds, payload]};
        }
        case UNSELECT_INVITATION:{
            return {...state, selectedInvitationsIds: state.selectedInvitationsIds.filter(element => element !== payload), selectedAll: false};
        }
        case CLEAR_ALL_SELECTED_INVITATIONS:
        {
            return {...state, selectedInvitationsIds: [], selectedAll: false};
        }
        case SEND_INVITATIONS_EMAILS:
        {
            return {...state, selectedInvitationsIds: [], selectedAll: false, currentFlowEvent: ''};
        }
        case REGISTRATION_INVITATION_DELETED: {
            return {...state, invitations: state.invitations.filter(i => i.id !== payload)};
        }
        case REGISTRATION_INVITATION_ALL_DELETED: {
            return {...state, invitations:[]};
        }
        case SET_CURRENT_FLOW_EVENT:{
            return {...state, currentFlowEvent : payload};
        }
        case SET_SELECTED_ALL:{
            return {...state, selectedAll : payload, selectedInvitationsIds: []};
        }
        default:
            return state;
    }
};

export default RegistrationInvitationListReducer;
