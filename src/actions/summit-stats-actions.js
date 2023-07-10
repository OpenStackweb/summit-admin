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

import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_REGISTRATION_STATS      = 'REQUEST_REGISTRATION_STATS';
export const RECEIVE_REGISTRATION_STATS      = 'RECEIVE_REGISTRATION_STATS';
export const REQUEST_ATTENDEE_CHECK_INS      = 'REQUEST_ATTENDEE_CHECK_INS';
export const RECEIVE_ATTENDEE_CHECK_INS      = 'RECEIVE_ATTENDEE_CHECK_INS';
export const REGISTRATION_DATA_REQUESTED      = 'REGISTRATION_DATA_REQUESTED';
export const REGISTRATION_DATA_LOADED      = 'REGISTRATION_DATA_LOADED';

/**
 * @param fromDate
 * @param toDate
 * @returns {function(*=, *): *}
 */
export const getRegistrationStats = (fromDate = null , toDate = null) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const { currentSummit }   = currentSummitState;
    const filter = [];
    const accessToken = await getAccessTokenSafely();

    if (fromDate) {
        filter.push(`start_date>=${fromDate}`);
    }

    if (toDate) {
        filter.push(`end_date<=${toDate}`);
    }

    const params = {
        access_token : accessToken,
    };

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    return getRequest(
      createAction(REQUEST_REGISTRATION_STATS),
      createAction(RECEIVE_REGISTRATION_STATS),
      `${window.API_BASE_URL}/api/v1/summits/all/${currentSummit.id}/registration-stats`,
      authErrorHandler,
      {},
      true // use ETAGS
    )(params)(dispatch);
}

export const getAttendeeData = (fromDate = null , toDate = null, page = 1, groupBy = null) => async (dispatch, getState) => {
    const {currentSummitState, summitStatsState} = getState();
    const {currentSummit} = currentSummitState;
    const {timeUnit} = summitStatsState;
    const filter = [];
    const accessToken = await getAccessTokenSafely();
    
    if (fromDate) {
        filter.push(`start_date>=${fromDate}`);
    }
    
    if (toDate) {
        filter.push(`end_date<=${toDate}`);
    }
    
    const params = {
        access_token: accessToken,
        per_page: 100,
        page,
        group_by: groupBy || timeUnit
    };
    
    if (filter.length > 0) {
        params['filter[]'] = filter;
    }
    
    return getRequest(
      createAction(REQUEST_ATTENDEE_CHECK_INS),
      createAction(RECEIVE_ATTENDEE_CHECK_INS),
      `${window.API_BASE_URL}/api/v1/summits/all/${currentSummit.id}/registration-stats/check-ins`,
      authErrorHandler,
      {timeUnit: groupBy || timeUnit},
      true // use ETAGS
    )(params)(dispatch).then(({response}) => {
        if (page < response.last_page) {
            return getAttendeeData(fromDate, toDate, page + 1)(dispatch, getState);
        }
        
        return Promise.resolve();
    });
};

export const getRegistrationData = (fromDate = null , toDate = null, shouldDispatchLoad = true) => async (dispatch, getState) => {
    
    if (shouldDispatchLoad) dispatch(startLoading());
    
    dispatch(createAction(REGISTRATION_DATA_REQUESTED)({}));
    
    const regStatsPromise = getRegistrationStats(fromDate, toDate)(dispatch, getState);
    const attendeeDataPromise = getAttendeeData(fromDate, toDate)(dispatch, getState);
    
    Promise.all([regStatsPromise, attendeeDataPromise]).finally(() => {
        if (shouldDispatchLoad) dispatch(stopLoading());
        dispatch(createAction(REGISTRATION_DATA_LOADED)({}));
    })
}

export const changeTimeUnit = (unit, fromDate, toDate) => (dispatch, getState) => {
    getAttendeeData(fromDate, toDate, 1, unit)(dispatch, getState);
}