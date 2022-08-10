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
    putRequest,
    postRequest,
    deleteRequest,
    showMessage,
    showSuccessMessage
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

import history from "../history";
import T from "i18n-react";

export const REQUEST_ALL_SCHEDULE_SETTINGS = 'REQUEST_ALL_SCHEDULE_SETTINGS';
export const RECEIVE_ALL_SCHEDULE_SETTINGS = 'RECEIVE_ALL_SCHEDULE_SETTINGS';
export const RESET_SCHEDULE_SETTINGS_FORM = 'RESET_SCHEDULE_SETTINGS_FORM';
export const REQUEST_SCHEDULE_SETTINGS = 'REQUEST_SCHEDULE_SETTINGS';
export const RECEIVE_SCHEDULE_SETTINGS = 'RECEIVE_SCHEDULE_SETTINGS';
export const SCHEDULE_SETTING_DELETED = 'SCHEDULE_SETTING_DELETED';
export const UPDATE_SCHEDULE_SETTINGS = 'UPDATE_SCHEDULE_SETTINGS';
export const SCHEDULE_SETTINGS_UPDATED = 'SCHEDULE_SETTINGS_UPDATED';
export const SCHEDULE_SETTINGS_ADDED = 'SCHEDULE_SETTINGS_ADDED';
export const DEFAULT_SCHEDULE_SETTINGS_SEEDED = 'DEFAULT_SCHEDULE_SETTINGS_SEEDED';

export const FILTER_TYPES = {
    date: 'DATE',
    track: 'TRACK',
    tags: 'TAGS',
    track_groups: 'TRACK_GROUPS',
    company: 'COMPANY',
    level: 'LEVEL',
    speakers: 'SPEAKERS',
    venues: 'VENUES',
    event_types: 'EVENT_TYPES',
    title: 'TITLE',
    custom_order: 'CUSTOM_ORDER',
    abstract: 'ABSTRACT'
};

export const seedDefaultScheduleSettings = () => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return postRequest(
        null,
        createAction(DEFAULT_SCHEDULE_SETTINGS_SEEDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/schedule-settings/seed`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const getAllScheduleSettings = ( order = 'key', orderDir = 1 ) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
    };

    // order
    if(order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_ALL_SCHEDULE_SETTINGS),
        createAction(RECEIVE_ALL_SCHEDULE_SETTINGS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/schedule-settings`,
        authErrorHandler,
        {order, orderDir}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getScheduleSetting = (scheduleSettingId) => (dispatch, getState) => {
    const {currentSummitState} = getState();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'filters,pre_filters,pre_filters.values',
    };

    return getRequest(
        createAction(REQUEST_SCHEDULE_SETTINGS),
        createAction(RECEIVE_SCHEDULE_SETTINGS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/schedule-settings/${scheduleSettingId}`,
        authErrorHandler,
        {}
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
    });
};

export const deleteScheduleSetting = (scheduleSettingId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SCHEDULE_SETTING_DELETED)({scheduleSettingId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/schedule-settings/${scheduleSettingId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const resetScheduleSettingsForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SCHEDULE_SETTINGS_FORM)({}));
};

export const saveScheduleSettings = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const params = {
        access_token: accessToken,
        expand: 'filters,pre_filters'
    };

    const normalizedEntity = normalizeEntity(entity);

    dispatch(startLoading());

    if (entity.id) {
        putRequest(
            createAction(UPDATE_SCHEDULE_SETTINGS),
            createAction(SCHEDULE_SETTINGS_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/schedule-settings/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_schedule_settings.saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_schedule_settings.created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SCHEDULE_SETTINGS),
            createAction(SCHEDULE_SETTINGS_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/schedule-settings/`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/schedule-settings/${payload.response.id}`) }
                ));
            });
    }
};

const normalizeEntity = (entity) => {
    const normalized = {...entity};
    delete(normalized.id);

    normalized.filters = entity.filters.map(f => ({type: f.type, label: f.label, is_enabled: f.is_enabled}));
    normalized.pre_filters = entity.pre_filters.map(pf => {
        let values = pf.values;
        if(pf.type === FILTER_TYPES.company){
            values = values.map( v => v.id);
        }
        if(pf.type === FILTER_TYPES.speakers){
            values = values.map( v => v.id);
        }
        if(pf.type === FILTER_TYPES.tags){
            values = values.map( v => v.tag);
        }
        return ({type: pf.type, values})
    });

    return normalized;
}