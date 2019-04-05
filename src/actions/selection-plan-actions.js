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

export const RECEIVE_SELECTION_PLAN        = 'RECEIVE_SELECTION_PLAN';
export const RESET_SELECTION_PLAN_FORM     = 'RESET_SELECTION_PLAN_FORM';
export const UPDATE_SELECTION_PLAN         = 'UPDATE_SELECTION_PLAN';
export const SELECTION_PLAN_UPDATED        = 'SELECTION_PLAN_UPDATED';
export const SELECTION_PLAN_ADDED          = 'SELECTION_PLAN_ADDED';
export const SELECTION_PLAN_DELETED        = 'SELECTION_PLAN_DELETED';
export const TRACK_GROUP_REMOVED           = 'TRACK_GROUP_REMOVED';
export const TRACK_GROUP_ADDED             = 'TRACK_GROUP_ADDED';


export const getSelectionPlan = (selectionPlanId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'track_groups'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTION_PLAN),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSelectionPlanForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SELECTION_PLAN_FORM)({}));
};

export const saveSelectionPlan = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SELECTION_PLAN),
            createAction(SELECTION_PLAN_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_selection_plan.selection_plan_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_selection_plan.selection_plan_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SELECTION_PLAN),
            createAction(SELECTION_PLAN_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/selection-plans/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteSelectionPlan = (selectionPlanId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SELECTION_PLAN_DELETED)({selectionPlanId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addTrackGroupToSelectionPlan = (selectionPlanId, trackGroup) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken
    };

    return putRequest(
        null,
        createAction(TRACK_GROUP_ADDED)({trackGroup}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/track-groups/${trackGroup.id}`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const removeTrackGroupFromSelectionPlan = (selectionPlanId, trackGroupId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TRACK_GROUP_REMOVED)({trackGroupId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/track-groups/${trackGroupId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (!normalizedEntity['selection_begin_date']) normalizedEntity['selection_begin_date'] = null;
    if (!normalizedEntity['selection_end_date']) normalizedEntity['selection_end_date'] = null;
    if (!normalizedEntity['submission_begin_date']) normalizedEntity['submission_begin_date'] = null;
    if (!normalizedEntity['submission_end_date']) normalizedEntity['submission_end_date'] = null;
    if (!normalizedEntity['voting_begin_date']) normalizedEntity['voting_begin_date'] = null;
    if (!normalizedEntity['voting_end_date']) normalizedEntity['voting_end_date'] = null;

    delete(normalizedEntity['created']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['id']);
    delete(normalizedEntity['summit_id']);
    delete(normalizedEntity['track_groups']);

    return normalizedEntity;

}
