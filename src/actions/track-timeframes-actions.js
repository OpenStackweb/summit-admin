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
    deleteRequest,
    postRequest,
    putRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler,
    showMessage,
    showSuccessMessage,
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';
import history from "../history";
import T from "i18n-react";
import moment from "moment-timezone";

export const RECEIVE_TRACK_TIMEFRAMES       = 'RECEIVE_TRACK_TIMEFRAMES';
export const UPDATE_TRACK_TIMEFRAME        = 'UPDATE_TRACK_TIMEFRAME';
export const TRACK_TIMEFRAME_UPDATED        = 'TRACK_TIMEFRAME_UPDATED';
export const RESET_TRACK_TIMEFRAME_FORM          = 'RESET_TRACK_TIMEFRAME_FORM';
export const RECEIVE_TRACK_TIMEFRAME          = 'RECEIVE_TRACK_TIMEFRAME';
export const TRACK_TIMEFRAME_ADDED          = 'TRACK_TIMEFRAME_ADDED';
export const TRACK_TIMEFRAME_DELETED        = 'TRACK_TIMEFRAME_DELETED';
export const LOCATION_TIMEFRAME_ADDED    = 'LOCATION_TIMEFRAME_ADDED';
export const LOCATION_TIMEFRAME_DELETED    = 'LOCATION_TIMEFRAME_DELETED';
export const UPDATE_DAY_TIMEFRAME        = 'UPDATE_DAY_TIMEFRAME';
export const DAY_TIMEFRAME_UPDATED        = 'DAY_TIMEFRAME_UPDATED';
export const DAY_TIMEFRAME_ADDED          = 'DAY_TIMEFRAME_ADDED';
export const DAY_TIMEFRAME_DELETED        = 'DAY_TIMEFRAME_DELETED';

export const getTrackTimeframes = (page = 1, perPage = 10) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        page: page,
        per_page: perPage,
        access_token: accessToken,
        expand: 'proposed_schedule_allowed_locations,proposed_schedule_allowed_locations.location',
        'filter[]': ['has_proposed_schedule_allowed_locations==true']
    };

    return getRequest(
        null,
        createAction(RECEIVE_TRACK_TIMEFRAMES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks`,
        authErrorHandler,
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetTrackTimeframeForm = () => (dispatch) => {
    dispatch(createAction(RESET_TRACK_TIMEFRAME_FORM)({}));
};

export const getTrackTimeframe = (trackId) => async (dispatch, getState) => {
    
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    dispatch(startLoading());
    
    const params = {
        expand       : "proposed_schedule_allowed_locations,proposed_schedule_allowed_locations.location,proposed_schedule_allowed_locations.allowed_timeframes",
        access_token : accessToken,
    };
    
    return getRequest(
      null,
      createAction(RECEIVE_TRACK_TIMEFRAME),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}`,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};


export const deleteTrackTimeframe = (trackId) => async (dispatch, getState) => {
    
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    dispatch(startLoading());
    
    const params = {
        access_token : accessToken
    };
    
    return deleteRequest(
      null,
      createAction(TRACK_TIMEFRAME_DELETED)({trackId}),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}/proposed-schedule-allowed-locations/all`,
      null,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

export const saveLocationTimeframe = (trackId, locationId, redirect) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    
    const params = {
        access_token: accessToken,
        expand: 'location'
    };
    
    dispatch(startLoading());
    
    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("track_timeframes.timeframe_created"),
        type: 'success'
    };
    
    postRequest(
      null,
      createAction(LOCATION_TIMEFRAME_ADDED),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}/proposed-schedule-allowed-locations`,
      {location_id: locationId},
      authErrorHandler,
    )(params)(dispatch)
      .then(({response}) => {
          if (redirect) {
              dispatch(showMessage(
                success_message,
                () => { history.push(`/app/summits/${currentSummit.id}/track-chairs/track-timeframes/${response.track_id}`) }
              ));
          } else {
              dispatch(stopLoading());
          }
      });
}

export const deleteLocationTimeframe = (trackId, allowedLocationId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(LOCATION_TIMEFRAME_DELETED)({allowedLocationId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}/proposed-schedule-allowed-locations/${allowedLocationId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const saveDayTimeframe = (trackId, locationId, entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    
    const params = {
        access_token: accessToken,
    };
    
    dispatch(startLoading());
    
    const normalizedEntity = normalizeDayTimeframe(entity);
    
    
    if (entity.id) {
        putRequest(
          null,
          createAction(DAY_TIMEFRAME_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}/proposed-schedule-allowed-locations/${locationId}/allowed-time-frames`,
          normalizedEntity,
          authErrorHandler,
        )(params)(dispatch)
          .then(() => {
              dispatch(stopLoading());
          });
        
    } else {
        postRequest(
          null,
          createAction(DAY_TIMEFRAME_ADDED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}/proposed-schedule-allowed-locations/${locationId}/allowed-time-frames`,
          normalizedEntity,
          authErrorHandler,
        )(params)(dispatch)
          .then(() => {
              dispatch(stopLoading());
          });
    }
    
    
}

export const deleteDayTimeframe = (trackId, allowedLocationId, timeframeId) => async (dispatch, getState) => {
    
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    dispatch(startLoading());
    
    const params = {
        access_token : accessToken
    };
    
    return deleteRequest(
      null,
      createAction(DAY_TIMEFRAME_DELETED)({allowedLocationId, timeframeId}),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${trackId}/proposed-schedule-allowed-locations/${allowedLocationId}/allowed-time-frames/${timeframeId}`,
      null,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

const normalizeDayTimeframe = (entity) => {
    const {day, opening_hour, closing_hour} = entity;
    const normalizedEntity = {day};
    if (opening_hour) {
        normalizedEntity.opening_hour = parseInt(opening_hour.format('HHmm'));
    }
    if (closing_hour) {
        normalizedEntity.closing_hour = parseInt(closing_hour.format('HHmm'));
    }
    return normalizedEntity;
};