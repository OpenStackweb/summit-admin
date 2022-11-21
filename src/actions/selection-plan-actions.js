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
import { getAccessTokenSafely, escapeFilterValue, fetchResponseHandler, fetchErrorHandler } from '../utils/methods';
import _ from 'lodash';

export const RECEIVE_SELECTION_PLAN = 'RECEIVE_SELECTION_PLAN';
export const RESET_SELECTION_PLAN_FORM = 'RESET_SELECTION_PLAN_FORM';
export const UPDATE_SELECTION_PLAN = 'UPDATE_SELECTION_PLAN';
export const SELECTION_PLAN_UPDATED = 'SELECTION_PLAN_UPDATED';
export const SELECTION_PLAN_ADDED = 'SELECTION_PLAN_ADDED';
export const SELECTION_PLAN_DELETED = 'SELECTION_PLAN_DELETED';
export const TRACK_GROUP_REMOVED = 'TRACK_GROUP_REMOVED';
export const TRACK_GROUP_ADDED = 'TRACK_GROUP_ADDED';
export const SELECTION_PLAN_ASSIGNED_EXTRA_QUESTION = 'SELECTION_PLAN_ASSIGNED_EXTRA_QUESTION';

const callDelay = 500; //miliseconds

export const getSelectionPlan = (selectionPlanId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'track_groups,extra_questions,extra_questions.values,event_types,track_chair_rating_types'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTION_PLAN),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(getSelectionPlanProgressFlags(currentSummit.id, selectionPlanId));
        }
    );
};

export const resetSelectionPlanForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SELECTION_PLAN_FORM)({}));
};

export const saveSelectionPlan = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

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
        const success_message = {
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
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/selection-plans/${payload.response.id}`)
                    }
                ));
            });
    }
}

export const deleteSelectionPlan = (selectionPlanId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SELECTION_PLAN_DELETED)({selectionPlanId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addTrackGroupToSelectionPlan = (selectionPlanId, trackGroup) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
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

export const removeTrackGroupFromSelectionPlan = (selectionPlanId, trackGroupId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(TRACK_GROUP_REMOVED)({trackGroupId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/track-groups/${trackGroupId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    if (!normalizedEntity['selection_begin_date']) normalizedEntity['selection_begin_date'] = null;
    if (!normalizedEntity['selection_end_date']) normalizedEntity['selection_end_date'] = null;
    if (!normalizedEntity['submission_begin_date']) normalizedEntity['submission_begin_date'] = null;
    if (!normalizedEntity['submission_end_date']) normalizedEntity['submission_end_date'] = null;
    if (!normalizedEntity['voting_begin_date']) normalizedEntity['voting_begin_date'] = null;
    if (!normalizedEntity['voting_end_date']) normalizedEntity['voting_end_date'] = null;

    delete (normalizedEntity['created']);
    delete (normalizedEntity['last_edited']);
    delete (normalizedEntity['id']);
    delete (normalizedEntity['summit_id']);
    delete (normalizedEntity['track_groups']);

    return normalizedEntity;

}

/***********************  EXTRA QUESTIONS  *******************************************/

export const RECEIVE_SELECTION_PLAN_EXTRA_QUESTION_META = 'RECEIVE_SELECTION_PLAN_EXTRA_QUESTION_META';
export const REQUEST_SELECTION_PLAN_EXTRA_QUESTIONS = 'REQUEST_SELECTION_PLAN_EXTRA_QUESTIONS';
export const RECEIVE_SELECTION_PLAN_EXTRA_QUESTIONS = 'RECEIVE_SELECTION_PLAN_EXTRA_QUESTIONS';
export const RECEIVE_SELECTION_PLAN_EXTRA_QUESTION = 'RECEIVE_SELECTION_PLAN_EXTRA_QUESTION';
export const UPDATE_SELECTION_PLAN_EXTRA_QUESTION = 'UPDATE_SELECTION_PLAN_EXTRA_QUESTION';
export const SELECTION_PLAN_EXTRA_QUESTION_UPDATED = 'SELECTION_PLAN_EXTRA_QUESTION_UPDATED';
export const SELECTION_PLAN_EXTRA_QUESTION_ADDED = 'SELECTION_PLAN_EXTRA_QUESTION_ADDED';
export const SELECTION_PLAN_EXTRA_QUESTION_DELETED = 'SELECTION_PLAN_EXTRA_QUESTION_DELETED';
export const SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED = 'SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED';
export const UPDATE_SELECTION_PLAN_EXTRA_QUESTION_VALUE = 'UPDATE_SELECTION_PLAN_EXTRA_QUESTION_VALUE';
export const SELECTION_PLAN_EXTRA_QUESTION_VALUE_UPDATED = 'SELECTION_PLAN_EXTRA_QUESTION_VALUE_UPDATED';
export const SELECTION_PLAN_EXTRA_QUESTION_VALUE_ADDED = 'SELECTION_PLAN_EXTRA_QUESTION_VALUE_ADDED';
export const SELECTION_PLAN_EXTRA_QUESTION_VALUE_DELETED = 'SELECTION_PLAN_EXTRA_QUESTION_VALUE_DELETED';
export const RESET_SELECTION_PLAN_EXTRA_QUESTION_FORM = 'RESET_SELECTION_PLAN_EXTRA_QUESTION_FORM';


export const resetSelectionPlanExtraQuestionForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SELECTION_PLAN_EXTRA_QUESTION_FORM)({}));
};

export const getExtraQuestionMeta = (selectionPlanId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTION_PLAN_EXTRA_QUESTION_META),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/metadata`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSelectionPlanExtraQuestions = (selectionPlanId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        page: 1,
        per_page: 100,
        order: '+order',
        access_token: accessToken,
        expand: 'values'
    };

    return getRequest(
        createAction(REQUEST_SELECTION_PLAN_EXTRA_QUESTIONS),
        createAction(RECEIVE_SELECTION_PLAN_EXTRA_QUESTIONS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSelectionPlanExtraQuestion = (selectionPlanId, extraQuestionId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: "values"
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTION_PLAN_EXTRA_QUESTION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${extraQuestionId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeQuestion = (entity) => {
    const normalizedEntity = {...entity};
    return normalizedEntity;
}

export const saveSelectionPlanExtraQuestion = (selectionPlanId, entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeQuestion(entity);

    if (entity.id) {

        return putRequest(
            createAction(UPDATE_SELECTION_PLAN_EXTRA_QUESTION),
            createAction(SELECTION_PLAN_EXTRA_QUESTION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(stopLoading());
                dispatch(showSuccessMessage(T.translate("edit_order_extra_question.order_extra_question_saved")));
            });
    }

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_order_extra_question.order_extra_question_created"),
        type: 'success'
    };

    return postRequest(
        createAction(UPDATE_SELECTION_PLAN_EXTRA_QUESTION),
        createAction(SELECTION_PLAN_EXTRA_QUESTION_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            dispatch(showMessage(
                success_message
            ));
        });

}

export const deleteSelectionPlanExtraQuestion = (selectionPlanId, questionId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SELECTION_PLAN_EXTRA_QUESTION_DELETED)({questionId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${questionId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateSelectionPlanExtraQuestionOrder = (selectionPlanId, questions, questionId, newOrder) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    const question = questions.find(q => q.id === questionId);
    question.order = newOrder;

    putRequest(
        null,
        createAction(SELECTION_PLAN_EXTRA_QUESTION_ORDER_UPDATED)(questions),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${questionId}`,
        question,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const saveSelectionPlanExtraQuestionValue = (selectionPlanId, questionId, entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    if (entity.id) {

        return putRequest(
            createAction(UPDATE_SELECTION_PLAN_EXTRA_QUESTION_VALUE),
            createAction(SELECTION_PLAN_EXTRA_QUESTION_VALUE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${questionId}/values/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(stopLoading());
            });

    }

    return postRequest(
        createAction(UPDATE_SELECTION_PLAN_EXTRA_QUESTION_VALUE),
        createAction(SELECTION_PLAN_EXTRA_QUESTION_VALUE_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${questionId}/values`,
        entity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
        });

}

export const deleteSelectionPlanExtraQuestionValue = (selectionPlanId, questionId, valueId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SELECTION_PLAN_EXTRA_QUESTION_VALUE_DELETED)({valueId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/extra-questions/${questionId}/values/${valueId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


/***********************  EVENT TYPES  *******************************************/

export const EVENT_TYPE_ADDED               = 'EVENT_TYPE_ADDED';
export const EVENT_TYPE_REMOVED             = 'EVENT_TYPE_REMOVED';

export const addEventTypeSelectionPlan = (selectionPlanId, eventType) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    return putRequest(
        null,
        createAction(EVENT_TYPE_ADDED)({eventType}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/event-types/${eventType.id}`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}
export const deleteEventTypeSelectionPlan = (selectionPlanId, eventTypeId) => async (dispatch, getState) => {
    
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_TYPE_REMOVED)({eventTypeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/event-types/${eventTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

/***********************  RATING TYPES  *******************************************/

export const SELECTION_PLAN_RATING_TYPE_ADDED = 'SELECTION_PLAN_RATING_TYPE_ADDED';
export const SELECTION_PLAN_RATING_TYPE_REMOVED = 'SELECTION_PLAN_RATING_TYPE_REMOVED';
export const SELECTION_PLAN_RATING_TYPE_UPDATED = 'SELECTION_PLAN_RATING_TYPE_UPDATED';
export const SELECTION_PLAN_RATING_TYPE_ORDER_UPDATED = 'SELECTION_PLAN_RATING_TYPE_ORDER_UPDATED';

export const updateRatingTypeOrder = (selectionPlanId, ratingTypes, ratingTypeId, newOrder) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    let ratingType = ratingTypes.find(r => r.id === ratingTypeId);
    ratingType.order = newOrder;

    return putRequest(
        null,
        createAction(SELECTION_PLAN_RATING_TYPE_ORDER_UPDATED)(ratingTypes),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/track-chair-rating-types/${ratingTypeId}`,
        ratingType,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const deleteRatingType = (selectionPlanId, ratingTypeId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SELECTION_PLAN_RATING_TYPE_REMOVED)({ratingTypeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/track-chair-rating-types/${ratingTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const querySelectionPlanExtraQuestions = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessTokenSafely();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`name=@${input}`);

    fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plan-extra-questions?filter=${filters}&&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);

}, callDelay);

export const assignExtraQuestion2SelectionPlan = (summitId, selectionPlanId, questionId) => async (dispatch, getState) => {
    const accessToken = await getAccessTokenSafely();
    dispatch(startLoading());
    postRequest(
        null,
        createAction(SELECTION_PLAN_ASSIGNED_EXTRA_QUESTION),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plans/${selectionPlanId}/extra-questions/${questionId}?access_token=${accessToken}`,
        {},
        authErrorHandler
    )({})(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            dispatch(showSuccessMessage(T.translate("edit_selection_plan.selection_plan_saved")));
        });
}

/***********************  PROGRESS FLAGS / PRESENTATION ACTION TYPES  ********************************/

export const RECEIVE_SELECTION_PLAN_PROGRESS_FLAGS = 'RECEIVE_SELECTION_PLAN_PROGRESS_FLAGS';
export const SELECTION_PLAN_ASSIGNED_PROGRESS_FLAG = 'SELECTION_PLAN_ASSIGNED_PROGRESS_FLAG';
export const SELECTION_PLAN_PROGRESS_FLAG_REMOVED = 'SELECTION_PLAN_PROGRESS_FLAG_REMOVED';
export const SELECTION_PLAN_PROGRESS_FLAG_ORDER_UPDATED = 'SELECTION_PLAN_PROGRESS_FLAG_ORDER_UPDATED';

export const getSelectionPlanProgressFlags = (summitId, selectionPlanId) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        page: 1,
        per_page: 100,
        order: '+order',
        access_token: accessToken
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTION_PLAN_PROGRESS_FLAGS),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plans/${selectionPlanId}/allowed-presentation-action-types`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const assignProgressFlag2SelectionPlan = (summitId, selectionPlanId, progressFlagId) => async (dispatch, getState) => {
    const accessToken = await getAccessTokenSafely();
    dispatch(startLoading());
    postRequest(
        null,
        createAction(SELECTION_PLAN_ASSIGNED_PROGRESS_FLAG),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plans/${selectionPlanId}/allowed-presentation-action-types/${progressFlagId}?access_token=${accessToken}`,
        {},
        authErrorHandler
    )({})(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            dispatch(showSuccessMessage(T.translate("edit_selection_plan.selection_plan_saved")));
        });
}

export const updateProgressFlagOrder = (selectionPlanId, progressFlags, progressFlagId, newOrder) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    let progressFlag = progressFlags.find(r => r.id === progressFlagId);

    progressFlag.order = newOrder;

    return putRequest(
        null,
        createAction(SELECTION_PLAN_PROGRESS_FLAG_ORDER_UPDATED)(progressFlags),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/allowed-presentation-action-types/${progressFlagId}`,
        progressFlag,
        authErrorHandler
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
        }
    );
}

export const unassignProgressFlagFromSelectionPlan = (selectionPlanId, progressFlagId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SELECTION_PLAN_PROGRESS_FLAG_REMOVED)({progressFlagId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/allowed-presentation-action-types/${progressFlagId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};