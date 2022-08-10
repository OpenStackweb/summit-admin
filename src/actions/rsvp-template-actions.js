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
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_RSVP_TEMPLATES         = 'REQUEST_RSVP_TEMPLATES';
export const RECEIVE_RSVP_TEMPLATES         = 'RECEIVE_RSVP_TEMPLATES';
export const RECEIVE_RSVP_TEMPLATE          = 'RECEIVE_RSVP_TEMPLATE';
export const RESET_RSVP_TEMPLATE_FORM       = 'RESET_RSVP_TEMPLATE_FORM';
export const UPDATE_RSVP_TEMPLATE           = 'UPDATE_RSVP_TEMPLATE';
export const RSVP_TEMPLATE_UPDATED          = 'RSVP_TEMPLATE_UPDATED';
export const RSVP_TEMPLATE_ADDED            = 'RSVP_TEMPLATE_ADDED';
export const RSVP_TEMPLATE_DELETED          = 'RSVP_TEMPLATE_DELETED';
export const QUESTION_ORDER_UPDATED         = 'QUESTION_ORDER_UPDATED';
export const RECEIVE_RSVP_QUESTION          = 'RECEIVE_RSVP_QUESTION';
export const RESET_RSVP_QUESTION_FORM       = 'RESET_RSVP_QUESTION_FORM';
export const UPDATE_RSVP_QUESTION           = 'UPDATE_RSVP_QUESTION';
export const RSVP_QUESTION_UPDATED          = 'RSVP_QUESTION_UPDATED';
export const RSVP_QUESTION_ADDED            = 'RSVP_QUESTION_ADDED';
export const RSVP_QUESTION_DELETED          = 'RSVP_QUESTION_DELETED';
export const RECEIVE_RSVP_QUESTION_META     = 'RECEIVE_RSVP_QUESTION_META';
export const QUESTION_VALUE_ORDER_UPDATED   = 'QUESTION_VALUE_ORDER_UPDATED';
export const RSVP_QUESTION_VALUE_ADDED      = 'RSVP_QUESTION_VALUE_ADDED';
export const RSVP_QUESTION_VALUE_DELETED    = 'RSVP_QUESTION_VALUE_DELETED';
export const RECEIVE_RSVP_QUESTION_VALUE    = 'RECEIVE_RSVP_QUESTION_VALUE';
export const RESET_RSVP_QUESTION_VALUE_FORM = 'RESET_RSVP_QUESTION_VALUE_FORM';
export const UPDATE_RSVP_QUESTION_VALUE     = 'UPDATE_RSVP_QUESTION_VALUE';
export const RSVP_QUESTION_VALUE_UPDATED    = 'RSVP_QUESTION_VALUE_UPDATED';



export const getRsvpTemplates = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm}`);
    }

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_RSVP_TEMPLATES),
        createAction(RECEIVE_RSVP_TEMPLATES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getRsvpTemplate = (rsvpTemplateId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_RSVP_TEMPLATE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRsvpTemplateForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_RSVP_TEMPLATE_FORM)({}));
};

export const saveRsvpTemplate = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    const params = {
        access_token : accessToken,
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_RSVP_TEMPLATE),
            createAction(RSVP_TEMPLATE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_rsvp_template.rsvp_template_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_rsvp_template.rsvp_template_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_RSVP_TEMPLATE),
            createAction(RSVP_TEMPLATE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteRsvpTemplate = (rsvpTemplateId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(RSVP_TEMPLATE_DELETED)({rsvpTemplateId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};
    return normalizedEntity;
}


/************************************* QUESTIONS ******************************************/


export const updateQuestionsOrder = (questions, templateId, questionId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    const question = questions.find(q => q.id === questionId);

    putRequest(
        null,
        createAction(QUESTION_ORDER_UPDATED)(questions),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${templateId}/questions/${questionId}`,
        question,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const getRsvpQuestionMeta = () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_RSVP_QUESTION_META),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/questions/metadata`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getRsvpQuestion = (rsvpTemplateId, rsvpQuestionId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_RSVP_QUESTION),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRsvpQuestionForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_RSVP_QUESTION_FORM)({}));
};

export const saveRsvpQuestion = (rsvpTemplateId, entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_RSVP_QUESTION),
            createAction(RSVP_QUESTION_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_rsvp_question.rsvp_question_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_rsvp_question.rsvp_question_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_RSVP_QUESTION),
            createAction(RSVP_QUESTION_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteRsvpQuestion = (rsvpTemplateId, rsvpQuestionId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(RSVP_QUESTION_DELETED)({rsvpQuestionId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


/************************************* QUESTIONS ******************************************/


export const updateQuestionValuesOrder = (values, templateId, questionId, valueId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    const value = values.find(v => v.id === valueId);

    putRequest(
        null,
        createAction(QUESTION_VALUE_ORDER_UPDATED)(values),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${templateId}/questions/${questionId}/values/${valueId}`,
        value,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const getRsvpQuestionValue = (rsvpTemplateId, rsvpQuestionId, rsvpQuestionValueId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_RSVP_QUESTION_VALUE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}/values/${rsvpQuestionValueId}`,
        authErrorHandler('snana')
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetRsvpQuestionValueForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_RSVP_QUESTION_VALUE_FORM)({}));
};

export const saveRsvpQuestionValue = (rsvpTemplateId, rsvpQuestionId, entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    if (entity.id) {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_rsvp_question.rsvp_question_value_saved"),
            type: 'success'
        };

        putRequest(
            createAction(UPDATE_RSVP_QUESTION_VALUE),
            createAction(RSVP_QUESTION_VALUE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}/values/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}`) }
                ));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_rsvp_question.rsvp_question_value_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_RSVP_QUESTION_VALUE),
            createAction(RSVP_QUESTION_VALUE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}/values`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}`) }
                ));
            });
    }
}

export const deleteRsvpQuestionValue = (rsvpTemplateId, rsvpQuestionId, rsvpQuestionValueId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(RSVP_QUESTION_VALUE_DELETED)({rsvpQuestionValueId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/rsvp-templates/${rsvpTemplateId}/questions/${rsvpQuestionId}/values/${rsvpQuestionValueId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


