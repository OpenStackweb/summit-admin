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
    showMessage
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_INVITATIONS = 'REQUEST_INVITATIONS';
export const RECEIVE_INVITATIONS = 'RECEIVE_INVITATIONS';
export const INVITATIONS_IMPORTED = 'INVITATIONS_IMPORTED';
export const RECEIVE_INVITATION = 'RECEIVE_INVITATION';
export const SELECT_INVITATION = 'SELECT_INVITATION';
export const UNSELECT_INVITATION = 'UNSELECT_INVITATION';
export const CLEAR_ALL_SELECTED_INVITATIONS = 'CLEAR_ALL_SELECTED_INVITATIONS';

/**************************   INVITATIONS   ******************************************/

export const getInvitations = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1, showNonAccepted = false ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand       : 'order,member'
    };

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`email=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm}`);
    }

    if(showNonAccepted){
        filter.push('is_accepted==false');
    }

    if(filter.length > 0){
        params['filter[]'] = filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_INVITATIONS),
        createAction(RECEIVE_INVITATIONS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations`,
        authErrorHandler,
        {page, perPage, order, orderDir, term, showNonAccepted}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const importInvitationsCSV = (file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(INVITATIONS_IMPORTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/csv`,
        file,
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            window.location.reload();
        });
};

export const resendNonAcceptedInvitations = () => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("registration_invitation_list.resend_done"),
        type: 'success'
    };

    dispatch(startLoading());

    return putRequest(
        null,
        createAction(RECEIVE_INVITATION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/all/non-accepted/resend`,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
            ));
            dispatch(stopLoading());
            return data.response;
    });

};

export const exportInvitationsCSV = (term, order, orderDir, showNonAccepted) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filename = currentSummit.name + '-invitations.csv';
    let filter = [];

    let params = {
        access_token : accessToken
    };

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`email=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm}`);
    }

    if(showNonAccepted){
        filter.push('is_accepted==false');
    }

    if(filter.length > 0){
        params['filter[]'] = filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/csv`, params, filename));

};

export const getInvitation = (invitationId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'order,member'
    };

    return getRequest(
        null,
        createAction(RECEIVE_INVITATION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-invitations/${invitationId}`,
        authErrorHandler
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
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


