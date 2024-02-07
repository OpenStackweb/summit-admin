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
    authErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';


export const REQUEST_EVENT_TYPES       = 'REQUEST_EVENT_TYPES';
export const RECEIVE_EVENT_TYPES       = 'RECEIVE_EVENT_TYPES';
export const RECEIVE_EVENT_TYPE        = 'RECEIVE_EVENT_TYPE';
export const RESET_EVENT_TYPE_FORM     = 'RESET_EVENT_TYPE_FORM';
export const UPDATE_EVENT_TYPE         = 'UPDATE_EVENT_TYPE';
export const EVENT_TYPE_UPDATED        = 'EVENT_TYPE_UPDATED';
export const EVENT_TYPE_ADDED          = 'EVENT_TYPE_ADDED';
export const EVENT_TYPE_DELETED        = 'EVENT_TYPE_DELETED';
export const EVENT_TYPES_SEEDED        = 'EVENT_TYPES_SEEDED';

export const getEventTypes = ( ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        per_page     : 100,
        page         : 1
    };

    return getRequest(
        createAction(REQUEST_EVENT_TYPES),
        createAction(RECEIVE_EVENT_TYPES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/event-types`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEventType = (eventTypeId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : 'allowed_media_upload_types, allowed_media_upload_types.type',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_TYPE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/event-types/${eventTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_TYPE_FORM)({}));
};

export const saveEventType = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);
    const params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT_TYPE),
            createAction(EVENT_TYPE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/event-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_event_type.event_type_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_type.event_type_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_EVENT_TYPE),
            createAction(EVENT_TYPE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/event-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/event-types/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteEventType = (eventTypeId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_TYPE_DELETED)({eventTypeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/event-types/${eventTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const seedEventTypes = () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(EVENT_TYPES_SEEDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/event-types/seed-defaults`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    //remove # from color hexa
    normalizedEntity['color'] = normalizedEntity['color'].substr(1);

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['is_default']);

    if (normalizedEntity.class_name === 'EVENT_TYPE') {
        delete(normalizedEntity['should_be_available_on_cfp']);
        delete(normalizedEntity['use_speakers']);
        delete(normalizedEntity['are_speakers_mandatory']);
        delete(normalizedEntity['min_speakers']);
        delete(normalizedEntity['max_speakers']);
        delete(normalizedEntity['use_moderator']);
        delete(normalizedEntity['is_moderator_mandatory']);
        delete(normalizedEntity['min_moderators']);
        delete(normalizedEntity['max_moderators']);
        delete(normalizedEntity['moderator_label']);
        delete(normalizedEntity['min_duration']);
        delete(normalizedEntity['max_duration']);
    }

    if (normalizedEntity.show_always_on_schedule) {
        normalizedEntity.allowed_ticket_types = [];
    }

    return normalizedEntity;

}
