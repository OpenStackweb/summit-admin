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

import {createAction, getRequest, putRequest, startLoading, stopLoading} from "openstack-uicore-foundation";
import {apiBaseUrl, authErrorHandler} from "./base-actions";
import T from "i18n-react/dist/i18n-react";


export const RECEIVE_SUMMIT           = 'RECEIVE_SUMMIT';
export const REQUEST_SUMMITS          = 'REQUEST_SUMMITS';
export const RECEIVE_SUMMITS          = 'RECEIVE_SUMMITS';
export const SET_CURRENT_SUMMIT       = 'SET_CURRENT_SUMMIT';
export const RESET_SUMMIT_FORM        = 'RESET_SUMMIT_FORM';
export const UPDATE_SUMMIT            = 'UPDATE_SUMMIT';
export const SUMMIT_UPDATED           = 'SUMMIT_UPDATED';
export const SUMMIT_ADDED             = 'SUMMIT_ADDED';
export const SUMMIT_DELETED           = 'SUMMIT_DELETED';

export const getSummitById = (summitId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'event_types,tracks'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMIT),
        `${apiBaseUrl}/api/v1/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const setCurrentSummit = (summit, history) => (dispatch, getState) =>
{
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    if (summit) {
        dispatch(startLoading());

        let params = {
            access_token : accessToken,
            expand: 'event_types,tracks'
        };

        return getRequest(
            null,
            createAction(SET_CURRENT_SUMMIT),
            `${apiBaseUrl}/api/v1/summits/${summit.id}`,
            authErrorHandler
        )(params)(dispatch).then(() => {
                dispatch(stopLoading());

                if(summit)
                    history.push(`/app/summits/${summit.id}/dashboard`);
            }
        );
    } else {
        dispatch({type: SET_CURRENT_SUMMIT, payload: {response: null} });
    }

}

export const loadSummits = () => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    getRequest(
        createAction(REQUEST_SUMMITS),
        createAction(RECEIVE_SUMMITS),
        `${apiBaseUrl}/api/v1/summits/all?expand=none&relations=none&access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch, getState).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const resetSummitForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SUMMIT_FORM)({}));
};

export const saveSummit = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken
    };

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_summit.summit_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_SUMMIT),
            createAction(SUMMIT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${entity.id}`,
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
            T.translate("edit_summit.summit_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_SUMMIT),
            createAction(SUMMIT_ADDED),
            `${apiBaseUrl}/api/v1/summits/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteSummit = (summitId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SUMMIT_DELETED)({summitId}),
        `${apiBaseUrl}/api/v1/summits/${summitId}`,
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

    return normalizedEntity;

}