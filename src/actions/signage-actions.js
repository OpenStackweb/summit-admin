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
    escapeFilterValue,
    putRequest,
    postRequest,
    deleteRequest,
    fetchErrorHandler,
    showSuccessMessage
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';
import Ably from "ably";
import T from "i18n-react";
import Swal from "sweetalert2";

export const REQUEST_SIGN = 'REQUEST_SIGN';
export const RECEIVE_SIGN = 'RECEIVE_SIGN';
export const UPDATE_SIGN = 'UPDATE_SIGN';
export const SIGN_UPDATED = 'SIGN_UPDATED';
export const SIGN_ADDED = 'SIGN_ADDED';
export const REQUEST_SIGNAGE_EVENTS = 'REQUEST_SIGNAGE_EVENTS';
export const RECEIVE_SIGNAGE_EVENTS = 'RECEIVE_SIGNAGE_EVENTS';
export const RECEIVE_SIGNAGE_TEMPLATES = 'RECEIVE_SIGNAGE_TEMPLATES';
export const REQUEST_SIGNAGE_BANNERS = 'REQUEST_SIGNAGE_BANNERS';
export const RECEIVE_SIGNAGE_BANNERS = 'RECEIVE_SIGNAGE_BANNERS';
export const REQUEST_SIGNAGE_LOCATIONS = 'REQUEST_SIGNAGE_LOCATIONS';
export const RECEIVE_SIGNAGE_LOCATIONS = 'RECEIVE_SIGNAGE_LOCATIONS';
export const UPDATE_SIGNAGE_BANNER = 'UPDATE_SIGNAGE_BANNER';
export const SIGNAGE_BANNER_UPDATED = 'SIGNAGE_BANNER_UPDATED';
export const SIGNAGE_BANNER_ADDED = 'SIGNAGE_BANNER_ADDED';
export const SIGNAGE_BANNER_DELETED = 'SIGNAGE_BANNER_DELETED';
export const SIGNAGE_UPDATED = 'SIGNAGE_UPDATED';
export const SIGNAGE_STATIC_BANNER_UPDATED = 'SIGNAGE_STATIC_BANNER_UPDATED';

const AblyApiKey = process.env['SIGNAGE_ABLY_API_KEY'];
const realtimeAbly = AblyApiKey ? new Ably.Realtime(AblyApiKey) : null;

const getAblyChannel = (summitId, locationId) => `SIGNAGE:${summitId}:${locationId}`;


const publishToAblyChannel = async (channel, key, message) => {
    if (!realtimeAbly) {
        Swal.fire("Publish failed", "No Ably API key found", "warning");
        return false;
    }
    
    const ablyChannel = realtimeAbly.channels.get(channel);
    
    ablyChannel.subscribe((msg) => {
        console.log("Received: " + JSON.stringify(msg.data));
    });
    
    ablyChannel.publish(key, message);
    
    return true;
}

export const getSign = (locationId) => async (dispatch, getState) => {
    
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    
    dispatch(startLoading());
    
    const params = {
        access_token: accessToken,
        'filter[]': [`location_id==${locationId}`]
    };
    
    return getRequest(
      createAction(REQUEST_SIGN),
      createAction(RECEIVE_SIGN),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/signs`,
      authErrorHandler,
      {}
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

export const getTemplates = () => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const {currentSummit} = currentSummitState;
    
    const response = await fetch(`${window.SIGNAGE_BASE_URL}/templates.json`);
    if (response.ok) {
        const clients = await response.json();
        let templates = [];
        
        if (clients && clients[window.APP_CLIENT_NAME] && clients[window.APP_CLIENT_NAME][currentSummit.id]) {
            templates = clients[window.APP_CLIENT_NAME][currentSummit.id];
        }
        
        dispatch(createAction(RECEIVE_SIGNAGE_TEMPLATES)({templates}))
    } else {
        fetchErrorHandler(response);
    }
};

export const getSignEvents = (locationId, term = '', page = 1, order = 'start_date', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
 
    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm}`);
    }
    
    const params = {
        page: page,
        per_page: 10,
        expand: 'speakers,location,location.floor',
        access_token: accessToken,
    };

    params['filter[]'] = filter;

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        const translateOrder = order === 'start_date_str' ? 'start_date' : order;
        params['order'] = `${orderDirSign}${translateOrder}`;
    }
    
    return getRequest(
      createAction(REQUEST_SIGNAGE_EVENTS),
      createAction(RECEIVE_SIGNAGE_EVENTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/events/published`,
        authErrorHandler,
        {page, order, orderDir, term, locationId, summitTz: currentSummit.time_zone_id}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSignBanners = (locationId, term = '', page = 1, order = null, orderDir = 1) => async (dispatch, getState) => {
    
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    
    dispatch(startLoading());
    
    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm},content=@${escapedTerm}`);
    }
    
    const params = {
        page: page,
        per_page: 10,
        expand: 'type,location,location.floor',
        access_token: accessToken,
    };
    
    params['filter[]'] = filter;
    
    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        const translateOrder = order === 'start_date_str' ? 'start_date' : order;
        params['order'] = `${orderDirSign}${translateOrder}`;
    }
    
    return getRequest(
      createAction(REQUEST_SIGNAGE_BANNERS),
      createAction(RECEIVE_SIGNAGE_BANNERS),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/banners`,
      authErrorHandler,
      {page, order, orderDir, term, locationId, summitTz: currentSummit.time_zone_id}
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};


export const publishDate = (startDate) => async (dispatch, getState) => {
    const {currentSummitState, signageState} = getState();
    const {currentSummit} = currentSummitState;
    const {locationId} = signageState;
    
    dispatch(startLoading());
    
    const channel = getAblyChannel(currentSummit.id, locationId);
    const res = await publishToAblyChannel(channel, 'JUMP_TIME',{timestamp: startDate});
    
    if (res) {
        dispatch(showSuccessMessage(T.translate("signage.date_published")));
    }
};

export const publishTemplate = (templateFile) => async (dispatch, getState) => {
    const {currentSummitState, signageState} = getState();
    const {currentSummit} = currentSummitState;
    const {locationId} = signageState;
    
    dispatch(startLoading());
    
    await saveSignTemplate(templateFile)(dispatch,getState);
    
    const channel = getAblyChannel(currentSummit.id, locationId);
    const res = await publishToAblyChannel(channel, 'SET_TEMPLATE',{template: templateFile});
    
    if (res) {
        dispatch(showSuccessMessage(T.translate("signage.template_published")));
    }
};

export const publishReload = () => async (dispatch, getState) => {
    const {currentSummitState, signageState} = getState();
    const {currentSummit} = currentSummitState;
    const {locationId} = signageState;
    
    dispatch(startLoading());
    
    const channel = getAblyChannel(currentSummit.id, locationId);
    const res = await publishToAblyChannel(channel, 'RELOAD',{});
    
    if (res) {
        dispatch(showSuccessMessage(T.translate("signage.sign_reloaded")));
    }
};


export const saveStaticBanner = (entity) => async (dispatch, getState) => {
    const { currentSummitState, signageState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const {locationId} = signageState;
    
    const params = {
        access_token: accessToken,
        expand: 'type,location,location.floor',
    };
    
    dispatch(startLoading());
    
    const normalizedEntity = normalizeBanner(entity);
    normalizedEntity.class_name = "SummitLocationBanner";
    normalizedEntity.enabled = true;
    normalizedEntity.title = "Static Banner";
    normalizedEntity.type = "Primary";
    
    if (entity.id) {
        putRequest(
          null,
          createAction(SIGNAGE_STATIC_BANNER_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/banners/${entity.id}`,
          normalizedEntity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then(() => {
              dispatch(showSuccessMessage(T.translate("signage.static_saved")));
          });
        
    } else {
        postRequest(
          null,
          createAction(SIGNAGE_STATIC_BANNER_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/banners`,
          normalizedEntity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then((payload) => {
              dispatch(showSuccessMessage(T.translate("signage.static_saved")));
          });
    }
}


export const saveSignTemplate = (templateFile) => async (dispatch, getState) => {
    const { currentSummitState, signageState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const { sign, locationId } = signageState;
    
    const params = {
        access_token: accessToken,
    };
    
    dispatch(startLoading());
    
    if (sign?.id) {
        putRequest(
          null,
          createAction(SIGN_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/signs/${sign.id}`,
          {location_id: locationId, template: templateFile},
          authErrorHandler
        )(params)(dispatch)
          .then(() => {
              dispatch(stopLoading());
          });
        
    } else {
        postRequest(
          null,
          createAction(SIGN_ADDED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/signs`,
          {location_id: locationId, template: templateFile},
          authErrorHandler
        )(params)(dispatch)
          .then((payload) => {
              dispatch(stopLoading());
          });
    }
};

/********************************************************************************************************************/
/*              BANNERS
/********************************************************************************************************************/
export const getLocations = () => async (dispatch, getState) => {
    
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    dispatch(startLoading());
    
    const params = {
        expand       : 'rooms,floors,floors.rooms',
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
    };
    
    return getRequest(
      createAction(REQUEST_SIGNAGE_LOCATIONS),
      createAction(RECEIVE_SIGNAGE_LOCATIONS),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations`,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

export const saveBanner = (entity) => async (dispatch, getState) => {
    const { currentSummitState, signageState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const {locationId} = signageState;
    
    const params = {
        access_token: accessToken,
        expand: 'type,location,location.floor',
    };
    
    dispatch(startLoading());
    
    const normalizedEntity = normalizeBanner(entity);
    
    if (entity.id) {
        putRequest(
          createAction(UPDATE_SIGNAGE_BANNER),
          createAction(SIGNAGE_BANNER_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/banners/${entity.id}`,
          normalizedEntity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then(() => {
              dispatch(stopLoading());
          });
        
    } else {
        postRequest(
          createAction(UPDATE_SIGNAGE_BANNER),
          createAction(SIGNAGE_BANNER_ADDED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/banners`,
          normalizedEntity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then((payload) => {
              dispatch(stopLoading());
          });
    }
}

export const deleteBanner = (bannerId) => async (dispatch, getState) => {
    const { currentSummitState, signageState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit } = currentSummitState;
    const {locationId} = signageState;
    
    const params = {
        access_token: accessToken
    };
    
    dispatch(startLoading());
    
    return deleteRequest(
      null,
      createAction(SIGNAGE_BANNER_DELETED)({ bannerId }),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/locations/${locationId}/banners/${bannerId}`,
      null,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

const normalizeBanner = (entity) => {
    const normalizedEntity = {...entity};
    
    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);
    
    return normalizedEntity;
}
