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
    INVITATION_DELETED,
    INVITATION_ALL_DELETED,
    SET_CURRENT_FLOW_EVENT,
    SET_SELECTED_ALL,
    SEND_INVITATIONS_EMAILS,
    SET_CURRENT_SELECTION_PLAN,
} from '../../actions/submission-invitation-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/security/actions';
import { MaxTextLengthForTagsOnTable } from '../../utils/constants';

const DEFAULT_STATE = {
    invitations: [],
    term: null,
    order: 'id',
    orderDir: 1,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    totalInvitations: 0,
    showNotSent: false,
    selectedCount  : 0,
    excludedInvitationsIds: [],
    selectedInvitationsIds: [],
    currentFlowEvent: '',
    selectedAll: false,
    tagFilter: [],
    currentSelectionPlanId: 0,
};

const SubmissionInvitationListReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action;
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_INVITATIONS: {
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
                currentPage: page,
                invitations: [],
                selectedInvitationsIds: [],
                excludedInvitationsIds: [],
                selectedCount: 0,
                selectedAll: false,
                ...rest
            }
        }
        case RECEIVE_INVITATIONS: {
            const {total, last_page, data} = payload.response;
            const {selectedAll, selectedInvitationsIds, excludedInvitationsIds} = state;

            const invitations = data.map(i => {
                return {...i,
                    is_sent: i.is_sent ? "Yes" : "No",
                    tags: i.tags.map(e=> e.tag).join(", ").slice(0, MaxTextLengthForTagsOnTable),
                    tags_full: i.tags.map(e=> e.tag).join(", "),
                    checked: selectedAll ? !excludedInvitationsIds.includes(i.id) : selectedInvitationsIds.includes(i.id),
                }
            });
            return {...state, invitations, lastPage: last_page, totalInvitations: total};
        }
        case SELECT_INVITATION:{
            const {selectedAll, selectedInvitationsIds, excludedInvitationsIds, selectedCount, invitations} = state;
            const invitationId = payload;
            const invitation = invitations.find(a => a.id === invitationId);
            invitation.checked = true;

            let newState = {};

            if (selectedAll) {
                newState = { ...state, excludedInvitationsIds: excludedInvitationsIds.filter(it => it !== invitationId), selectedInvitationsIds: [] }
            } else {
                newState = { ...state, selectedInvitationsIds: [...selectedInvitationsIds, invitationId], excludedInvitationsIds: [] }
            }

            return {...newState, invitations, selectedCount: selectedCount + 1}
        }
        case UNSELECT_INVITATION:{
            const {selectedAll, selectedInvitationsIds, excludedInvitationsIds, selectedCount, invitations} = state;
            const invitationId = payload;
            const invitation = invitations.find(a => a.id === invitationId);
            invitation.checked = false;

            let newState = {};

            if (selectedAll) {
                newState = { ...state, excludedInvitationsIds: [...excludedInvitationsIds, invitationId], selectedInvitationsIds: [] }
            } else {
                newState = { ...state, selectedInvitationsIds: selectedInvitationsIds.filter(it => it !== invitationId), excludedInvitationsIds: [] }
            }

            return {...newState, invitations, selectedCount: selectedCount - 1}
        }
        case CLEAR_ALL_SELECTED_INVITATIONS:
        {
            return {...state, selectedInvitationsIds: [], excludedInvitationsIds: [], selectedAll: false, selectedCount: 0};
        }
        case SEND_INVITATIONS_EMAILS:
        {
            const newState = {...state, selectedAll: false, selectedInvitationsIds: [], excludedInvitationsIds: [], selectedCount: 0, currentFlowEvent: '', currentSelectionPlanId: 0 }
            newState.invitations = newState.invitations.map(a => ({...a, checked: false}));

            return {...newState};
        }
        case INVITATION_DELETED: {
            return {...state, invitations: state.invitations.filter(i => i.id !== payload), totalInvitations: state.totalInvitations - 1};
        }
        case INVITATION_ALL_DELETED: {
            return {...state, invitations:[], totalInvitations:0, currentPage: 1};
        }
        case SET_CURRENT_FLOW_EVENT:{
            return {...state, currentFlowEvent : payload};
        }
        case SET_CURRENT_SELECTION_PLAN:{
            return {...state, currentSelectionPlanId: payload};
        }
        case SET_SELECTED_ALL:{
            const selectedAll = payload;
            const invitations = state.invitations.map(i => ({...i, checked: selectedAll}));
            const selectedCount = selectedAll ? state.totalInvitations : 0
            return {...state, invitations, selectedAll, selectedCount, selectedInvitationsIds: [], excludedInvitationsIds: []};
        }
        default:
            return state;
    }
};

export default SubmissionInvitationListReducer;
