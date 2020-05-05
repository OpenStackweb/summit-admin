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
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken
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
        `${window.EMAIL_API_BASE_URL}/api/v1/mail-templates`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEmailTemplate = (templateId) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = { access_token : accessToken };

    return getRequest(
        null,
        createAction(RECEIVE_TEMPLATE),
        `${window.EMAIL_API_BASE_URL}/api/v1/mail-templates/${templateId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetTemplateForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_TEMPLATE_FORM)({}));
};

export const saveEmailTemplate = (entity) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_TEMPLATE),
            createAction(TEMPLATE_UPDATED),
            `${window.EMAIL_API_BASE_URL}/api/v1/mail-templates/${entity.id}`,
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

        postRequest(
            createAction(UPDATE_TEMPLATE),
            createAction(TEMPLATE_ADDED),
            `${window.EMAIL_API_BASE_URL}/api/v1/mail-templates`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/emails/templates/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteEmailTemplate = (templateId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TEMPLATE_DELETED)({templateId}),
        `${window.EMAIL_API_BASE_URL}/api/v1/mail-templates/${templateId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);

    return normalizedEntity;

}



/************************************************************************************************************/
/*                          SENT EMAILS                                                                     */
/************************************************************************************************************/


export const getSentEmails = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken
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
        `${window.EMAIL_API_BASE_URL}/api/v1/mails`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};