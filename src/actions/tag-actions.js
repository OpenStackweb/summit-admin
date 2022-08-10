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
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_TAG_GROUPS       = 'REQUEST_TAG_GROUPS';
export const RECEIVE_TAG_GROUPS       = 'RECEIVE_TAG_GROUPS';
export const RECEIVE_TAG_GROUP        = 'RECEIVE_TAG_GROUP';
export const TAG_GROUP_ORDER_UPDATED  = 'TAG_GROUP_ORDER_UPDATED';
export const RESET_TAG_GROUP_FORM     = 'RESET_TAG_GROUP_FORM';
export const UPDATE_TAG_GROUP         = 'UPDATE_TAG_GROUP';
export const TAG_GROUP_UPDATED        = 'TAG_GROUP_UPDATED';
export const TAG_GROUP_ADDED          = 'TAG_GROUP_ADDED';
export const TAG_GROUP_DELETED        = 'TAG_GROUP_DELETED';
export const TAG_GROUPS_SEEDED        = 'TAG_GROUPS_SEEDED';
export const TAG_SEEDED_TO_CATEGORIES = 'TAG_SEEDED_TO_CATEGORIES';
export const TAGS_COPIED_TO_CATEGORY  = 'TAGS_COPIED_TO_CATEGORY';
export const TAG_CREATED              = 'TAG_CREATED';
export const TAG_ADDED_TO_GROUP       = 'TAG_ADDED_TO_GROUP';
export const TAG_REMOVED_FROM_GROUP   = 'TAG_REMOVED_FROM_GROUP';

export const getTagGroups = ( ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        per_page     : 100,
        page         : 1
    };

    return getRequest(
        createAction(REQUEST_TAG_GROUPS),
        createAction(RECEIVE_TAG_GROUPS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateTagGroupsOrder = (tagGroups, tagGroupId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    const tagGroup = tagGroups.find(tg => tg.id === tagGroupId);
    delete(tagGroup.allowed_tags);

    putRequest(
        null,
        createAction(TAG_GROUP_ORDER_UPDATED)(tagGroups),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/${tagGroupId}`,
        tagGroup,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}


export const getTagGroup = (tagGroupId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : 'allowed_tags, allowed_tags.tag',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_TAG_GROUP),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/${tagGroupId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetTagGroupForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_TAG_GROUP_FORM)({}));
};

export const saveTagGroup = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);
    const params = { access_token : accessToken };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_TAG_GROUP),
            createAction(TAG_GROUP_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_tag_group.tag_group_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_tag_group.tag_group_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_TAG_GROUP),
            createAction(TAG_GROUP_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/tag-groups/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteTagGroup = (tagGroupId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TAG_GROUP_DELETED)({tagGroupId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/${tagGroupId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const seedTagGroups = () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(TAG_GROUPS_SEEDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/seed-defaults`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(showSuccessMessage(T.translate("edit_tag_group.tag_groups_seeded")));
        }
    );
};

export const copyTagToAllCategories = (tagId) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(TAG_SEEDED_TO_CATEGORIES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/all/allowed-tags/${tagId}/seed-on-tracks`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(showSuccessMessage(T.translate("edit_tag_group.tag_seeded")));
        }
    );
}

export const copyAllTagsToCategory = (tagGroupId, categoryId) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(TAGS_COPIED_TO_CATEGORY),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-tag-groups/${tagGroupId}/allowed-tags/all/copy/tracks/${categoryId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(showSuccessMessage(T.translate("edit_tag_group.tags_copied")));
        }
    );
}

export const createTag = (tag, callback) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    return postRequest(
        null,
        createAction(TAG_CREATED),
        `${window.API_BASE_URL}/api/v1/tags`,
        {tag: tag},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
        callback(payload.response);
    });
}

export const addTagToGroup = (tag) => (dispatch) => {
    dispatch(createAction(TAG_ADDED_TO_GROUP)(tag))
}

export const removeTagFromGroup = (tagId) => (dispatch) => {
    dispatch(createAction(TAG_REMOVED_FROM_GROUP)(tagId))
}


const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.allowed_tags = entity.allowed_tags.map(at => at.tag);

    return normalizedEntity;

}
