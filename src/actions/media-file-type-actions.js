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
    authErrorHandler,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_MEDIA_FILE_TYPES       = 'REQUEST_MEDIA_FILE_TYPES';
export const RECEIVE_MEDIA_FILE_TYPES       = 'RECEIVE_MEDIA_FILE_TYPES';
export const REQUEST_ALL_MEDIA_FILE_TYPES   = 'REQUEST_ALL_MEDIA_FILE_TYPES';
export const RECEIVE_ALL_MEDIA_FILE_TYPES   = 'RECEIVE_ALL_MEDIA_FILE_TYPES';
export const RECEIVE_MEDIA_FILE_TYPE        = 'RECEIVE_MEDIA_FILE_TYPE';
export const RESET_MEDIA_FILE_TYPE_FORM     = 'RESET_MEDIA_FILE_TYPE_FORM';
export const UPDATE_MEDIA_FILE_TYPE         = 'UPDATE_MEDIA_FILE_TYPE';
export const MEDIA_FILE_TYPE_UPDATED        = 'MEDIA_FILE_TYPE_UPDATED';
export const MEDIA_FILE_TYPE_ADDED          = 'MEDIA_FILE_TYPE_ADDED';
export const MEDIA_FILE_TYPE_DELETED        = 'MEDIA_FILE_TYPE_DELETED';


export const getMediaFileTypes = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();
    const filter = [];

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken
    };

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`name=@${escapedTerm}`);
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_MEDIA_FILE_TYPES),
        createAction(RECEIVE_MEDIA_FILE_TYPES),
        `${window.API_BASE_URL}/api/v1/summit-media-file-types`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getAllMediaFileTypes = () => async (dispatch, getState) => {
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        page         : 1,
        per_page     : 100,
    };

    return getRequest(
        createAction(REQUEST_ALL_MEDIA_FILE_TYPES),
        createAction(RECEIVE_ALL_MEDIA_FILE_TYPES),
        `${window.API_BASE_URL}/api/v1/summit-media-file-types`,
        authErrorHandler,
        {}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getMediaFileType = (mediaFileTypeId) => async (dispatch, getState) => {
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_MEDIA_FILE_TYPE),
        `${window.API_BASE_URL}/api/v1/summit-media-file-types/${mediaFileTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetMediaFileTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_MEDIA_FILE_TYPE_FORM)({}));
};

export const saveMediaFileType = (entity, noAlert = false) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);
    const params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_MEDIA_FILE_TYPE),
            createAction(MEDIA_FILE_TYPE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summit-media-file-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (!noAlert)
                    dispatch(showSuccessMessage(T.translate("media_file_type.saved")));
                else
                    dispatch(stopLoading());
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("media_file_type.created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_MEDIA_FILE_TYPE),
            createAction(MEDIA_FILE_TYPE_ADDED),
            `${window.API_BASE_URL}/api/v1/summit-media-file-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/media-file-types/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteMediaFileType = (mediaFileTypeId) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(MEDIA_FILE_TYPE_DELETED)({mediaFileTypeId}),
        `${window.API_BASE_URL}/api/v1/summit-media-file-types/${mediaFileTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);

    normalizedEntity.allowed_extensions = entity.allowed_extensions.split(',');

    return normalizedEntity;

};
