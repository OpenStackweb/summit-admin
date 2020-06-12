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
import history from '../history'
import {
    getRequest,
    postRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler,
    getCSV,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/methods';
import {RECEIVE_TICKET, TICKETS_IMPORTED} from "./ticket-actions";

export const REQUEST_INVITATIONS = 'REQUEST_INVITATIONS';
export const RECEIVE_INVITATIONS = 'RECEIVE_INVITATIONS';
export const INVITATIONS_IMPORTED = 'INVITATIONS_IMPORTED';
export const RECEIVE_INVITATION = 'RECEIVE_INVITATION';

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

    if(filter.length > 0){
        params['filter[]']= filter;
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

export const exportInvitationsCSV = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filename = currentSummit.name + '-invitations.csv';
    let params = {
        access_token : accessToken
    };

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


