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
    authErrorHandler, escapeFilterValue,
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_MEDIA_UPLOADS      = 'REQUEST_MEDIA_UPLOADS';
export const RECEIVE_MEDIA_UPLOADS      = 'RECEIVE_MEDIA_UPLOADS';
export const RECEIVE_MEDIA_UPLOAD        = 'RECEIVE_MEDIA_UPLOAD';
export const RESET_MEDIA_UPLOAD_FORM     = 'RESET_MEDIA_UPLOAD_FORM';
export const UPDATE_MEDIA_UPLOAD         = 'UPDATE_MEDIA_UPLOAD';
export const MEDIA_UPLOAD_UPDATED        = 'MEDIA_UPLOAD_UPDATED';
export const MEDIA_UPLOAD_ADDED          = 'MEDIA_UPLOAD_ADDED';
export const MEDIA_UPLOAD_DELETED        = 'MEDIA_UPLOAD_DELETED';


export const getMediaUploads = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken
    };

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`name=@${escapedTerm}`);
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir === 1) ? '' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_MEDIA_UPLOADS),
        createAction(RECEIVE_MEDIA_UPLOADS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/media-upload-types`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getMediaUpload = (mediaUploadId) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_MEDIA_UPLOAD),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/media-upload-types/${mediaUploadId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetMediaUploadForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_MEDIA_UPLOAD_FORM)({}));
};

export const saveMediaUpload = (entity, noAlert = false) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_MEDIA_UPLOAD),
            createAction(MEDIA_UPLOAD_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/media-upload-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (!noAlert)
                    dispatch(showSuccessMessage(T.translate("media_upload.saved")));
                else
                    dispatch(stopLoading());
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("media_upload.created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_MEDIA_UPLOAD),
            createAction(MEDIA_UPLOAD_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/media-upload-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/media-uploads/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteMediaUpload = (mediaUploadId) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(MEDIA_UPLOAD_DELETED)({mediaUploadId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/media-upload-types/${mediaUploadId}`,
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

};
