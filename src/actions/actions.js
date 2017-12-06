import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";

import { authErrorHandler, apiBaseUrl} from './base-actions';

export const REQUEST_SUMMITS                = 'REQUEST_SUMMITS';
export const RECEIVE_SUMMITS                = 'RECEIVE_SUMMITS';
export const SET_CURRENT_SUMMIT             = 'SET_CURRENT_SUMMIT';
export const RECEIVE_TRACKS                 = 'RECEIVE_TRACKS';
export const RECEIVE_VENUES                 = 'RECEIVE_VENUES';
export const RECEIVE_EVENT_TYPES            = 'RECEIVE_EVENT_TYPES';
export const RECEIVE_EVENT                  = 'RECEIVE_EVENT';
export const EVENT_UPDATED                  = 'EVENT_UPDATED';
export const EVENT_ADDED                    = 'EVENT_ADDED';
export const EVENT_DELETED                  = 'EVENT_DELETED';

export const setCurrentSummit = (summit, history) => (dispatch) =>
{
    dispatch({
        type: SET_CURRENT_SUMMIT,
        payload: summit
    });
    if(summit)
       history.push(`/app/summits/${summit.id}/dashboard`);
}

export const loadSummits = () => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());
    getRequest(
        createAction(REQUEST_SUMMITS),
        createAction(RECEIVE_SUMMITS),
        `${apiBaseUrl}/api/v1/summits/all?access_token=${accessToken}&expand=event_types,tracks`,
        authErrorHandler
    )({})(dispatch, getState).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const querySpeakers = (summitId, input) => {

    let accessToken = window.accessToken;
    let filters = `first_name=@${input},last_name=@${input},email=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/summits/${summitId}/speakers?filter=${filters}&access_token=${accessToken}`)
        .then((response) => response.json())
        .then((json) => {
            let options = json.data.map((s) =>
                ({value: s.id, label: s.first_name + ' ' + s.last_name + ' (' + s.id + ')'})
            );

            return {
                options: options
            };
        });
};

export const queryTags = (input) => {

    let accessToken = window.accessToken;

    return fetch(`${apiBaseUrl}/api/v1/tags?filter=tag=@${input}&order=tag&access_token=${accessToken}`)
        .then((response) => response.json())
        .then((json) => {
            let options = json.data.map((t) => ({value: t.id, label: t.tag}) );

            return {
                options: options
            };
        });
};

export const queryGroups = (input) => {

    let accessToken = window.accessToken;
    let filters = `title=@${input},code=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/groups?filter=${filters}&access_token=${accessToken}`)
        .then((response) => response.json())
        .then((json) => {
            let options = json.data.map((g) => ({value: g.id, label: g.title}) );

            return {
                options: options
            };
        });
};

export const queryCompanies = (input) => {

    let accessToken = window.accessToken;
    let filters = `name=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/companies?filter=${filters}&access_token=${accessToken}`)
        .then((response) => response.json())
        .then((json) => {
            let options = json.data.map((c) => ({value: c.id, label: c.name}) );

            return {
                options: options
            };
        });
};


export const getTracks = (summitId) => (dispatch, getState) => {
    let { accessToken } = getState().loggedUserState;
    return getRequest(
        null,
        createAction(RECEIVE_TRACKS),
        `${apiBaseUrl}/api/v1/summits/${summitId}/tracks?access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch);
};

export const getVenues = (summitId) => (dispatch, getState) => {
    let { accessToken } = getState().loggedUserState;
    return getRequest(
        null,
        createAction(RECEIVE_VENUES),
        `${apiBaseUrl}/api/v1/summits/${summitId}/locations/venues?access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch);
};

export const getEventTypes = (summitId) => (dispatch, getState) => {
    let { accessToken } = getState().loggedUserState;
    return getRequest(
        null,
        createAction(RECEIVE_EVENT_TYPES),
        `${apiBaseUrl}/api/v1/summits/${summitId}/event-types?access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch);
};

export const getEvent = (summitId, eventId) =>
    (dispatch, getState) => {
        let { loggedUserState } = getState();
        let { accessToken }     = loggedUserState;
        //dispatch(startLoading());
        return getRequest(
            null,
            createAction(RECEIVE_EVENT),
            `${apiBaseUrl}/api/v1/summits/${summitId}/events/${eventId}?access_token=${accessToken}`,
            authErrorHandler
        )({})(dispatch).then(dispatch(stopLoading()));
    };

export const saveEvent = (summitId, entity) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    //dispatch(startLoading());

    if (entity.id) {
        return putRequest(
            null,
            createAction(EVENT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${summitId}/events/${entity.id}?access_token=${accessToken}`,
            authErrorHandler,
            entity
        )(entity)(dispatch).then(dispatch(stopLoading()));
    } else {
        return postRequest(
           null,
            createAction(EVENT_ADDED),
            `${apiBaseUrl}/api/v1/summits/${summitId}/events?access_token=${accessToken}`,
            authErrorHandler,
            entity
        )(entity)(dispatch).then(dispatch(stopLoading()));
    }
}