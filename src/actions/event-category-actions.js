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
import _ from 'lodash';
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
    fetchResponseHandler,
    fetchErrorHandler,
    authErrorHandler
} from "openstack-uicore-foundation/lib/methods";
import {IMAGE_ATTACHED, IMAGE_DELETED} from "./event-actions";


export const REQUEST_EVENT_CATEGORIES      = 'REQUEST_EVENT_CATEGORIES';
export const RECEIVE_EVENT_CATEGORIES      = 'RECEIVE_EVENT_CATEGORIES';
export const RECEIVE_EVENT_CATEGORY        = 'RECEIVE_EVENT_CATEGORY';
export const RESET_EVENT_CATEGORY_FORM     = 'RESET_EVENT_CATEGORY_FORM';
export const UPDATE_EVENT_CATEGORY         = 'UPDATE_EVENT_CATEGORY';
export const EVENT_CATEGORY_UPDATED        = 'EVENT_CATEGORY_UPDATED';
export const EVENT_CATEGORY_ADDED          = 'EVENT_CATEGORY_ADDED';
export const EVENT_CATEGORY_DELETED        = 'EVENT_CATEGORY_DELETED';
export const EVENT_CATEGORIES_SEEDED       = 'EVENT_CATEGORIES_SEEDED';
export const EVENT_CATEGORY_IMAGE_ATTACHED = 'EVENT_CATEGORY_IMAGE_ATTACHED';
export const EVENT_CATEGORY_IMAGE_DELETED  = 'EVENT_CATEGORY_IMAGE_DELETED';


export const RECEIVE_EVENT_CATEGORY_QUESTION        = 'RECEIVE_EVENT_CATEGORY_QUESTION';
export const RECEIVE_EVENT_CATEGORY_QUESTION_META   = 'RECEIVE_EVENT_CATEGORY_QUESTION_META';
export const RESET_EVENT_CATEGORY_QUESTION_FORM     = 'RESET_EVENT_CATEGORY_QUESTION_FORM';
export const UPDATE_EVENT_CATEGORY_QUESTION         = 'UPDATE_EVENT_CATEGORY_QUESTION';
export const EVENT_CATEGORY_QUESTION_UPDATED        = 'EVENT_CATEGORY_QUESTION_UPDATED';
export const EVENT_CATEGORY_QUESTION_ADDED          = 'EVENT_CATEGORY_QUESTION_ADDED';
export const EVENT_CATEGORY_QUESTION_DELETED        = 'EVENT_CATEGORY_QUESTION_DELETED';
export const EVENT_CATEGORY_QUESTION_ASSIGNED       = 'EVENT_CATEGORY_QUESTION_ASSIGNED';
export const UPDATE_EVENT_CATEGORY_QUESTION_VALUE   = 'UPDATE_EVENT_CATEGORY_QUESTION_VALUE';
export const EVENT_CATEGORY_QUESTION_VALUE_UPDATED  = 'EVENT_CATEGORY_QUESTION_VALUE_UPDATED';
export const EVENT_CATEGORY_QUESTION_VALUE_ADDED    = 'EVENT_CATEGORY_QUESTION_VALUE_ADDED';
export const EVENT_CATEGORY_QUESTION_VALUE_DELETED  = 'EVENT_CATEGORY_QUESTION_VALUE_DELETED';


export const REQUEST_EVENT_CATEGORY_GROUPS       = 'REQUEST_EVENT_CATEGORY_GROUPS';
export const RECEIVE_EVENT_CATEGORY_GROUPS       = 'RECEIVE_EVENT_CATEGORY_GROUPS';
export const RECEIVE_EVENT_CATEGORY_GROUP        = 'RECEIVE_EVENT_CATEGORY_GROUP';
export const RESET_EVENT_CATEGORY_GROUP_FORM     = 'RESET_EVENT_CATEGORY_GROUP_FORM';
export const UPDATE_EVENT_CATEGORY_GROUP         = 'UPDATE_EVENT_CATEGORY_GROUP';
export const EVENT_CATEGORY_GROUP_UPDATED        = 'EVENT_CATEGORY_GROUP_UPDATED';
export const EVENT_CATEGORY_GROUP_ADDED          = 'EVENT_CATEGORY_GROUP_ADDED';
export const EVENT_CATEGORY_GROUP_DELETED        = 'EVENT_CATEGORY_GROUP_DELETED';
export const RECEIVE_EVENT_CATEGORY_GROUP_META   = 'RECEIVE_EVENT_CATEGORY_GROUP_META';
export const CATEGORY_ADDED_TO_GROUP             = 'CATEGORY_ADDED_TO_GROUP';
export const CATEGORY_REMOVED_FROM_GROUP         = 'CATEGORY_REMOVED_FROM_GROUP';
export const GROUP_ADDED_TO_GROUP                = 'GROUP_ADDED_TO_GROUP';
export const GROUP_REMOVED_FROM_GROUP            = 'GROUP_REMOVED_FROM_GROUP';



export const getEventCategories = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand       : "track_groups",
        access_token : accessToken,
        page : 1,
        per_page: 100,
    };

    return getRequest(
        createAction(REQUEST_EVENT_CATEGORIES),
        createAction(RECEIVE_EVENT_CATEGORIES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEventCategory = (eventCategoryId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand       : "track_groups,allowed_tags,extra_questions",
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${eventCategoryId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventCategoryForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_FORM)({}));
};

export const saveEventCategory = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT_CATEGORY),
            createAction(EVENT_CATEGORY_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_event_category.category_saved")));
            });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_category.category_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_EVENT_CATEGORY),
            createAction(EVENT_CATEGORY_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/event-categories/${payload.response.id}`) }
                ));
            });
    }
}

export const copyEventCategories = (fromSummitId) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = { access_token : accessToken };

    postRequest(
        null,
        createAction(EVENT_CATEGORIES_SEEDED),
        `${window.API_BASE_URL}/api/v1/summits/${fromSummitId}/tracks/copy/${currentSummit.id}`,
        null,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
}

export const deleteEventCategory = (categoryId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_CATEGORY_DELETED)({categoryId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${categoryId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const uploadImage = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(EVENT_CATEGORY_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${entity.id}/image`,
        file,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            history.push(`/app/summits/${currentSummit.id}/events/${entity.id}`);
            dispatch(stopLoading());
        });
};

export const removeImage = (eventId) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_CATEGORY_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${eventId}/image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    //remove # from color hexa
    if (normalizedEntity.color)
        normalizedEntity.color = normalizedEntity.color.substr(1);

    normalizedEntity.session_count              = parseInt(entity.session_count);
    normalizedEntity.alternate_count            = parseInt(entity.alternate_count);
    normalizedEntity.lightning_count            = parseInt(entity.lightning_count);
    normalizedEntity.lightning_alternate_count  = parseInt(entity.lightning_alternate_count);

    normalizedEntity.allowed_tags = entity.allowed_tags.map(t => t.tag);

    return normalizedEntity;

}


/***********************************  CATEGORY QUESTIONS ***************************************************/


export const getEventCategoryQuestion = (questionId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        expand: 'values',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY_QUESTION),
        `${window.API_BASE_URL}/api/v1/track-question-templates/${questionId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEventCategoryQuestionMeta = () => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY_QUESTION_META),
        `${window.API_BASE_URL}/api/v1/track-question-templates/metadata`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventCategoryQuestionForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_QUESTION_FORM)({}));
};

export const saveEventCategoryQuestion = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState, currentEventCategoryState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let currentEventCategory = currentEventCategoryState.entity;


    dispatch(startLoading());

    let params = { access_token : accessToken };

    if (entity.id) {
        putRequest(
            createAction(UPDATE_EVENT_CATEGORY_QUESTION),
            createAction(EVENT_CATEGORY_QUESTION_UPDATED),
            `${window.API_BASE_URL}/api/v1/track-question-templates/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_event_category_question.question_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_category_question.question_created"),
            type: 'success'
        };

        entity.tracks = [currentEventCategory.id];

        postRequest(
            createAction(UPDATE_EVENT_CATEGORY_QUESTION),
            createAction(EVENT_CATEGORY_QUESTION_ADDED),
            `${window.API_BASE_URL}/api/v1/track-question-templates`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.replace(`/app/summits/${currentSummit.id}/event-categories/${currentEventCategory.id}/questions/${payload.response.id}`)
                    }
                ));
            });
    }
};

export const linkQuestionToCategory = (question) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState, currentEventCategoryState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let currentEventCategory = currentEventCategoryState.entity;

    let params = { access_token : accessToken };

    putRequest(
        null,
        createAction(EVENT_CATEGORY_QUESTION_ASSIGNED)(question),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${currentEventCategory.id}/extra-questions/${question.id}`,
        null,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
        });

};


export const unlinkQuestionToCategory = (questionId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState, currentEventCategoryState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let currentEventCategory = currentEventCategoryState.entity;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_CATEGORY_QUESTION_DELETED)({questionId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${currentEventCategory.id}/extra-questions/${questionId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const queryQuestions = _.debounce((input, callback) => {

    let accessToken = window.accessToken;
    let filter = input ? `filter=name=@${input}` : '';

    fetch(`${window.API_BASE_URL}/api/v1/track-question-templates?order=name&access_token=${accessToken}&${filter}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, 500);



/***********************************  CATEGORY QUESTION VALUES  *******************************************/


export const saveEventCategoryQuestionValue = (questionId, entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState, currentEventCategoryState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let currentEventCategory = currentEventCategoryState.entity;


    dispatch(startLoading());

    let params = { access_token : accessToken };

    if (entity.id) {
        putRequest(
            null,
            createAction(EVENT_CATEGORY_QUESTION_VALUE_UPDATED),
            `${window.API_BASE_URL}/api/v1/track-question-templates/${questionId}/values/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(stopLoading());
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_category_question.question_created"),
            type: 'success'
        };

        normalizedEntity.tracks = [currentEventCategory.id];

        postRequest(
            null,
            createAction(EVENT_CATEGORY_QUESTION_VALUE_ADDED),
            `${window.API_BASE_URL}/api/v1/track-question-templates/${questionId}/values`,
            entity,
            authErrorHandler
        )(params)(dispatch)
            .then((payload) => {
                dispatch(stopLoading());
            });
    }
};


export const deleteEventCategoryQuestionValue = (questionId, valueId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_CATEGORY_QUESTION_VALUE_DELETED)({valueId}),
        `${window.API_BASE_URL}/api/v1/track-question-templates/${questionId}/values/${valueId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


/***********************************  CATEGORY GROUPS ***************************************************/


export const getEventCategoryGroups = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand: 'tracks',
        access_token : accessToken,
        page : 1,
        per_page: 100,
    };

    return getRequest(
        createAction(REQUEST_EVENT_CATEGORY_GROUPS),
        createAction(RECEIVE_EVENT_CATEGORY_GROUPS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEventCategoryGroup = (groupId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand: 'tracks',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY_GROUP),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEventCategoryGroupMeta = () => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY_GROUP_META),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/metadata`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventCategoryGroupForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_GROUP_FORM)({}));
};

export const saveEventCategoryGroup = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeGroupEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {
        putRequest(
            createAction(UPDATE_EVENT_CATEGORY_GROUP),
            createAction(EVENT_CATEGORY_GROUP_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_event_category_group.group_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event_category_group.group_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_EVENT_CATEGORY_GROUP),
            createAction(EVENT_CATEGORY_GROUP_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.replace(`/app/summits/${currentSummit.id}/event-category-groups/${payload.response.id}`)
                    }
                ));
            });
    }
}

export const deleteEventCategoryGroup = (groupId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_CATEGORY_GROUP_DELETED)({groupId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addCategoryToGroup = (groupId, category) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken
    };

    return putRequest(
        null,
        createAction(CATEGORY_ADDED_TO_GROUP)({category}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}/tracks/${category.id}`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const removeCategoryFromGroup = (groupId, categoryId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(CATEGORY_REMOVED_FROM_GROUP)({categoryId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}/tracks/${categoryId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addAllowedGroupToGroup = (groupId, allowedGroup) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken
    };

    return putRequest(
        null,
        createAction(GROUP_ADDED_TO_GROUP)({allowedGroup}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}/allowed-groups/${allowedGroup.id}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const removeAllowedGroupFromGroup = (groupId, allowedGroupId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(GROUP_REMOVED_FROM_GROUP)({allowedGroupId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}/allowed-groups/${allowedGroupId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeGroupEntity = (entity) => {
    let normalizedEntity = {...entity};
    normalizedEntity['color'] = normalizedEntity['color'].substr(1);

    return normalizedEntity;
}
