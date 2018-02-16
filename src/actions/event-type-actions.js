import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, apiBaseUrl, showMessage, getCSV} from './base-actions';
import T from "i18n-react/dist/i18n-react";

export const REQUEST_EVENT_TYPES       = 'REQUEST_EVENT_TYPES';
export const RECEIVE_EVENT_TYPES       = 'RECEIVE_EVENT_TYPES';
export const RECEIVE_EVENT_TYPE        = 'RECEIVE_EVENT_TYPE';
export const RESET_EVENT_TYPE_FORM     = 'RESET_EVENT_TYPE_FORM';
export const UPDATE_EVENT_TYPE         = 'UPDATE_EVENT_TYPE';
export const EVENT_TYPE_UPDATED        = 'EVENT_TYPE_UPDATED';
export const EVENT_TYPE_ADDED          = 'EVENT_TYPE_ADDED';
export const EVENT_TYPE_DELETED        = 'EVENT_TYPE_DELETED';

export const getEventTypes = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        createAction(REQUEST_EVENT_TYPES),
        createAction(RECEIVE_EVENT_TYPES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getEventType = (eventTypeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : '',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_EVENT_TYPE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${eventTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetEventTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_TYPE_FORM)({}));
};

export const saveEventType = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);
    let params = { access_token : accessToken };

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event_type.event_type_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_EVENT_TYPE),
            createAction(EVENT_TYPE_UPDATED),
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
            T.translate("edit_event_type.event_type_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_EVENT_TYPE),
            createAction(EVENT_TYPE_ADDED),
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

export const deleteEventType = (eventTypeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_TYPE_DELETED)({eventTypeId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/event-types/${eventTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};


    return normalizedEntity;

}
