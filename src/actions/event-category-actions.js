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

import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, apiBaseUrl, showMessage, getCSV} from './base-actions';
import T from "i18n-react/dist/i18n-react";

export const REQUEST_EVENT_CATEGORIES      = 'REQUEST_EVENT_CATEGORIES';
export const RECEIVE_EVENT_CATEGORIES      = 'RECEIVE_EVENT_CATEGORIES';
export const RECEIVE_EVENT_CATEGORY        = 'RECEIVE_EVENT_CATEGORY';
export const RESET_EVENT_CATEGORY_FORM     = 'RESET_EVENT_CATEGORY_FORM';
export const UPDATE_EVENT_CATEGORY         = 'UPDATE_EVENT_CATEGORY';
export const EVENT_CATEGORY_UPDATED        = 'EVENT_CATEGORY_UPDATED';
export const EVENT_CATEGORY_ADDED          = 'EVENT_CATEGORY_ADDED';
export const EVENT_CATEGORY_DELETED        = 'EVENT_CATEGORY_DELETED';
export const EVENT_CATEGORIES_SEEDED       = 'EVENT_CATEGORIES_SEEDED';

export const REQUEST_EVENT_CATEGORY_GROUPS       = 'REQUEST_EVENT_CATEGORY_GROUPS';
export const RECEIVE_EVENT_CATEGORY_GROUPS       = 'RECEIVE_EVENT_CATEGORY_GROUPS';
export const RECEIVE_EVENT_CATEGORY_GROUP        = 'RECEIVE_EVENT_CATEGORY_GROUP';
export const RESET_EVENT_CATEGORY_GROUP_FORM     = 'RESET_EVENT_CATEGORY_GROUP_FORM';
export const UPDATE_EVENT_CATEGORY_GROUP         = 'UPDATE_EVENT_CATEGORY_GROUP';
export const EVENT_CATEGORY_GROUP_UPDATED        = 'EVENT_CATEGORY_GROUP_UPDATED';
export const EVENT_CATEGORY_GROUP_ADDED          = 'EVENT_CATEGORY_GROUP_ADDED';
export const EVENT_CATEGORY_GROUP_DELETED        = 'EVENT_CATEGORY_GROUP_DELETED';

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
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/tracks`,
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

    let params = {
        expand       : "track_groups",
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/tracks/${eventCategoryId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventCategoryForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_FORM)({}));
};

export const saveEventCategory = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event_category.category_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_EVENT_CATEGORY),
            createAction(EVENT_CATEGORY_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/tracks/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event_category.event_category_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_EVENT_CATEGORY),
            createAction(EVENT_CATEGORY_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/tracks`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
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
        `${apiBaseUrl}/api/v1/summits/${fromSummitId}/tracks/copy/${currentSummit.id}`,
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
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/tracks/${categoryId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}


/***********************************  CATEGORY GROUPS ***************************************************/


export const getEventCategoryGroups = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        page : 1,
        per_page: 100,
    };

    return getRequest(
        createAction(REQUEST_EVENT_CATEGORY_GROUPS),
        createAction(RECEIVE_EVENT_CATEGORY_GROUPS),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/track-groups`,
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

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY_GROUP),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventCategoryGroupForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_CATEGORY_GROUP_FORM)({}));
};

export const saveEventCategoryGroup = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeGroupEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event_category_group.category_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_EVENT_CATEGORY_GROUP),
            createAction(EVENT_CATEGORY_GROUP_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/track-groups/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event_category.event_category_group_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_EVENT_CATEGORY_GROUP),
            createAction(EVENT_CATEGORY_GROUP_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/track-groups`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/event-category-groups/${payload.response.id}`) }
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
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/track-groups/${groupId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeGroupEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}
