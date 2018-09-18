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
} from "openstack-uicore-foundation/lib/methods";


export const AFFILIATION_SAVED        = 'AFFILIATION_SAVED';
export const AFFILIATION_DELETED      = 'AFFILIATION_DELETED';
export const AFFILIATION_ADDED        = 'AFFILIATION_ADDED';
export const ORGANIZATION_ADDED        = 'ORGANIZATION_ADDED';


export const addOrganization = (organization, callback) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    postRequest(
        null,
        createAction(ORGANIZATION_ADDED),
        `${apiBaseUrl}/api/v1/organizations`,
        {name: organization},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
        callback(payload.response);
    });

}


export const addAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'organization'
    };

    let normalizedEntity = normalizeEntity(affiliation);

    postRequest(
        null,
        createAction(AFFILIATION_ADDED),
        `${apiBaseUrl}/api/v1/members/${affiliation.owner_id}/affiliations`,
        normalizedEntity,
        authErrorHandler,
        affiliation
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
    });

}

export const saveAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());


    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(affiliation);

    putRequest(
        null,
        createAction(AFFILIATION_SAVED),
        `${apiBaseUrl}/api/v1/members/${affiliation.owner_id}/affiliations/${affiliation.id}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
    });

}

export const deleteAffiliation = (ownerId, affiliationId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(AFFILIATION_DELETED)({affiliationId}),
        `${apiBaseUrl}/api/v1/members/${ownerId}/affiliations/${affiliationId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (!normalizedEntity.end_date) delete(normalizedEntity['end_date']);

    normalizedEntity.organization_id = (normalizedEntity.organization != null) ? normalizedEntity.organization.id : 0;
    delete(normalizedEntity['organization']);

    return normalizedEntity;

}
