/**
 * Copyright 2021 OpenStack Foundation
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

import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler,
    putFile,
    postFile

} from 'openstack-uicore-foundation/lib/methods';

export const SCHEDULE_SETTING_LABEL_TYPE = 'LABEL';
export const SCHEDULE_SETTING_ENABLED_TYPE = 'ENABLED';

export const REQUEST_SCHEDULE_SETTINGS = 'REQUEST_SCHEDULE_SETTINGS';
export const RECEIVE_SCHEDULE_SETTINGS = 'RECEIVE_SCHEDULE_SETTINGS';
export const UPDATE_SCHEDULE_SETTING = 'UPDATE_SCHEDULE_SETTING';
export const SCHEDULE_SETTING_UPDATED = 'SCHEDULE_SETTING_UPDATED';
export const SCHEDULE_SETTING_ADDED = 'SCHEDULE_SETTING_ADDED';
export const REQUEST_SCHEDULE_EVENT_COLOR_ORIGIN = 'REQUEST_SCHEDULE_EVENT_COLOR_ORIGIN';
export const RECEIVE_SCHEDULE_EVENT_COLOR_ORIGIN = 'RECEIVE_SCHEDULE_EVENT_COLOR_ORIGIN';
export const SCHEDULE_EVENT_COLOR_ORIGIN_UPDATED = 'SCHEDULE_EVENT_COLOR_ORIGIN_UPDATED';

export const getScheduleSettings = () => (dispatch, getState) => {

    const {currentSummitState} = getState();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        page: 1,
        per_page: 100,
    };
    // filtering
    params.key__contains = "SCHEDULE_FILTER_BY_";
    // order
    params['order'] = `key`;

    return getRequest(
        createAction(REQUEST_SCHEDULE_SETTINGS),
        createAction(RECEIVE_SCHEDULE_SETTINGS),
        `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values/all/shows/${currentSummit.id}`,
        authErrorHandler,
        {}
    )(params)(dispatch).then(() => {
        params.key__contains = "SCHEDULE_EVENT_COLOR_ORIGIN";
        return getRequest(
            createAction(REQUEST_SCHEDULE_EVENT_COLOR_ORIGIN),
            createAction(RECEIVE_SCHEDULE_EVENT_COLOR_ORIGIN),
            `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values/all/shows/${currentSummit.id}`,
            authErrorHandler,
            {}
        )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        });
    });
};

const entityFactory = (summitId, key, type, filter, value) => {

    if (type == 'LABEL') {
        let entityId = filter.hasOwnProperty('value_id') ? filter['value_id'] : 0;
        return {
            id: entityId,
            key: key + "_LABEL",
            value: value,
            show_id : summitId,
            type : 'TEXT',
        };
    }

    let entityId = filter.hasOwnProperty('checked_id') ? filter['checked_id'] : 0;
    return {
        id: entityId,
        key: key + "_ENABLED",
        value: value ? "1" : "0",
        show_id : summitId,
        type : 'TEXT',
    }
}

export const saveScheduleSetting = (key, type, filter, value) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken } = loggedUserState;
    const {currentSummit} = currentSummitState;
    let entity = entityFactory(currentSummit.id, key, type, filter, value);
    const params = {access_token: accessToken};

    dispatch(startLoading());

    if (entity.id) {
        return putFile(
            createAction(UPDATE_SCHEDULE_SETTING),
            createAction(SCHEDULE_SETTING_UPDATED),
            `${window.MARKETING_API_BASE_URL}/api/v1/config-values/${entity.id}`,
            null,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(stopLoading());
            });

    }

    // creation

    return postFile(
        createAction(UPDATE_SCHEDULE_SETTING),
        createAction(SCHEDULE_SETTING_ADDED),
        `${window.MARKETING_API_BASE_URL}/api/v1/config-values`,
        null,
        entity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            // originally all settings are off, so if we are creating it. means
            // that we are turning on and we need to force the label save also...
            if(type == SCHEDULE_SETTING_ENABLED_TYPE){
                let entity = entityFactory(currentSummit.id, key, SCHEDULE_SETTING_LABEL_TYPE, filter, filter.value);
                postFile(
                    createAction(UPDATE_SCHEDULE_SETTING),
                    createAction(SCHEDULE_SETTING_ADDED),
                    `${window.MARKETING_API_BASE_URL}/api/v1/config-values`,
                    null,
                    entity,
                    authErrorHandler,
                    entity
                )(params)(dispatch)
                    .then((payload) => {
                        dispatch(stopLoading());
                });
            }
            else{
                dispatch(stopLoading());
            }
        });
};

export const saveEventColorOrigin = (value) => (dispatch, getState) => {

    const {currentSummitState, scheduleSettingState, loggedUserState} = getState();
    const {currentSummit} = currentSummitState;
    const { accessToken } = loggedUserState;
    const { eventColorOrigin } = scheduleSettingState;
    const params = {access_token: accessToken};
    dispatch(startLoading());

    let entity = {...eventColorOrigin, value: value ,show_id : currentSummit.id, type : 'TEXT'};

    if (entity.id) {
        return putFile(
            null,
            createAction(SCHEDULE_EVENT_COLOR_ORIGIN_UPDATED),
            `${window.MARKETING_API_BASE_URL}/api/v1/config-values/${entity.id}`,
            null,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(stopLoading());
            });

    }

    // creation

    return postFile(
        null,
        createAction(SCHEDULE_EVENT_COLOR_ORIGIN_UPDATED),
        `${window.MARKETING_API_BASE_URL}/api/v1/config-values`,
        null,
        entity,
        authErrorHandler,
        entity
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
    });
}
