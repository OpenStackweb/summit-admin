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

export const RECEIVE_SUMMIT                 = 'RECEIVE_SUMMIT';
export const REQUEST_SUMMITS                = 'REQUEST_SUMMITS';
export const RECEIVE_SUMMITS                = 'RECEIVE_SUMMITS';
export const SET_CURRENT_SUMMIT             = 'SET_CURRENT_SUMMIT';

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

export const setCurrentSummit = (summit, history) => (dispatch) =>
{
    dispatch({
        type: SET_CURRENT_SUMMIT,
        payload: summit
    });
    if(summit)
        history.push(`/app/summits/${summit.id}/dashboard`);
}

export const loadSummits = () => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());
    getRequest(
        createAction(REQUEST_SUMMITS),
        createAction(RECEIVE_SUMMITS),
        `${apiBaseUrl}/api/v1/summits?access_token=${accessToken}&expand=event_types,tracks`,
        authErrorHandler
    )({})(dispatch, getState).then(() => {
            dispatch(stopLoading());
        }
    );
}