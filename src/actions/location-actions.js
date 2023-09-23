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

import Swal from "sweetalert2";
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
    postFile,
    putFile,
    showMessage,
    showSuccessMessage,
    getCSV,
    geoCodeAddress,
    geoCodeLatLng,
    authErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';
import {EVENT_CATEGORIES_SEEDED} from "./event-category-actions";

export const REQUEST_LOCATIONS          = 'REQUEST_LOCATIONS';
export const RECEIVE_LOCATIONS          = 'RECEIVE_LOCATIONS';
export const LOCATIONS_SEEDED          = 'LOCATIONS_SEEDED';
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
export const FLOOR_IMAGE_ATTACHED = 'FLOOR_IMAGE_ATTACHED';
export const FLOOR_IMAGE_DELETED  = 'FLOOR_IMAGE_DELETED';

export const RECEIVE_ROOM        = 'RECEIVE_ROOM';
export const RESET_ROOM_FORM     = 'RESET_ROOM_FORM';
export const UPDATE_ROOM         = 'UPDATE_ROOM';
export const ROOM_UPDATED        = 'ROOM_UPDATED';
export const ROOM_ADDED          = 'ROOM_ADDED';
export const ROOM_IMAGE_ATTACHED = 'ROOM_IMAGE_ATTACHED';
export const ROOM_DELETED        = 'ROOM_DELETED';
export const ATTRIBUTE_REMOVED   = 'ATTRIBUTE_REMOVED';
export const ATTRIBUTE_ADDED     = 'ATTRIBUTE_ADDED';
export const ROOM_IMAGE_DELETED  = 'ROOM_IMAGE_DELETED';

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



export const getLocationMeta = () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION_META),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/metadata`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getLocations = ( ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : '',
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
    };

    return getRequest(
        createAction(REQUEST_LOCATIONS),
        createAction(RECEIVE_LOCATIONS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const copyLocations = (fromSummitId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {access_token: accessToken};

    postRequest(
        null,
        createAction(LOCATIONS_SEEDED),
        `${window.API_BASE_URL}/api/v1/summits/${fromSummitId}/locations/copy/${currentSummit.id}`,
        null,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const getLocation = (locationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : 'rooms,floors,images,maps',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetLocationForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_FORM)({}));
};

export const saveLocation = (entity, allClasses) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeEntity(entity, allClasses);
    const class_name = entity.class_name.toLowerCase();

    if (entity.id) {

        putRequest(
            createAction(UPDATE_LOCATION),
            createAction(LOCATION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_location.location_saved")));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_location.location_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_LOCATION),
            createAction(LOCATION_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations`,
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

export const deleteLocation = (locationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_DELETED)({locationId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const exportLocations = ( ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-Locations.csv';
    const params = {
        access_token : accessToken
    };

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/csv`, params, filename));

};

export const updateLocationOrder = (locations, locationId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    const location = locations.find(l => l.id === locationId);

    putRequest(
        null,
        createAction(LOCATION_ORDER_UPDATED)(locations),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}`,
        location,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const updateLocationMap = (location) => (dispatch) => {

    const address = location.address_1 + ',' + location.address_2 + ',' + location.city + ',' + location.state + ',' + location.country ;

    dispatch(createAction(UPDATE_LOCATION)(location));

    geoCodeAddress(address)
        .then(function(results) {
            dispatch(createAction(LOCATION_GMAP_UPDATED)(results));
        })
        .catch(function(status) {
            Swal.fire(T.translate("edit_location.no_address_title"), T.translate("edit_location.no_address_body"), "warning");
        });
}

export const updateAddress = (location) => (dispatch) => {

    dispatch(createAction(UPDATE_LOCATION)(location));

    geoCodeLatLng(location.lat, location.lng)
        .then(function(results) {
            dispatch(createAction(LOCATION_ADDRESS_UPDATED)(results));
        })
        .catch(function(status) {
            Swal.fire(T.translate("edit_location.no_address_title"), T.translate("edit_location.no_address_body"), "warning");
        });
}


const normalizeEntity = (entity, allClasses) => {
    const normalizedEntity = {};
    const locationClass = allClasses.find(c => c.class_name === entity.class_name);

    for(var field in locationClass) {
        normalizedEntity[field] = entity[field];
    }

    normalizedEntity.opening_hour = (normalizedEntity.opening_hour)  ? parseInt(normalizedEntity.opening_hour) : null;
    normalizedEntity.closing_hour = (normalizedEntity.closing_hour) ? parseInt(normalizedEntity.closing_hour) : null;

    return normalizedEntity;

}



/**************************************** FLOORS *********************************************/


export const getFloor = (locationId, floorId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : 'rooms,images,maps',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_FLOOR),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${floorId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetFloorForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_FLOOR_FORM)({}));
};

export const saveFloor = (locationId, entity, continueAdding) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeFloorEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_floor.floor_saved")));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_floor.floor_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        if (continueAdding) {
                            window.location.reload();
                        } else {
                            history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/floors/${payload.response.id}`)
                        }
                    }
                ));
            });
    }
};

export const deleteFloor = (locationId, floorId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(FLOOR_DELETED)({floorId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${floorId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const attachFloorImage = (locationId, entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeFloorEntity(entity);

    const url = `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors`;

    if (entity.id) {
        dispatch(uploadFloorFile(locationId, entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_FLOOR),
            createAction(FLOOR_ADDED),
            `${url}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                    dispatch(uploadFloorFile(locationId, payload.response, file));
                }
            );
    }
};

const uploadFloorFile = (locationId, entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    postRequest(
        null,
        createAction(FLOOR_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${entity.id}/image?access_token=${accessToken}`,
        file,
        authErrorHandler,
        {image: entity.image}
    )({})(dispatch)
        .then(() => {
            dispatch(stopLoading());
            history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/floors/${entity.id}`);
        });
};

export const deleteFloorImage = (locationId, floorId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(FLOOR_IMAGE_DELETED)({floorId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/floors/${floorId}/image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeFloorEntity = (entity) => {
    const normalizedEntity = {...entity};
    return normalizedEntity;
}


/**************************************** ROOMS *********************************************/


export const getRoom = (locationId, roomId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ROOM),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/rooms/${roomId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRoomForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ROOM_FORM)({}));
};

export const saveRoom = (locationId, entity, continueAdding) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeRoomEntity(entity);
    let url = `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}`;
    if (entity.floor_id) {
        url += `/floors/${entity.floor_id}`;
    }
    url += (entity.class_name === 'SummitVenueRoom') ? `/rooms` : `/bookable-rooms`;

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

        const success_message = {
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
                    () => {
                        if (continueAdding) {
                            window.location.reload();
                        } else {
                            history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/rooms/${payload.response.id}`);
                        }
                    }
                ));
            });
    }
}

export const deleteRoom = (locationId, roomId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(ROOM_DELETED)({roomId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/rooms/${roomId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const attachRoomImage = (locationId, entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeRoomEntity(entity);

    let url = `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}`;
    url += (entity.class_name === 'SummitVenueRoom') ? `/rooms` : `/bookable-rooms`;

    if (entity.id) {
        dispatch(uploadRoomFile(locationId, entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_ROOM),
            createAction(ROOM_ADDED),
            `${url}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                    dispatch(uploadRoomFile(locationId, payload.response, file));
                }
            );
    }
};

const uploadRoomFile = (locationId, entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    postRequest(
        null,
        createAction(ROOM_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/rooms/${entity.id}/image?access_token=${accessToken}`,
        file,
        authErrorHandler,
        {image: entity.image}
    )({})(dispatch)
        .then(() => {
            dispatch(stopLoading());
            history.push(`/app/summits/${currentSummit.id}/locations/${locationId}/rooms/${entity.id}`);
        });
};

export const deleteRoomImage = (locationId, roomId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(ROOM_IMAGE_DELETED)({roomId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/rooms/${roomId}/image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeRoomEntity = (entity) => {
    const normalizedEntity = {...entity};

    if (normalizedEntity.order === 0) {
        delete(normalizedEntity['order']);
    }

    if (!normalizedEntity.floor_id) {
        delete(normalizedEntity.floor_id);
        delete(normalizedEntity.floor);
    }

    normalizedEntity.opening_hour = (normalizedEntity.opening_hour)  ? parseInt(normalizedEntity.opening_hour) : null;
    normalizedEntity.closing_hour = (normalizedEntity.closing_hour) ? parseInt(normalizedEntity.closing_hour) : null;

    return normalizedEntity;
}


/**********************  BOOKABLE ROOMS    ***************************************************/


export const addAttributeToRoom = (locationId, roomId, attribute) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    return putRequest(
        null,
        createAction(ATTRIBUTE_ADDED)({attribute}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/bookable-rooms/${roomId}/attributes/${attribute.id}`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const removeAttributeFromRoom = (locationId, roomId, attributeId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(ATTRIBUTE_REMOVED)({attributeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/venues/${locationId}/bookable-rooms/${roomId}/attributes/${attributeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};




/**************************************** IMAGES *********************************************/


export const getLocationImage = (locationId, imageId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION_IMAGE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images/${imageId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetLocationImageForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_IMAGE_FORM)({}));
};

export const saveLocationImage = (locationId, entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeImageEntity(entity);

    if (entity.id) {

        putFile(
            createAction(UPDATE_LOCATION_IMAGE),
            createAction(LOCATION_IMAGE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images/${entity.id}`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_location_image.image_saved")));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_location_image.image_created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_LOCATION_IMAGE),
            createAction(LOCATION_IMAGE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images`,
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

export const deleteLocationImage = (locationId, imageId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_IMAGE_DELETED)({imageId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/images/${imageId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeImageEntity = (entity) => {
    const normalizedEntity = {...entity};

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


export const getLocationMap = (locationId, mapId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_LOCATION_MAP),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps/${mapId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetLocationMapForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_LOCATION_MAP_FORM)({}));
};

export const saveLocationMap = (locationId, entity, file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeMapEntity(entity);

    if (entity.id) {

        putFile(
            createAction(UPDATE_LOCATION_MAP),
            createAction(LOCATION_MAP_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps/${entity.id}`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_location_map.map_saved")));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_location_map.map_created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_LOCATION_MAP),
            createAction(LOCATION_MAP_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps`,
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

export const deleteLocationMap = (locationId, mapId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_MAP_DELETED)({mapId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/maps/${mapId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeMapEntity = (entity) => {
    const normalizedEntity = {...entity};

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
