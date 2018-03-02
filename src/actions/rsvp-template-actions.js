/**
 * Copyright 2018 OpenStack Foundation
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

import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage } from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const REQUEST_RSVP_TEMPLATES       = 'REQUEST_RSVP_TEMPLATES';
export const RECEIVE_RSVP_TEMPLATES       = 'RECEIVE_RSVP_TEMPLATES';
export const RECEIVE_RSVP_TEMPLATE        = 'RECEIVE_RSVP_TEMPLATE';
export const RESET_RSVP_TEMPLATE_FORM     = 'RESET_RSVP_TEMPLATE_FORM';
export const UPDATE_RSVP_TEMPLATE         = 'UPDATE_RSVP_TEMPLATE';
export const RSVP_TEMPLATE_UPDATED        = 'RSVP_TEMPLATE_UPDATED';
export const RSVP_TEMPLATE_ADDED          = 'RSVP_TEMPLATE_ADDED';
export const RSVP_TEMPLATE_DELETED        = 'RSVP_TEMPLATE_DELETED';


export const getRsvpTemplates = ( term = null, page = 1, perPage = 10, order = 'code', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`name=@${term}`);
    }

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_RSVP_TEMPLATES),
        createAction(RECEIVE_RSVP_TEMPLATES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/rsvp-templates`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getRsvpTemplate = (rsvpTemplateId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_RSVP_TEMPLATE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetRsvpTemplateForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_RSVP_TEMPLATE_FORM)({}));
};

export const saveRsvpTemplate = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken,
    };

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_rsvp_template.rsvp_template_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_RSVP_TEMPLATE),
            createAction(RSVP_TEMPLATE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/rsvp-templates/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = [
            T.translate("general.done"),
            T.translate("edit_rsvp_template.rsvp_template_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_RSVP_TEMPLATE),
            createAction(RSVP_TEMPLATE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/rsvp-templates`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteRsvpTemplate = (rsvpTemplateId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(RSVP_TEMPLATE_DELETED)({rsvpTemplateId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};



    return normalizedEntity;

}
