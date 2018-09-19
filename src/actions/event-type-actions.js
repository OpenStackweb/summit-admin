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

import { authErrorHandler, apiBaseUrl } from './base-actions';
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
    showSuccessMessage
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_EVENT_TYPES       = 'REQUEST_EVENT_TYPES';
export const RECEIVE_EVENT_TYPES       = 'RECEIVE_EVENT_TYPES';
export const RECEIVE_EVENT_TYPE        = 'RECEIVE_EVENT_TYPE';
export const RESET_EVENT_TYPE_FORM     = 'RESET_EVENT_TYPE_FORM';
export const UPDATE_EVENT_TYPE         = 'UPDATE_EVENT_TYPE';
export const EVENT_TYPE_UPDATED        = 'EVENT_TYPE_UPDATED';
export const EVENT_TYPE_ADDED          = 'EVENT_TYPE_ADDED';
export const EVENT_TYPE_DELETED        = 'EVENT_TYPE_DELETED';
export const EVENT_TYPES_SEEDED        = 'EVENT_TYPES_SEEDED';

export const getEventTypes = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        per_page     : 100,
        page         : 1
    };

    return getRequest(
        createAction(REQUEST_EVENT_TYPES),
        createAction(RECEIVE_EVENT_TYPES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEventType = (eventTypeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : '',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_TYPE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${eventTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_TYPE_FORM)({}));
};

export const saveEventType = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT_TYPE),
            createAction(EVENT_TYPE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_event_type.event_type_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_type.event_type_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_EVENT_TYPE),
            createAction(EVENT_TYPE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types`,
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

export const deleteEventType = (eventTypeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_TYPE_DELETED)({eventTypeId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${eventTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const seedEventTypes = () => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(EVENT_TYPES_SEEDED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/seed-defaults`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    //remove # from color hexa
    normalizedEntity['color'] = normalizedEntity['color'].substr(1);

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['is_default']);

    if (normalizedEntity.class_name == 'EVENT_TYPE') {
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
    }

    return normalizedEntity;

}
