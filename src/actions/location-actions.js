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

import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage, getCSV} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const REQUEST_LOCATIONS       = 'REQUEST_LOCATIONS';
export const RECEIVE_LOCATIONS       = 'RECEIVE_LOCATIONS';
export const RECEIVE_LOCATION        = 'RECEIVE_LOCATION';
export const RECEIVE_LOCATION_META   = 'RECEIVE_LOCATION_META';
export const RESET_LOCATION_FORM     = 'RESET_LOCATION_FORM';
export const UPDATE_LOCATION         = 'UPDATE_LOCATION';
export const LOCATION_UPDATED        = 'LOCATION_UPDATED';
export const LOCATION_ADDED          = 'LOCATION_ADDED';
export const LOCATION_DELETED        = 'LOCATION_DELETED';



export const getLocationMeta = () => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION_META),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/metadata`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getLocations = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand       : '',
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
    };

    return getRequest(
        createAction(REQUEST_LOCATIONS),
        createAction(RECEIVE_LOCATIONS),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getLocation = (locationId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : 'rooms,floors',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetLocationForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_FORM)({}));
};

export const saveLocation = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_location.location_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_LOCATION),
            createAction(LOCATION_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = [
            T.translate("general.done"),
            T.translate("edit_location.location_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_LOCATION),
            createAction(LOCATION_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/locations/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteLocation = (locationId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_DELETED)({locationId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const exportLocations = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filename = currentSummit.name + '-Locations.csv';
    let params = {
        access_token : accessToken
    };

    dispatch(getCSV(`${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/csv`, params, filename));

};

export const updateLocationOrder = (locationId, newOrder) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    putRequest(
        null,
        createAction(LOCATION_UPDATED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        {order: newOrder},
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));

}


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}
