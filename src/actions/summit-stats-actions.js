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

export const getRegistrationStats = (fromDate, toDate) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const { currentSummit }   = currentSummitState;
    const filter = [];
    const accessToken = await getAccessTokenSafely();
    dispatch(startLoading());

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
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
}