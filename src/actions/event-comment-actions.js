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
    putRequest,
    getRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler,
} from 'openstack-uicore-foundation/lib/utils/actions';
import { getAccessTokenSafely } from '../utils/methods';


export const RECEIVE_EVENT_COMMENT        = 'RECEIVE_EVENT_COMMENT';
export const RESET_EVENT_COMMENT_FORM     = 'RESET_EVENT_COMMENT_FORM';
export const UPDATE_EVENT_COMMENT         = 'UPDATE_EVENT_COMMENT';
export const EVENT_COMMENT_UPDATED        = 'EVENT_COMMENT_UPDATED';
export const EVENT_COMMENT_DELETED        = 'EVENT_COMMENT_DELETED';

export const getEventCommentById = (eventCommentId) => async (dispatch, getState) => {

    const { currentSummitState, currentSummitEventState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const eventId = currentSummitEventState.entity.id;

    const params = {
        access_token: accessToken,
        expand: 'creator'
    };

    dispatch(startLoading());    

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_COMMENT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/comments/${eventCommentId}`,
        authErrorHandler,        
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());            
        }
    );    

};

export const resetEventCommentForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_COMMENT_FORM)({}));
};

export const saveEventComment = (entity) => async (dispatch, getState) => {

    const { currentSummitState, currentSummitEventState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const eventId = currentSummitEventState.entity.id;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);
    const params = {
        access_token: accessToken,
        expand: 'creator'
    };

    putRequest(
        createAction(UPDATE_EVENT_COMMENT),
        createAction(EVENT_COMMENT_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/comments/${entity.id}`,
        normalizedEntity,
        authErrorHandler,
        entity,
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showSuccessMessage(T.translate("edit_event_comment.event_comment_saved")));
        });
}

export const deleteEventComment = (commentId) => async (dispatch, getState) => {

    const { currentSummitState, currentSummitEventState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const event = currentSummitEventState.entity;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_COMMENT_DELETED)({ commentId }),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${event.id}/comments/${commentId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
    }
    );
};

const normalizeEntity = (entity) => {
    const normalizedEntity = { ...entity };

    delete (normalizedEntity['owner_full_name']);

    return normalizedEntity;
}
