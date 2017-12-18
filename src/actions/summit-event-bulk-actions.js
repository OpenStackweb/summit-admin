import {createAction, getRequest, putRequest, startLoading, stopLoading} from "openstack-uicore-foundation";
import {apiBaseUrl, authErrorHandler, showMessage} from "./base-actions";
import T from 'i18n-react/dist/i18n-react'

export const UPDATE_LOCAL_EVENT       = 'UPDATE_LOCAL_EVENT';
export const RECEIVE_SELECTED_EVENTS  = 'REQUEST_SELECTED_EVENTS';
export const UPDATED_REMOTE_EVENTS    = 'UPDATED_REMOTE_EVENTS';

export const getSummitEventsById = (summitId, eventIds) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());
    let filter = '';
    for(let id of eventIds){
        if(filter!='') filter += ',';
        filter += `id==${id}`;
    }
    let params = {
        access_token : accessToken,
        filter: filter
    };

    return getRequest(
        null,
        createAction(RECEIVE_SELECTED_EVENTS),
        `${apiBaseUrl}/api/v1/summits/${summitId}/events/published`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateEventLocationLocal = (event, location, isValid) => (dispatch) => {

    let mutator = (location, isValid) => event => ({...event, location_id :location.id, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(location, isValid) }))
};

export const updateEventStartDateLocal = (event, startDate, isValid) => (dispatch) => {

    let mutator = (startDate, isValid) => event => ({...event, start_date : startDate, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(startDate, isValid) }))
};

export const updateEventEndDateLocal = (event, endDate, isValid) => (dispatch) => {

    let mutator = (endDate, isValid) => event => ({...event, end_date : endDate, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(endDate, isValid) }))
};

export const updateEventTitleLocal = (event, title, isValid) => (dispatch) => {

    let mutator = ( title, isValid) => event => ({...event, title : title, is_valid : isValid});

    dispatch(createAction(UPDATE_LOCAL_EVENT)({ eventId: event.id, mutator: mutator(title, isValid) }))
};

export const updateEvents = (summitId, events) =>  (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());
    let success_message = ['Done!', T.translate("messages.bulk_events_update_success") , 'success'];
    putRequest(
        null,
        createAction(UPDATED_REMOTE_EVENTS)({}),
        `${apiBaseUrl}/api/v1/summits/${summitId}/events/?access_token=${accessToken}`,
        {
            events: events.map((event) => ({
                id:event.id,
                title:event.title,
                location_id:event.location_id,
                start_date:event.start_date,
                end_date:event.end_date,
            }))
        },
        authErrorHandler
    )({})(dispatch)
        .then(
            () => {
                dispatch(stopLoading());
                dispatch(showMessage(...success_message))
            }
        );
}

export const updateAndPublishEvents = (summitId, events) =>  (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());
    let success_message = ['Done!', T.translate("messages.bulk_events_update_publish_success") , 'success'];
    putRequest(
        null,
        createAction(UPDATED_REMOTE_EVENTS)({}),
        `${apiBaseUrl}/api/v1/summits/${summitId}/events/?access_token=${accessToken}`,
        {
            events: events.map((event) => ({
                id:event.id,
                title:event.title,
                location_id:event.location_id,
                start_date:event.start_date,
                end_date:event.end_date,
            }))
        },
        authErrorHandler
    )({})(dispatch)
        .then(
            () => {

                putRequest(
                    null,
                    createAction(UPDATED_REMOTE_EVENTS)({}),
                    `${apiBaseUrl}/api/v1/summits/${summitId}/events/publish/?access_token=${accessToken}`,
                    {
                        events: events.map((event) => ({
                            id:event.id,
                            location_id:event.location_id,
                            start_date:event.start_date,
                            end_date:event.end_date,
                        }))
                    },
                    authErrorHandler
                )({})(dispatch)
                    .then(
                        () => {
                            dispatch(stopLoading());
                            dispatch(showMessage(...success_message))
                        }
                    );
            }
        );
}
