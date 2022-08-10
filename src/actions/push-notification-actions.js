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
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_PUSH_NOTIFICATIONS       = 'REQUEST_PUSH_NOTIFICATIONS';
export const RECEIVE_PUSH_NOTIFICATIONS       = 'RECEIVE_PUSH_NOTIFICATIONS';
export const RECEIVE_PUSH_NOTIFICATION        = 'RECEIVE_PUSH_NOTIFICATION';
export const RESET_PUSH_NOTIFICATION_FORM     = 'RESET_PUSH_NOTIFICATION_FORM';
export const UPDATE_PUSH_NOTIFICATION         = 'UPDATE_PUSH_NOTIFICATION';
export const PUSH_NOTIFICATION_UPDATED        = 'PUSH_NOTIFICATION_UPDATED';
export const PUSH_NOTIFICATION_ADDED          = 'PUSH_NOTIFICATION_ADDED';
export const PUSH_NOTIFICATION_DELETED        = 'PUSH_NOTIFICATION_DELETED';
export const PUSH_NOTIFICATION_APPROVED       = 'PUSH_NOTIFICATION_APPROVED';
export const PUSH_NOTIFICATION_REJECTED       = 'PUSH_NOTIFICATION_REJECTED';


export const getPushNotifications = ( page = 1, perPage = 10, order = 'created', orderDir = -1, filters ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if (filters) {
        if (filters.approved_filter !== 'ALL') {
            filter.push(`approved==${filters.approved_filter}`);
        }

        if (filters.sent_filter !== 'ALL') {
            filter.push(`is_sent==${filters.sent_filter}`);
        }

        if (filters.channel_filter !== 'ALL') {
            filter.push(`channel==${filters.channel_filter}`);
        }
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_PUSH_NOTIFICATIONS),
        createAction(RECEIVE_PUSH_NOTIFICATIONS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications`,
        authErrorHandler,
        {order, orderDir}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getPushNotification = (pushNotificationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_PUSH_NOTIFICATION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications/${pushNotificationId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetPushNotificationForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_PUSH_NOTIFICATION_FORM)({}));
};

export const savePushNotification = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_PUSH_NOTIFICATION),
            createAction(PUSH_NOTIFICATION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_push_notification.push_notification_saved")));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_push_notification.push_notification_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_PUSH_NOTIFICATION),
            createAction(PUSH_NOTIFICATION_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/push-notifications`) }
                ));
            });
    }
};

export const deletePushNotification = (pushNotificationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(PUSH_NOTIFICATION_DELETED)({pushNotificationId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications/${pushNotificationId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const approvePushNotification = (pushNotificationId) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    putRequest(
        null,
        createAction(PUSH_NOTIFICATION_APPROVED)({pushNotificationId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications/${pushNotificationId}/approve`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
        });
};


export const rejectPushNotification = (pushNotificationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(PUSH_NOTIFICATION_REJECTED)({pushNotificationId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/notifications/${pushNotificationId}/approve`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    if (entity.members.length > 0) {
        normalizedEntity['recipient_ids'] = entity.members.map(m => m.id);
        delete(normalizedEntity['members']);
    }

    if (entity.event) {
        normalizedEntity['event_id'] = entity.event.id;
        delete(normalizedEntity['event']);
    }

    if (entity.group) {
        normalizedEntity['group_id'] = entity.group.id;
        delete(normalizedEntity['group']);
    }

    delete(normalizedEntity['id']);

    return normalizedEntity;

}
