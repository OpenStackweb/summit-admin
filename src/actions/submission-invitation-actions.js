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
    showSuccessMessage
} from 'openstack-uicore-foundation/lib/utils/actions';
import history from "../history";
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_INVITATIONS = 'REQUEST_SUBMISSION_INVITATIONS';
export const RECEIVE_INVITATIONS = 'RECEIVE_SUBMISSION_INVITATIONS';
export const INVITATIONS_IMPORTED = 'SUBMISSION_INVITATIONS_IMPORTED';
export const SEND_INVITATIONS_EMAILS = 'SEND_SUBMISSION_INVITATIONS_EMAILS';
export const SELECT_INVITATION = 'SELECT_SUBMISSION_INVITATION';
export const UNSELECT_INVITATION = 'UNSELECT_SUBMISSION_INVITATION';
export const CLEAR_ALL_SELECTED_INVITATIONS = 'CLEAR_ALL_SELECTED_SUBMISSION_INVITATIONS';
export const RECEIVE_INVITATION = 'RECEIVE_SUBMISSION_INVITATION';
export const RESET_INVITATION_FORM = 'RESET_SUBMISSION_INVITATION_FORM';
export const UPDATE_INVITATION = 'UPDATE_SUBMISSION_INVITATION';
export const INVITATION_UPDATED = 'SUBMISSION_INVITATION_UPDATED';
export const INVITATION_ADDED = 'SUBMISSION__INVITATION_ADDED';
export const INVITATION_DELETED = 'SUBMISSION_INVITATION_DELETED';
export const INVITATION_ALL_DELETED = 'SUBMISSION_INVITATION_ALL_DELETED';
export const SET_CURRENT_FLOW_EVENT = 'SET_CURRENT_FLOW_EVENT_SUBMISSION_INVITATIONS';
export const SET_SELECTED_ALL = 'SET_SELECTED_ALL_SUBMISSION_INVITATIONS';
export const SET_CURRENT_SELECTION_PLAN = 'SET_CURRENT_SELECTION_PLAN';

/**************************   INVITATIONS   ******************************************/

export const getInvitations = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1,
                                showNotSent = false, tagFilter = []) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand: 'tags',
    };

    if(tagFilter.length > 0) {
        filter.push('tags_id=='+tagFilter.map(e => e.id).reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? '||':'') + tt,
            ''
        ));
    }

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`email=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm}`);
    }


    if(showNotSent){
        filter.push('is_sent==false');
    }

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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations`,
        authErrorHandler,
        {page, perPage, order, orderDir, term, showNotSent, tagFilter}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const importInvitationsCSV = (file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(INVITATIONS_IMPORTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/csv`,
        file,
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            window.location.reload();
        });
};

export const exportInvitationsCSV = (term, order, orderDir, showNotSent, tagFilter = []) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-submission-invitations.csv';
    const filter = [];

    const params = {
        access_token : accessToken
    };

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`email=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm}`);
    }

    if(showNotSent){
        filter.push('is_sent==false');
    }

    if(tagFilter.length > 0) {
        filter.push('tags_id=='+tagFilter.map(e => e.id).reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? '||':'') + tt,
            ''
        ));
    }

    if(filter.length > 0){
        params['filter[]'] = filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/csv`, params, filename));

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

export const getInvitation = (invitationId) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'tags',
    };

    return getRequest(
        null,
        createAction(RECEIVE_INVITATION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/${invitationId}`,
        authErrorHandler
    )(params)(dispatch).then((payload) => {
            dispatch(stopLoading());
            return payload.response;
        }
    );
};

export const deleteInvitation = (invitationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(INVITATION_DELETED)(invitationId),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/${invitationId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteAllInvitations= () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(INVITATION_ALL_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/all`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetInvitationForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_INVITATION_FORM)({}));
};

export const setCurrentFlowEvent = (value) => (dispatch, getState) => {
    dispatch(createAction(SET_CURRENT_FLOW_EVENT)(value));
};

export const setCurrentSelectionPlanId = (value) =>(dispatch, getState) => {
    dispatch(createAction(SET_CURRENT_SELECTION_PLAN)(value));
};


export const setSelectedAll = (value) => (dispatch, getState) => {
    dispatch(createAction(SET_SELECTED_ALL)(value));
};

export const saveInvitation = (entity) => async (dispatch, getState) => {
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
            createAction(UPDATE_INVITATION),
            createAction(INVITATION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_registration_invitation.registration_invitation_saved")));
            });
        return;
    }

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_registration_invitation.registration_invitation_created"),
        type: 'success'
    };

    postRequest(
        createAction(UPDATE_INVITATION),
        createAction(INVITATION_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations`,
        normalizedEntity,
        authErrorHandler,
        entity
    ) (params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => { history.push(`/app/summits/${currentSummit.id}/submission-invitations/${payload.response.id}`) }
            ));
        });
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};
    normalizedEntity.tags = entity.tags.map(t => t.tag);
    return normalizedEntity;
};

export const sendEmails = (currentFlowEvent,
                           currentSelectionPlanId,
                           selectedAll = false ,
                           selectedInvitationsIds = [],
                           term = null,
                           showNotSent = false,
                           tagFilter = []) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const filter = [];

    const params = {
        access_token : accessToken,
    };

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`email=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm}`);
    }

    if(showNotSent){
        filter.push('is_sent==false');
    }

    if(tagFilter.length > 0) {
        filter.push('tags_id=='+tagFilter.map(e => e.id).reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? '||':'') + tt,
            ''
        ));
    }

    if(filter.length > 0){
        params['filter[]'] = filter;
    }

    const payload =  {
        email_flow_event : currentFlowEvent
    };

    if(currentSelectionPlanId && parseInt(currentSelectionPlanId) > 0){
        payload['selection_plan_id'] = currentSelectionPlanId;
    }

    if(!selectedAll && selectedInvitationsIds.length > 0){
        payload['invitations_ids'] = selectedInvitationsIds;
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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/submission-invitations/all/send`,
        payload,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
            ));
            dispatch(stopLoading());
            return data.response;
        });
}
