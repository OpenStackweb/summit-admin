/**
 * Copyright 2022 OpenStack Foundation
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
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const CLEAR_LOG_PARAMS = 'CLEAR_LOG_PARAMS';
export const REQUEST_LOG = 'REQUEST_LOG';
export const RECEIVE_LOG = 'RECEIVE_LOG';

export const getSummitAuditLog = (term = null, page = 1, perPage = 100, order = null, orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [`class_name==SummitEventAuditLog`];
    filter.push(`summit_id==${currentSummit.id}`);

    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`user_full_name=@${escapedTerm},action=@${escapedTerm}`);
    }

    const params = {
        page: page,
        per_page: perPage,
        expand: 'user',
        access_token: accessToken,
    };

    params['filter[]'] = filter;

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_LOG),
        createAction(RECEIVE_LOG),
        `${window.API_BASE_URL}/api/v1/audit-logs`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSummitEventAuditLog = (eventId, term = null, page = 1, perPage = 100, order = null, orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [`class_name==SummitEventAuditLog`];
    filter.push(`summit_id==${currentSummit.id}`);
    filter.push(`event_id==${eventId}`);

    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`user_email=@${escapedTerm},user_full_name=@${escapedTerm},action=@${escapedTerm}`);
    }

    const params = {
        page: page,
        per_page: perPage,
        expand: 'user',
        access_token: accessToken,
    };

    params['filter[]'] = filter;

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_LOG),
        createAction(RECEIVE_LOG),
        `${window.API_BASE_URL}/api/v1/audit-logs`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const clearAuditLogParams = () => async (dispatch, getState) => {
    dispatch(createAction(CLEAR_LOG_PARAMS)());
};