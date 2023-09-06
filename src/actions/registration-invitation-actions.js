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

import T from "i18n-react/dist/i18n-react";
import {
    getRequest,
    postRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler,
    getCSV,
    escapeFilterValue,
    putRequest,
    deleteRequest,
    showMessage,
    postFile,
} from 'openstack-uicore-foundation/lib/utils/actions';
import history from "../history";
import {checkOrFilter, getAccessTokenSafely} from '../utils/methods';
import {getSentEmailsByTemplatesAndEmail} from './email-actions';
export const REQUEST_INVITATIONS = 'REQUEST_INVITATIONS';
export const RECEIVE_INVITATIONS = 'RECEIVE_INVITATIONS';
export const INVITATIONS_IMPORTED = 'INVITATIONS_IMPORTED';
export const SEND_INVITATIONS_EMAILS = 'SEND_INVITATIONS_EMAILS';
export const SELECT_INVITATION = 'SELECT_INVITATION';
export const UNSELECT_INVITATION = 'UNSELECT_INVITATION';
export const CLEAR_ALL_SELECTED_INVITATIONS = 'CLEAR_ALL_SELECTED_INVITATIONS';
export const RECEIVE_REGISTRATION_INVITATION = 'RECEIVE_REGISTRATION_INVITATION';
export const RESET_REGISTRATION_INVITATION_FORM = 'RESET_REGISTRATION_INVITATION_FORM';
export const UPDATE_REGISTRATION_INVITATION = 'UPDATE_REGISTRATION_INVITATION';
export const REGISTRATION_INVITATION_UPDATED = 'REGISTRATION_INVITATION_UPDATED';
export const REGISTRATION_INVITATION_ADDED = 'REGISTRATION_INVITATION_ADDED';
export const REGISTRATION_INVITATION_DELETED = 'REGISTRATION_INVITATION_DELETED';
export const REGISTRATION_INVITATION_ALL_DELETED = 'REGISTRATION_INVITATION_ALL_DELETED';
export const SET_CURRENT_FLOW_EVENT = 'SET_CURRENT_FLOW_EVENT';
export const SET_SELECTED_ALL = 'SET_SELECTED_ALL';

/**************************   INVITATIONS   ******************************************/

export const getInvitations = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1,
                                filters = {}) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const {tagFilter, isAccepted, isSent, allowedTicketTypesIds} = filters;

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand: 'allowed_ticket_types,tags',
    };

    const filter = parseFilters(filters, term);    

    if(filter.length > 0){
       params['filter[]'] = filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_INVITATIONS),
        createAction(RECEIVE_INVITATIONS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations`,
        authErrorHandler,
        {page, perPage, order, orderDir, term, isSent, isAccepted, allowedTicketTypesIds, tagFilter}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};
export const importInvitationsCSV = (file, acceptanceCriteria) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };
    
    postFile(
        null,
        createAction(INVITATIONS_IMPORTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/csv`,
        file,
        {acceptance_criteria: acceptanceCriteria},
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            window.location.reload();
        });
};

export const exportInvitationsCSV = (term, order, orderDir, filters = {}) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-invitations.csv';
    const filter = parseFilters(filters, term);

    const params = {
        access_token : accessToken
    };

    if(filter.length > 0){
        params['filter[]'] = filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/csv`, params, filename));

};

export const selectInvitation = (invitationId) => (dispatch, getState) => {
    dispatch(createAction(SELECT_INVITATION)(invitationId));
};

export const unSelectInvitation = (invitationId) => (dispatch, getState) => {
    dispatch(createAction(UNSELECT_INVITATION)(invitationId));
};

export const clearAllSelectedInvitations = () => (dispatch, getState) => {
    dispatch(createAction(CLEAR_ALL_SELECTED_INVITATIONS)());
}

export const getRegistrationInvitation = (invitationId) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'allowed_ticket_types,tags',
    };

    return getRequest(
        null,
        createAction(RECEIVE_REGISTRATION_INVITATION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/${invitationId}`,
        authErrorHandler
    )(params)(dispatch).then((payload) => {
            dispatch(stopLoading());
            return payload.response;
        }
    );
};

export const deleteRegistrationInvitation= (invitationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(REGISTRATION_INVITATION_DELETED)(invitationId),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/${invitationId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteAllRegistrationInvitation= () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(REGISTRATION_INVITATION_ALL_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/all`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRegistrationInvitationForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_REGISTRATION_INVITATION_FORM)({}));
};

export const setCurrentFlowEvent = (value) => (dispatch, getState) => {
    dispatch(createAction(SET_CURRENT_FLOW_EVENT)(value));
};

export const setSelectedAll = (value) => (dispatch, getState) => {
    dispatch(createAction(SET_SELECTED_ALL)(value));
};

export const saveRegistrationInvitation = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
        expand: 'allowed_ticket_types,tags',
    };

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {
        putRequest(
            createAction(UPDATE_REGISTRATION_INVITATION),
            createAction(REGISTRATION_INVITATION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    {
                        title: T.translate("general.done"),
                        html: T.translate("edit_registration_invitation.registration_invitation_saved"),
                        type: 'success'
                    },
                    () => {
                        getRegistrationInvitation(payload.response.id)(dispatch, getState).then((payload) => {
                            getSentEmailsByTemplatesAndEmail(
                                [
                                    'SUMMIT_REGISTRATION_INVITE_REGISTRATION',
                                    'SUMMIT_REGISTRATION_REINVITE_REGISTRATION'
                                ],
                                payload.email
                            )(dispatch, getState)
                        });
                    }
                ));
            });
        return;
    }

    postRequest(
        createAction(UPDATE_REGISTRATION_INVITATION),
        createAction(REGISTRATION_INVITATION_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations`,
        normalizedEntity,
        authErrorHandler,
        entity
    ) (params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                {
                    title: T.translate("general.done"),
                    html: T.translate("edit_registration_invitation.registration_invitation_created"),
                    type: 'success'
                },
                () => { history.push(`/app/summits/${currentSummit.id}/registration-invitations/${payload.response.id}`) }
            ));
        });
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};
    normalizedEntity.allowed_ticket_types = entity.allowed_ticket_types.map(tt => tt.id);
    normalizedEntity.tags = entity.tags.map(t => t.tag);
    delete normalizedEntity['created'];
    delete normalizedEntity['last_edited'];
    delete normalizedEntity['is_sent'];
    delete normalizedEntity['accepted_date'];
    return normalizedEntity;
};

export const sendEmails = (currentFlowEvent, selectedAll = false , selectedInvitationsIds = [],
                          term = null, filters = {}, testRecipient = null) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const filter = parseFilters(filters, term);

    const params = {
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]'] = filter;
    }

    const payload =  {
        email_flow_event : currentFlowEvent
    };

    if(!selectedAll && selectedInvitationsIds.length > 0){
        payload['invitations_ids'] = selectedInvitationsIds;
    }

    if(testRecipient) {
        payload['test_email_recipient'] = testRecipient;
    }

    dispatch(startLoading());

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("attendee_list.resend_done"),
        type: 'success'
    };

    return putRequest(
        null,
        createAction(SEND_INVITATIONS_EMAILS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/all/send`,
        payload,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
            ));
            dispatch(stopLoading());
            return payload;
        });
}

const parseFilters = (filters, term = null) => {

    const filter = [];

    if(filters.hasOwnProperty('isAccepted') && filters.isAccepted){
        filter.push(`is_accepted==${filters.isAccepted}`);
    }

    if(filters.hasOwnProperty('isSent') && filters.isSent){
        filter.push(`is_sent==${filters.isSent}`);
    }

    if(filters.allowedTicketTypesIds && filters.allowedTicketTypesIds.length > 0){
        filter.push('ticket_types_id==' + filters.allowedTicketTypesIds.join('||'));
    }

    if(filters.tagFilter && filters.tagFilter.length > 0) {
        filter.push('tags_id=='+filters.tagFilter.map(e => e.id).reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? '||':'') + tt,
            ''
          ));
    }

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`email=@${escapedTerm},first_name@@${escapedTerm},last_name=@${escapedTerm},full_name@@${escapedTerm}`);
    }

    return checkOrFilter(filters, filter);
}