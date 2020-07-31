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
import Swal from "sweetalert2";
import { VALIDATE } from 'openstack-uicore-foundation/lib/actions';
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
    authErrorHandler,
    fetchResponseHandler,
    fetchErrorHandler,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_TEMPLATES       = 'REQUEST_TEMPLATES';
export const RECEIVE_TEMPLATES       = 'RECEIVE_TEMPLATES';
export const RECEIVE_TEMPLATE        = 'RECEIVE_TEMPLATE';
export const RESET_TEMPLATE_FORM     = 'RESET_TEMPLATE_FORM';
export const UPDATE_TEMPLATE         = 'UPDATE_TEMPLATE';
export const TEMPLATE_UPDATED        = 'TEMPLATE_UPDATED';
export const TEMPLATE_ADDED          = 'TEMPLATE_ADDED';
export const TEMPLATE_DELETED        = 'TEMPLATE_DELETED';

export const REQUEST_EMAILS          = 'REQUEST_EMAILS';
export const RECEIVE_EMAILS          = 'RECEIVE_EMAILS';
export const REQUEST_EMAILS_BY_USER  = 'REQUEST_EMAILS_BY_USER';
export const RECEIVE_EMAILS_BY_USER  = 'RECEIVE_EMAILS_BY_USER';

export const REQUEST_EMAIL_CLIENTS   = 'REQUEST_EMAIL_CLIENTS';
export const RECEIVE_EMAIL_CLIENTS   = 'RECEIVE_EMAIL_CLIENTS';

export const TEMPLATE_RENDER_RECEIVED   = 'TEMPLATE_RENDER_RECEIVED';
export const VALIDATE_RENDER            = 'VALIDATE_RENDER';


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
        params.identifier__contains= term;
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

    let params = { access_token : accessToken, expand: 'parent' };

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

export const saveEmailTemplate = (entity, noAlert = false) => (dispatch, getState) => {
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
            customErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (!noAlert)
                    dispatch(showSuccessMessage(T.translate("emails.template_saved")));
                else
                    dispatch(stopLoading());
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


export const previewEmailTemplate = (templateId, json) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    return putRequest(
        null,
        createAction(TEMPLATE_RENDER_RECEIVED),
        `${window.EMAIL_API_BASE_URL}/api/v1/mail-templates/${templateId}/render`,
        {payload: JSON.parse(json)},
        renderErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const renderErrorHandler = (err, res) => (dispatch, state) => {
    dispatch({
        type: VALIDATE_RENDER,
        payload: {errors: err.response.body}
    });
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);

    if (entity.parent) {
        normalizedEntity.parent = entity.parent.id;
    }

    return normalizedEntity;

};


export const queryTemplates = _.debounce((input, callback) => {

    let accessToken = window.accessToken;
    input = escapeFilterValue(input);

    fetch(`${window.EMAIL_API_BASE_URL}/api/v1/mail-templates?identifier__contains=${input}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, 500);



/************************************************************************************************************/
/*                          SENT EMAILS                                                                     */
/************************************************************************************************************/


export const getSentEmailsByTemplatesAndEmail = (templates = [], toEmail , page = 1, perPage = 10) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());


    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand: 'template',
        is_sent: 1,
        template__identifier__in: templates.join(),
        to_email__contains:toEmail,
        order : '-id',
    };

    return getRequest(
        createAction(REQUEST_EMAILS_BY_USER),
        createAction(RECEIVE_EMAILS_BY_USER),
        `${window.EMAIL_API_BASE_URL}/api/v1/mails`,
        authErrorHandler,
        {}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSentEmails = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand: 'template',
        is_sent: 1,
    };

    if(term){
        params.term = term;
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


/************************************************************************************************************/
/*                          CLIENTS                                                                     */
/************************************************************************************************************/


export const getAllClients = () => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        page         : 1,
        per_page     : 100,
        access_token : accessToken
    };

    return getRequest(
        createAction(REQUEST_EMAIL_CLIENTS),
        createAction(RECEIVE_EMAIL_CLIENTS),
        `${window.EMAIL_API_BASE_URL}/api/v1/clients`,
        authErrorHandler,
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const customErrorHandler = (err, res) => (dispatch, state) => {
    let code = err.status;
    let msg = '';

    dispatch(stopLoading());

    switch (code) {
        case 412:
            if (Array.isArray(err.response.body)) {
                err.response.body.forEach(er => {
                    msg += er + '<br>';
                });
            } else {
                for (var [key, value] of Object.entries(err.response.body.non_field_errors)) {
                    if (isNaN(key)) {
                        msg += key + ': ';
                    }

                    msg += value + '<br>';
                }
            }

            Swal.fire("Validation error", msg, "warning");

            if (err.response.body.errors) {
                dispatch({
                    type: VALIDATE,
                    payload: {errors: err.response.body}
                });
            }

            break;
        default:
            dispatch(authErrorHandler(err, res));
    }
}