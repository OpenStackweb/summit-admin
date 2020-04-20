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
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_SETTINGS       = 'REQUEST_SETTINGS';
export const RECEIVE_SETTINGS      = 'RECEIVE_SETTINGS';
export const RECEIVE_SETTING        = 'RECEIVE_SETTING';
export const RESET_SETTING_FORM     = 'RESET_SETTING_FORM';
export const UPDATE_SETTING         = 'UPDATE_SETTING';
export const SETTING_UPDATED        = 'SETTING_UPDATED';
export const SETTING_ADDED          = 'SETTING_ADDED';
export const SETTING_DELETED        = 'SETTING_DELETED';

export const getMarketingSettings = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        per_page     : 100,
        page         : 1
    };

    return getRequest(
        createAction(REQUEST_SETTINGS),
        createAction(RECEIVE_SETTINGS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/marketing-settings`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getMarketingSetting = (settingId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand       : '',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_SETTING),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/marketing-settings/${settingId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSettingForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SETTING_FORM)({}));
};

export const saveMarketingSetting = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SETTING),
            createAction(SETTING_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/marketing-settings/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_marketing.setting_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_marketing.setting_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SETTING),
            createAction(SETTING_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/marketing-settings`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/marketing-settings/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteSetting = (settingId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SETTING_DELETED)({settingId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/marketing-settings/${settingId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    //remove # from color hexa
    normalizedEntity['color'] = normalizedEntity['color'].substr(1);

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['is_default']);

    return normalizedEntity;

}
