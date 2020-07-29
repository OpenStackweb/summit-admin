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
} from '../../actions/registration-invitation-actions';

import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/actions';

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
    selectedInvitationsIds: [],
};

const RegistrationInvitationListReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action;
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
            break;
        case REQUEST_INVITATIONS: {
            let {order, orderDir, page, perPage, term, showNonAccepted} = payload;

            return {...state, order, orderDir, currentPage: page, perPage, term, showNonAccepted};
        }
            break;
        case RECEIVE_INVITATIONS: {
            let {total, last_page, data} = payload.response;
            data = data.map(i => {
                return {...i, is_accepted: i.is_accepted ? "Yes" : "No"}
            });
            return {...state, invitations: data, lastPage: last_page, totalInvitations: total};
        }
            break;
        case SELECT_INVITATION:{
            return {...state, selectedInvitationsIds: [...state.selectedInvitationsIds, payload]};
        }
        break;
        case UNSELECT_INVITATION:{
            return {...state, selectedInvitationsIds: state.selectedInvitationsIds.filter(element => element !== action.payload)};
        }
        case CLEAR_ALL_SELECTED_INVITATIONS:
        {
            return {...state, selectedInvitationsIds: []};
        }
        break;
        default:
            return state;
    }
};

export default RegistrationInvitationListReducer;
