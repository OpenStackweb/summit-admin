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
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler,
    postRequest,
    putRequest,
    postFile,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely, wrapFormFile} from '../utils/methods';

export const REQUEST_SUMMITDOCS       = 'REQUEST_SUMMITDOCS';
export const RECEIVE_SUMMITDOCS       = 'RECEIVE_SUMMITDOCS';
export const RECEIVE_SUMMITDOC        = 'RECEIVE_SUMMITDOC';
export const RESET_SUMMITDOC_FORM     = 'RESET_SUMMITDOC_FORM';
export const UPDATE_SUMMITDOC         = 'UPDATE_SUMMITDOC';
export const SUMMITDOC_UPDATED        = 'SUMMITDOC_UPDATED';
export const SUMMITDOC_ADDED          = 'SUMMITDOC_ADDED';
export const SUMMITDOC_DELETED        = 'SUMMITDOC_DELETED';
export const SUMMITDOC_FILE_ADDED     = 'SUMMITDOC_FILE_ADDED';
export const SUMMITDOC_FILE_DELETED   = 'SUMMITDOC_FILE_DELETED';

export const getSummitDocs = (term = '', page = 1, perPage = 10, order = 'id', orderDir = 1 ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`name=@${escapedTerm}`);
    }

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand       : 'event_types'
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_SUMMITDOCS),
        createAction(RECEIVE_SUMMITDOCS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents`,
        authErrorHandler,
        {order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSummitDoc = (summitDocId) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMITDOC),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents/${summitDocId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSummitDocForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SUMMITDOC_FORM)({}));
};

export const addFileToDoc = (entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(SUMMITDOC_FILE_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents/${entity.id}/file`,
        wrapFormFile(file),
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
}

export const removeFileFromDoc = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SUMMITDOC_FILE_DELETED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents/${entity.id}/file`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const saveSummitDoc = (entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);
    const params = { access_token : accessToken };
   
    if (entity.id) {
        putRequest(
            createAction(UPDATE_SUMMITDOC),
            createAction(SUMMITDOC_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("summitdoc.saved")));
            });
    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("summitdoc.created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_SUMMITDOC),
            createAction(SUMMITDOC_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/summitdocs/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteSummitDoc = (summitDocId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SUMMITDOC_DELETED)({summitDocId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/summit-documents/${summitDocId}`,
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
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['file']);
    delete(normalizedEntity['file_link']);
    delete(normalizedEntity['has_file']);
    delete(normalizedEntity['event_types']);

    if (!entity.show_always && entity.event_types) {
        normalizedEntity['event_types[]'] = entity.event_types;
    }

    if(!entity.selection_plan_id) {
        normalizedEntity['selection_plan_id'] = 0;
    }

    if(!entity.web_link) {
        delete(normalizedEntity['web_link']);
    }

    return normalizedEntity;

}
