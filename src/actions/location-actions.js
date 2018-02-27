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

export const RECEIVE_FLOOR        = 'RECEIVE_FLOOR';
export const RESET_FLOOR_FORM     = 'RESET_FLOOR_FORM';
export const UPDATE_FLOOR         = 'UPDATE_FLOOR';
export const FLOOR_UPDATED        = 'FLOOR_UPDATED';
export const FLOOR_ADDED          = 'FLOOR_ADDED';
export const FLOOR_DELETED        = 'FLOOR_DELETED';

export const RECEIVE_ROOM        = 'RECEIVE_ROOM';
export const RESET_ROOM_FORM     = 'RESET_ROOM_FORM';
export const UPDATE_ROOM         = 'UPDATE_ROOM';
export const ROOM_UPDATED        = 'ROOM_UPDATED';
export const ROOM_ADDED          = 'ROOM_ADDED';
export const ROOM_DELETED        = 'ROOM_DELETED';




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



/**************************************** FLOORS *********************************************/


export const getFloor = (floorId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : 'rooms',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_FLOOR),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/floors/${floorId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetFloorForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_FLOOR_FORM)({}));
};

export const saveFLoor = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeFloorEntity(entity);

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_location.floor_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_UPDATED),
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
            T.translate("edit_location.floor_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_ADDED),
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

export const deleteFLoor = (floorId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(FLOOR_DELETED)({floorId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

const normalizeFloorEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}


/**************************************** ROOMS *********************************************/


export const getRoom = (roomId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_FLOOR),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/rooms/${floorId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetRoomForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ROOM_FORM)({}));
};

export const saveRoom = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeRoomEntity(entity);

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_location.room_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_ROOM),
            createAction(ROOM_UPDATED),
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
            T.translate("edit_location.room_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_ROOM),
            createAction(ROOM_ADDED),
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

export const deleteRoom = (roomId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(ROOM_DELETED)({roomId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${roomId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

const normalizeRoomEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}

export const queryRooms = (input, summitId = null) => {

    let accessToken = window.accessToken;

    return fetch(`${apiBaseUrl}/api/v1/rooms?filter=tag=@${input}&order=tag&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((r) => ({room: r.name, id: r.id}) );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};