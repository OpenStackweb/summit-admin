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

export const RECEIVE_EVENT_MATERIAL        = 'RECEIVE_EVENT_MATERIAL';
export const RESET_EVENT_MATERIAL_FORM     = 'RESET_EVENT_MATERIAL_FORM';
export const UPDATE_EVENT_MATERIAL         = 'UPDATE_EVENT_MATERIAL';
export const EVENT_MATERIAL_UPDATED        = 'EVENT_MATERIAL_UPDATED';
export const EVENT_MATERIAL_ADDED          = 'EVENT_MATERIAL_ADDED';
export const EVENT_MATERIAL_DELETED        = 'EVENT_MATERIAL_DELETED';


export const getEventMaterial = (eventMaterialId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState, currentSummitEventState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let eventId             = currentSummitEventState.entity.id

    dispatch(startLoading());

    let params = {
        expand       : '',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_MATERIAL),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}/${eventMaterialId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventMaterialForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_MATERIAL_FORM)({}));
};

export const saveEventMaterial = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState, currentSummitEventState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let eventId             = currentSummitEventState.entity.id

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT_MATERIAL),
            createAction(EVENT_MATERIAL_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}/materials/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_event_material.event_material_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_material.event_material_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_EVENT_MATERIAL),
            createAction(EVENT_MATERIAL_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}/materials`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/events/${eventId}/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteEventMaterial = (eventMaterialId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState, currentSummitEventState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let eventId             = currentSummitEventState.entity.id

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_MATERIAL_DELETED)({eventMaterialId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}/materials/${eventMaterialId}`,
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
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['is_default']);

    /*if (normalizedEntity.class_name == 'EVENT_MATERIAL') {
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
    }*/

    return normalizedEntity;

}
