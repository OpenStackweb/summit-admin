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
  authErrorHandler,  
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';
import _ from 'lodash';

export const RESET_REG_FEED_METADATA_FORM = 'RESET_REG_FEED_METADATA_FORM';
export const REQUEST_REG_FEED_METADATA_LIST = 'REQUEST_REG_FEED_METADATA_LIST';
export const RECEIVE_REG_FEED_METADATA_LIST = 'RECEIVE_REG_FEED_METADATA_LIST';
export const RECEIVE_REG_FEED_METADATA = 'RECEIVE_REG_FEED_METADATA';
export const UPDATE_REG_FEED_METADATA = 'UPDATE_REG_FEED_METADATA';

export const REG_FEED_METADATA_UPDATED = 'REG_FEED_METADATA_UPDATED';
export const REG_FEED_METADATA_ADDED = 'REG_FEED_METADATA_ADDED';

export const REG_FEED_METADATA_DELETED = 'REG_FEED_METADATA_DELETED';

export const getRegFeedMetadataBySummit = (term = '', page = 1, perPage = 10, order = 'id', orderDir = 0) => async (dispatch, getState) => {

  const {currentSummitState} = getState();
  const accessToken = await getAccessTokenSafely();
  const {currentSummit} = currentSummitState;

  dispatch(startLoading());

  const params = {
    access_token: accessToken,
  };  

  return getRequest(
    createAction(REQUEST_REG_FEED_METADATA_LIST),
    createAction(RECEIVE_REG_FEED_METADATA_LIST),
    `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-feed-metadata`,
    authErrorHandler,
    { term, page, perPage, order, orderDir }
  )(params)(dispatch).then(() => {    
    dispatch(stopLoading());
  });
};

export const resetRegFeedMetadataForm = () => (dispatch, getState) => {
  dispatch(createAction(RESET_REG_FEED_METADATA_FORM)({}));
};

export const getRegFeedMetadata = (regFeedMetadataId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
  
    dispatch(startLoading());
  
    const params = {
      access_token: accessToken,
    };
  
    return getRequest(
      null,
      createAction(RECEIVE_REG_FEED_METADATA),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-feed-metadata/${regFeedMetadataId}`,
      authErrorHandler
    )(params)(dispatch).then(() => {
      dispatch(stopLoading());
    });
  };

export const saveRegFeedMetadata = (entity) => async (dispatch, getState) => {
  const {currentSummitState} = getState();
  const accessToken = await getAccessTokenSafely();
  const {currentSummit} = currentSummitState;

  dispatch(startLoading());

  if (entity.id) {

    putRequest(
      createAction(UPDATE_REG_FEED_METADATA),
      createAction(REG_FEED_METADATA_UPDATED),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-feed-metadata/${entity.id}?access_token=${accessToken}`,
      entity,
      authErrorHandler,
      entity
    )({})(dispatch)
      .then((payload) => {
        dispatch(stopLoading());
        dispatch(showSuccessMessage(T.translate("edit_reg_feed_metadata.reg_feed_metadata_saved")));
      });

  } else {
    const success_message = {
      title: T.translate("general.done"),
      html: T.translate("edit_reg_feed_metadata.reg_feed_metadata_created"),
      type: 'success'
    };

    postRequest(
      createAction(UPDATE_REG_FEED_METADATA),
      createAction(REG_FEED_METADATA_ADDED),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-feed-metadata?access_token=${accessToken}`,
      entity,
      authErrorHandler,
      entity
    )({})(dispatch)
      .then((payload) => {
        dispatch(showMessage(
          success_message,
          () => {
            history.push(`/app/summits/${currentSummit.id}/reg-feed-metadata/${payload.response.id}`)
          }
        ));
      });
  }
}

export const deleteRegFeedMetadata = (regFeedMetadataId) => async (dispatch, getState) => {

  const {currentSummitState} = getState();
  const accessToken = await getAccessTokenSafely();
  const {currentSummit} = currentSummitState;

  const params = {
    access_token: accessToken
  };

  return deleteRequest(
    null,
    createAction(REG_FEED_METADATA_DELETED)({regFeedMetadataId}),
    `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/registration-feed-metadata/${regFeedMetadataId}`,
    null,
    authErrorHandler
  )(params)(dispatch).then(() => {
      dispatch(stopLoading());
    }
  );
};