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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

export const resetEventCategoryForm = () => (dispatch) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_FORM)({}));
};

export const saveEventCategory = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);
    const params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT_CATEGORY),
            createAction(EVENT_CATEGORY_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_event_category.category_saved")));
            });

    } else {

        const success_message = {
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
};

export const copyEventCategories = (fromSummitId) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = { access_token : accessToken };

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
};

export const deleteEventCategory = (categoryId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
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

export const uploadImage = (entity, file) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(EVENT_CATEGORY_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${entity.id}/icon`,
        file,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const removeImage = (eventId) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_CATEGORY_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tracks/${eventId}/icon`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    //remove # from color hexa
    if (normalizedEntity.color)
        normalizedEntity.color = normalizedEntity.color.substr(1);

    normalizedEntity.session_count              = parseInt(entity.session_count);
    normalizedEntity.alternate_count            = parseInt(entity.alternate_count);
    normalizedEntity.lightning_count            = parseInt(entity.lightning_count);
    normalizedEntity.lightning_alternate_count  = parseInt(entity.lightning_alternate_count);

    normalizedEntity.allowed_tags = entity.allowed_tags.map(t => t.tag);

    return normalizedEntity;

};

/***********************************  CATEGORY GROUPS ***************************************************/


export const getEventCategoryGroups = ( ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
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

export const resetEventCategoryGroupForm = () => (dispatch) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_GROUP_FORM)({}));
};

export const saveEventCategoryGroup = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeGroupEntity(entity);
    const params = { access_token : accessToken };

    if (entity.id) {
        putRequest(
            createAction(UPDATE_EVENT_CATEGORY_GROUP),
            createAction(EVENT_CATEGORY_GROUP_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-groups/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_event_category_group.group_saved")));
            });

    } else {
        const success_message = {
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
};

export const deleteEventCategoryGroup = (groupId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
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
    const normalizedEntity = {...entity};
    normalizedEntity['color'] = normalizedEntity['color'].substr(1);

    return normalizedEntity;
};
