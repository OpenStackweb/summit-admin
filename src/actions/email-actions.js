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
import T from "i18n-react/dist/i18n-react";
import history from '../history'
import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler, putFile, postFile
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_TEMPLATES       = 'REQUEST_TEMPLATES';
export const RECEIVE_TEMPLATES       = 'RECEIVE_TEMPLATES';
export const RECEIVE_TEMPLATE        = 'RECEIVE_TEMPLATE';
export const RESET_TEMPLATE_FORM     = 'RESET_TEMPLATE_FORM';
export const UPDATE_TEMPLATE         = 'UPDATE_TEMPLATE';
export const TEMPLATE_UPDATED        = 'TEMPLATE_UPDATED';
export const TEMPLATE_ADDED          = 'TEMPLATE_ADDED';
export const TEMPLATE_DELETED        = 'TEMPLATE_DELETED';

export const REQUEST_EMAILS       = 'REQUEST_EMAILS';
export const RECEIVE_EMAILS       = 'RECEIVE_EMAILS';

export const getEmailTemplates = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { currentSummitState } = getState();
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
    };

    if(term){
        params.key__contains= term;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_TEMPLATES),
        createAction(RECEIVE_TEMPLATES),
        `${window.EMAIL_API_BASE_URL}/api/public/v1/templates/all/shows/${currentSummit.id}`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEmailTemplate = (templateId) => (dispatch, getState) => {

    dispatch(startLoading());

    let params = {};

    return getRequest(
        null,
        createAction(RECEIVE_TEMPLATE),
        `${window.EMAIL_API_BASE_URL}/api/public/v1/config-values/${templateId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetTemplateForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_TEMPLATE_FORM)({}));
};

export const saveEmailTemplate = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity, currentSummit.id);
    let params = { access_token : accessToken };

    if (entity.id) {

        putFile(
            createAction(UPDATE_TEMPLATE),
            createAction(TEMPLATE_UPDATED),
            `${window.EMAIL_API_BASE_URL}/api/v1/config-values/${entity.id}`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("emails.template_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("emails.template_created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_TEMPLATE),
            createAction(TEMPLATE_ADDED),
            `${window.EMAIL_API_BASE_URL}/api/v1/config-values`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/email-templates/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteEmailTemplate = (templateId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TEMPLATE_DELETED)({templateId}),
        `${window.EMAIL_API_BASE_URL}/api/v1/config-values/${templateId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity, summitId) => {
    let normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);
    normalizedEntity.show_id = summitId;

    return normalizedEntity;

}



/************************************************************************************************************/
/*                          SENT EMAILS                                                                     */
/************************************************************************************************************/


export const getSentEmails = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { currentSummitState } = getState();
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
    };

    if(term){
        params.key__contains= term;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_EMAILS),
        createAction(RECEIVE_EMAILS),
        `${window.EMAIL_API_BASE_URL}/api/public/v1/config-values/all/shows/${currentSummit.id}`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};