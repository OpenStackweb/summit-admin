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
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';
import { 
    SELECTION_PLAN_RATING_TYPE_ADDED, 
    SELECTION_PLAN_RATING_TYPE_UPDATED 
} from './selection-plan-actions';

//Rating Types

export const RECEIVE_RATING_TYPE = 'RECEIVE_RATING_TYPE';
export const RESET_RATING_TYPE_FORM = 'RESET_RATING_TYPE_FORM';
export const RATING_TYPE_SCORE_TYPE_REMOVED = 'RATING_TYPE_SCORE_TYPE_REMOVED';
export const RATING_TYPE_SCORE_TYPE_ADDED = 'RATING_TYPE_SCORE_TYPE_ADDED';
export const RATING_TYPE_SCORE_TYPE_ORDER_UPDATED = 'RATING_TYPE_SCORE_TYPE_ORDER_UPDATED';

export const getRatingType = (ratingTypeId) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const {entity: currentSelectionPlan} = currentSelectionPlanState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        order: '+order',
        expand: 'score_types,selection_plan'
    };

    return getRequest(
        null,
        createAction(RECEIVE_RATING_TYPE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRatingTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_RATING_TYPE_FORM)({}));
};

export const saveRatingType = (entity) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const {entity: currentSelectionPlan} = currentSelectionPlanState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {
        
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_rating_type.rating_type_saved"),
            type: 'success'
        };

        return putRequest(
            null,
            createAction(SELECTION_PLAN_RATING_TYPE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}`)
                    }
                ));
            });
    } 

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_rating_type.rating_type_created"),
        type: 'success'
    };

    return postRequest(
        null,
        createAction(SELECTION_PLAN_RATING_TYPE_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types?access_token=${accessToken}`,
        normalizedEntity,
        authErrorHandler,
        entity
    )({})(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => {
                    history.push(`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}`)
                }
            ));
        });
    
}

//Score Types

export const RECEIVE_SCORE_TYPE = 'RECEIVE_SCORE_TYPE';
export const RECEIVE_SCORE_TYPES = 'RECEIVE_SCORE_TYPES';
export const RESET_SCORE_TYPE_FORM = 'RESET_SCORE_TYPE_FORM';
export const SCORE_TYPE_UPDATED = 'SCORE_TYPE_UPDATED';

export const getScoreType = (ratingTypeId, scoreTypeId) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const currentSelectionPlan = currentSelectionPlanState.entity;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_SCORE_TYPE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}/score-types/${scoreTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getScoreTypes = (ratingTypeId) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const currentSelectionPlan = currentSelectionPlanState.entity;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        order       : '+score',
        page        : 1,
        per_page    : 100,
    };

    return getRequest(
        null,
        createAction(RECEIVE_SCORE_TYPES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}/score-types`,
        authErrorHandler
    )(params)(dispatch).then((res) => {
            dispatch(stopLoading());
        }
    );
};

export const resetScoreTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SCORE_TYPE_FORM)({}));
};

export const saveScoreType = (entity, ratingTypeId) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const currentSelectionPlan = currentSelectionPlanState.entity;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {
        
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_score_type.score_type_saved"),
            type: 'success'
        };

        return putRequest(
            null,
            createAction(SCORE_TYPE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}/score-types/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then(() => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/rating-types/${ratingTypeId}`)
                    }
                ));
            });
    }
    
    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_score_type.score_type_created"),
        type: 'success'
    };

    return postRequest(
        null,
        createAction(RATING_TYPE_SCORE_TYPE_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}/score-types?access_token=${accessToken}`,
        normalizedEntity,
        authErrorHandler,
        entity
    )({})(dispatch)
        .then(() => {
            dispatch(showMessage(
                success_message,
                () => {
                    history.push(`/app/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/rating-types/${ratingTypeId}`)
                }
            ));
        });
}

export const updateScoreTypeOrder = (ratingTypeId, scoreTypes, scoreTypeId, newOrder) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const currentSelectionPlan = currentSelectionPlanState.entity;

    const params = {
        access_token: accessToken
    };

    const scoreType = scoreTypes.find(r => r.id === scoreTypeId);
    scoreType.score = newOrder;

    return putRequest(
        null,
        createAction(RATING_TYPE_SCORE_TYPE_ORDER_UPDATED)(scoreTypes),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}/score-types/${scoreTypeId}?access_token=${accessToken}`,
        scoreType,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(getScoreTypes(ratingTypeId));
        }
    );
}

export const deleteScoreType = (ratingTypeId, scoreTypeId) => (dispatch, getState) => {

    const {loggedUserState, currentSummitState, currentSelectionPlanState} = getState();
    const {accessToken} = loggedUserState;
    const {currentSummit} = currentSummitState;
    const currentSelectionPlan = currentSelectionPlanState.entity;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(RATING_TYPE_SCORE_TYPE_REMOVED)({scoreTypeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${currentSelectionPlan.id}/track-chair-rating-types/${ratingTypeId}/score-types/${scoreTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(getScoreTypes(ratingTypeId));
        }
    );
};

//common
const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['modified']);

    return normalizedEntity;
};