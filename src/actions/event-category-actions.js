import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, apiBaseUrl, showMessage, getCSV} from './base-actions';
import T from "i18n-react/dist/i18n-react";

export const REQUEST_EVENT_CATEGORIES       = 'REQUEST_EVENT_CATEGORIES';
export const RECEIVE_EVENT_CATEGORIES       = 'RECEIVE_EVENT_CATEGORIES';
export const RECEIVE_EVENT_CATEGORY        = 'RECEIVE_EVENT_CATEGORY';
export const RESET_EVENT_CATEGORY_FORM     = 'RESET_EVENT_CATEGORY_FORM';
export const UPDATE_EVENT_CATEGORY         = 'UPDATE_EVENT_CATEGORY';
export const EVENT_CATEGORY_UPDATED        = 'EVENT_CATEGORY_UPDATED';
export const EVENT_CATEGORY_ADDED          = 'EVENT_CATEGORY_ADDED';
export const EVENT_CATEGORY_DELETED        = 'EVENT_CATEGORY_DELETED';

export const getEventCategories = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        createAction(REQUEST_EVENT_CATEGORIES),
        createAction(RECEIVE_EVENT_CATEGORIES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getEventCategory = (eventCategoryId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_CATEGORY),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${eventCategoryId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
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
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${entity.id}`,
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
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/event-types/${payload.response.id}`) }
                ));
            });
    }
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
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${categoryId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}
