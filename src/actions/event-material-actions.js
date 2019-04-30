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
import {LOCATION_IMAGE_ADDED, LOCATION_IMAGE_UPDATED, UPDATE_LOCATION_IMAGE} from "./location-actions";

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
    let event               = currentSummitEventState.entity;

    dispatch(startLoading());

    let material = event.materials.find(m => m.id == eventMaterialId);

    if (material) {
        dispatch(createAction(RECEIVE_EVENT_MATERIAL)({material}));
    } else {
        let message = {
            title: T.translate("errors.not_found"),
            html: T.translate("errors.entity_not_found"),
            type: 'error'
        };

        dispatch(showMessage(
            message,
            () => { history.push(`/app/summits/${currentSummit.id}/events/${event.id}`) }
        ));
    }


    dispatch(stopLoading());

};

export const resetEventMaterialForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_MATERIAL_FORM)({}));
};

export const saveEventMaterial = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState, currentSummitEventState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let eventId             = currentSummitEventState.entity.id

    let slug = entity.class_name == 'PresentationLink' ? 'links' : (entity.class_name == 'PresentationVideo' ? 'videos' : 'slides');

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT_MATERIAL),
            createAction(EVENT_MATERIAL_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/${slug}/${entity.id}`,
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
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/${slug}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/events/${eventId}`) }
                ));
            });
    }
}

export const saveSlide = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState, currentSummitEventState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let eventId             = currentSummitEventState.entity.id;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putFile(
            createAction(UPDATE_EVENT_MATERIAL),
            createAction(EVENT_MATERIAL_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/slides/${entity.id}`,
            file,
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

        postFile(
            createAction(UPDATE_EVENT_MATERIAL),
            createAction(EVENT_MATERIAL_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/slides`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/events/${eventId}`) }
                ));
            });
    }
}

export const deleteEventMaterial = (eventMaterialId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState, currentSummitEventState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let event               = currentSummitEventState.entity;
    let material            = event.materials.find(m => m.id == eventMaterialId);

    if (!material) {
        dispatch(stopLoading());
        dispatch(showMessage({title: 'Not found', html: 'Cannot find material.', type: 'warning'}));
        return;
    }

    let slug = material.class_name == 'PresentationLink' ? 'links' : (material.class_name == 'PresentationVideo' ? 'videos' : 'slides');

    let params = {
        access_token : accessToken
    };


    return deleteRequest(
        null,
        createAction(EVENT_MATERIAL_DELETED)({eventMaterialId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${event.id}/${slug}/${eventMaterialId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (entity.class_name != 'PresentationVideo') {
        delete(normalizedEntity['youtube_id']);
    }

    if (entity.class_name == 'PresentationVideo') {
        delete(normalizedEntity['link']);
    }

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['is_default']);
    delete(normalizedEntity['display_on_site_label']);
    delete(normalizedEntity['order']);
    delete(normalizedEntity['presentation_id']);
    delete(normalizedEntity['file']);
    delete(normalizedEntity['file_link']);
    delete(normalizedEntity['has_file']);



    return normalizedEntity;

}
