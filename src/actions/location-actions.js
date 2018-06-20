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
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    postFile,
    putFile,
    showMessage,
    showSuccessMessage,
    getCSV,
    geoCodeAddress,
    geoCodeLatLng
} from 'openstack-uicore-foundation/lib/methods';


export const REQUEST_LOCATIONS          = 'REQUEST_LOCATIONS';
export const RECEIVE_LOCATIONS          = 'RECEIVE_LOCATIONS';
export const RECEIVE_LOCATION           = 'RECEIVE_LOCATION';
export const RECEIVE_LOCATION_META      = 'RECEIVE_LOCATION_META';
export const RESET_LOCATION_FORM        = 'RESET_LOCATION_FORM';
export const UPDATE_LOCATION            = 'UPDATE_LOCATION';
export const LOCATION_UPDATED           = 'LOCATION_UPDATED';
export const LOCATION_ORDER_UPDATED     = 'LOCATION_ORDER_UPDATED';
export const LOCATION_ADDED             = 'LOCATION_ADDED';
export const LOCATION_DELETED           = 'LOCATION_DELETED';
export const LOCATION_GMAP_UPDATED      = 'LOCATION_GMAP_UPDATED';
export const LOCATION_ADDRESS_UPDATED   = 'LOCATION_ADDRESS_UPDATED';

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

export const RECEIVE_LOCATION_IMAGE        = 'RECEIVE_LOCATION_IMAGE';
export const RESET_LOCATION_IMAGE_FORM     = 'RESET_LOCATION_IMAGE_FORM';
export const UPDATE_LOCATION_IMAGE         = 'UPDATE_LOCATION_IMAGE';
export const LOCATION_IMAGE_UPDATED        = 'LOCATION_IMAGE_UPDATED';
export const LOCATION_IMAGE_ADDED          = 'LOCATION_IMAGE_ADDED';
export const LOCATION_IMAGE_DELETED        = 'LOCATION_IMAGE_DELETED';
export const LOCATION_IMAGE_ATTACHED       = 'LOCATION_IMAGE_ATTACHED';

export const RECEIVE_LOCATION_MAP        = 'RECEIVE_LOCATION_MAP';
export const RESET_LOCATION_MAP_FORM     = 'RESET_LOCATION_MAP_FORM';
export const UPDATE_LOCATION_MAP         = 'UPDATE_LOCATION_MAP';
export const LOCATION_MAP_UPDATED        = 'LOCATION_MAP_UPDATED';
export const LOCATION_MAP_ADDED          = 'LOCATION_MAP_ADDED';
export const LOCATION_MAP_DELETED        = 'LOCATION_MAP_DELETED';
export const LOCATION_MAP_ATTACHED       = 'LOCATION_MAP_ATTACHED';



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
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
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
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
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
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetLocationForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_FORM)({}));
};

export const saveLocation = (entity, allClasses, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(entity, allClasses);
    let class_name = entity.class_name.toLowerCase();

    if (entity.id) {

        putRequest(
            createAction(UPDATE_LOCATION),
            createAction(LOCATION_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_location.location_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_location.location_created"),
            type: 'success'
        };

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
                    success_message,
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
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
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

export const updateLocationOrder = (locations, locationId, newOrder) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    let location = locations.find(l => l.id == locationId);

    putRequest(
        null,
        createAction(LOCATION_ORDER_UPDATED)(locations),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        location,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const updateLocationMap = (location) => (dispatch) => {

    let address = location.address_1 + ',' + location.address_2 + ',' + location.city + ',' + location.state + ',' + location.country ;

    dispatch(createAction(UPDATE_LOCATION)(location));

    geoCodeAddress(address)
        .then(function(results) {
            dispatch(createAction(LOCATION_GMAP_UPDATED)(results));
        })
        .catch(function(status) {
            swal(T.translate("edit_location.no_address_title"), T.translate("edit_location.no_address_body"), "warning");
        });
}

export const updateAddress = (location) => (dispatch) => {

    dispatch(createAction(UPDATE_LOCATION)(location));

    geoCodeLatLng(location.lat, location.lng)
        .then(function(results) {
            dispatch(createAction(LOCATION_ADDRESS_UPDATED)(results));
        })
        .catch(function(status) {
            swal(T.translate("edit_location.no_address_title"), T.translate("edit_location.no_address_body"), "warning");
        });
}


const normalizeEntity = (entity, allClasses) => {
    let normalizedEntity = {};
    let locationClass = allClasses.find(c => c.class_name == entity.class_name);

    for(var field in locationClass) {
        normalizedEntity[field] = entity[field];
    }

    return normalizedEntity;

}



/**************************************** FLOORS *********************************************/


export const getFloor = (locationId, floorId) => (dispatch, getState) => {

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
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${floorId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetFloorForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_FLOOR_FORM)({}));
};

export const saveFloor = (locationId, entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeFloorEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_floor.floor_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_floor.floor_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/floors/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteFloor = (locationId, floorId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(FLOOR_DELETED)({floorId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${floorId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeFloorEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}


/**************************************** ROOMS *********************************************/


export const getRoom = (locationId, roomId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ROOM),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/rooms/${roomId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRoomForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ROOM_FORM)({}));
};

export const saveRoom = (locationId, entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeRoomEntity(entity);
    let url = `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}`;
    if (entity.floor_id) {
        url += `/floors/${entity.floor_id}`;
    }
    url += `/rooms`;

    if (entity.id) {

        putRequest(
            createAction(UPDATE_ROOM),
            createAction(ROOM_UPDATED),
            `${url}/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_room.room_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_room.room_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_ROOM),
            createAction(ROOM_ADDED),
            url,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/rooms/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteRoom = (locationId, roomId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(ROOM_DELETED)({roomId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/rooms/${roomId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeRoomEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (normalizedEntity.order == 0) {
        delete(normalizedEntity['order']);
    }


    return normalizedEntity;

}


/**************************************** IMAGES *********************************************/


export const getLocationImage = (locationId, imageId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION_IMAGE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images/${imageId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetLocationImageForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_IMAGE_FORM)({}));
};

export const saveLocationImage = (locationId, entity, file, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeImageEntity(entity);

    if (entity.id) {

        putFile(
            createAction(UPDATE_LOCATION_IMAGE),
            createAction(LOCATION_IMAGE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images/${entity.id}`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_location_image.image_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_location_image.image_created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_LOCATION_IMAGE),
            createAction(LOCATION_IMAGE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/images/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteLocationImage = (locationId, imageId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_IMAGE_DELETED)({imageId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images/${imageId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeImageEntity = (entity) => {
    let normalizedEntity = {...entity};

    delete(normalizedEntity['location_id']);
    delete(normalizedEntity['image_url']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['class_name']);
    delete(normalizedEntity['order']);
    delete(normalizedEntity['id']);
    delete(normalizedEntity['file']);

    return normalizedEntity;

}

/**************************************** MAPS *********************************************/


export const getLocationMap = (locationId, mapId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION_MAP),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps/${mapId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetLocationMapForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_MAP_FORM)({}));
};

export const saveLocationMap = (locationId, entity, file, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeMapEntity(entity);

    if (entity.id) {

        putFile(
            createAction(UPDATE_LOCATION_MAP),
            createAction(LOCATION_MAP_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps/${entity.id}`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_location_map.map_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_location_map.map_created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_LOCATION_MAP),
            createAction(LOCATION_MAP_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/maps/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteLocationMap = (locationId, mapId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_MAP_DELETED)({mapId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps/${mapId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeMapEntity = (entity) => {
    let normalizedEntity = {...entity};

    delete(normalizedEntity['location_id']);
    delete(normalizedEntity['image_url']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['class_name']);
    delete(normalizedEntity['order']);
    delete(normalizedEntity['id']);
    delete(normalizedEntity['file']);

    return normalizedEntity;

}
