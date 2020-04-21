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
    authErrorHandler, putFile, postFile
} from 'openstack-uicore-foundation/lib/methods';
import {LOCATION_IMAGE_ADDED, LOCATION_IMAGE_UPDATED, UPDATE_LOCATION_IMAGE} from "./location-actions";

export const REQUEST_SETTINGS       = 'REQUEST_SETTINGS';
export const RECEIVE_SETTINGS      = 'RECEIVE_SETTINGS';
export const RECEIVE_SETTING        = 'RECEIVE_SETTING';
export const RESET_SETTING_FORM     = 'RESET_SETTING_FORM';
export const UPDATE_SETTING         = 'UPDATE_SETTING';
export const SETTING_UPDATED        = 'SETTING_UPDATED';
export const SETTING_ADDED          = 'SETTING_ADDED';
export const SETTING_DELETED        = 'SETTING_DELETED';

export const getMarketingSettings = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [`show_id==${currentSummit.id}`];

    dispatch(startLoading());

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`key=@${escapedTerm}`);
    }

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_SETTINGS),
        createAction(RECEIVE_SETTINGS),
        `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values`,
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
        `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values/${settingId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSettingForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SETTING_FORM)({}));
};

export const saveMarketingSetting = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity, currentSummit.id);
    let params = { access_token : accessToken };

    /*if (entity.id) {

        putRequest(
            createAction(UPDATE_SETTING),
            createAction(SETTING_UPDATED),
            `${window.MARKETING_API_BASE_URL}/api/v1/config-values/${entity.id}`,
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
            `${window.MARKETING_API_BASE_URL}/api/v1/config-values`,
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
    }*/

    if (entity.id) {

        putFile(
            createAction(UPDATE_SETTING),
            createAction(SETTING_UPDATED),
            `${window.MARKETING_API_BASE_URL}/api/v1/config-values/${entity.id}`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("marketing.setting_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("marketing.setting_created"),
            type: 'success'
        };

        postFile(
            createAction(UPDATE_SETTING),
            createAction(SETTING_ADDED),
            `${window.MARKETING_API_BASE_URL}/api/v1/config-values`,
            file,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/marketing/${payload.response.id}`) }
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
        `${window.MARKETING_API_BASE_URL}/api/v1/config-values/${settingId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity, summitId) => {
    let normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);
    normalizedEntity.show_id = summitId;

    return normalizedEntity;

}
