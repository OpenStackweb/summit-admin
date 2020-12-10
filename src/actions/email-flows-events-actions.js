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
    putRequest,
    createAction,
    stopLoading,
    startLoading,
    showSuccessMessage,
    authErrorHandler, escapeFilterValue
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_EMAIL_FLOW_EVENTS       = 'REQUEST_EMAIL_FLOW_EVENTS';
export const RECEIVE_EMAIL_FLOW_EVENTS       = 'RECEIVE_EMAIL_FLOW_EVENTS';
export const RECEIVE_EMAIL_FLOW_EVENT        = 'RECEIVE_EMAIL_FLOW_EVENT';
export const RESET_EMAIL_FLOW_EVENT_FORM     = 'RESET_EMAIL_FLOW_EVENT_FORM';
export const UPDATE_EMAIL_FLOW_EVENT         = 'UPDATE_EMAIL_FLOW_EVENT';
export const EMAIL_FLOW_EVENT_UPDATED        = 'EMAIL_FLOW_EVENT_UPDATED';
export const EMAIL_FLOW_EVENT_DELETED        = 'EMAIL_FLOW_EVENT_DELETED';

export const getEmailFlowEvents = ( term = null, page = 1, perPage = 10, order = 'email_template_identifier', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());
    let filter = [];

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`email_template_identifier=@${escapedTerm},event_type_name=@${escapedTerm},flow_name=@${escapedTerm}`);
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    return getRequest(
        createAction(REQUEST_EMAIL_FLOW_EVENTS),
        createAction(RECEIVE_EMAIL_FLOW_EVENTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/email-flows-events`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEmailFlowEvent = (eventId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EMAIL_FLOW_EVENT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/email-flows-events/${eventId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEmailFlowEventForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EMAIL_FLOW_EVENT_FORM)({}));
};

export const saveEmailFlowEvent = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    putRequest(
            createAction(UPDATE_EMAIL_FLOW_EVENT),
            createAction(EMAIL_FLOW_EVENT_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/email-flows-events/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_email_flow_event.saved")));
    });
};


