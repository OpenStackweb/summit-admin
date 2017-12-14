import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const REQUEST_SUMMITS                = 'REQUEST_SUMMITS';
export const RECEIVE_SUMMITS                = 'RECEIVE_SUMMITS';
export const SET_CURRENT_SUMMIT             = 'SET_CURRENT_SUMMIT';
export const RECEIVE_EVENT                  = 'RECEIVE_EVENT';
export const RESET_EVENT_FORM               = 'RESET_EVENT_FORM';
export const UPDATE_EVENT                   = 'UPDATE_EVENT';
export const EVENT_UPDATED                  = 'EVENT_UPDATED';
export const EVENT_ADDED                    = 'EVENT_ADDED';
export const EVENT_PUBLISHED                = 'EVENT_PUBLISHED';
export const EVENT_DELETED                  = 'EVENT_DELETED';
export const FILE_ATTACHED                  = 'FILE_ATTACHED';
export const EVENT_VALIDATION               = 'EVENT_VALIDATION';

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
        `${apiBaseUrl}/api/v1/summits?access_token=${accessToken}&expand=event_types,tracks`,
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
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((s) =>
                ({id: s.id, name: s.first_name + ' ' + s.last_name + ' (' + s.id + ')'})
            );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryTags = (input) => {

    let accessToken = window.accessToken;

    return fetch(`${apiBaseUrl}/api/v1/tags?filter=tag=@${input}&order=tag&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((t) => ({id: t.id, tag: t.tag}) );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryGroups = (input) => {

    let accessToken = window.accessToken;
    let filters = `title=@${input},code=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/groups?filter=${filters}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((g) => ({value: g.id, label: g.title}) );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryCompanies = (input) => {

    let accessToken = window.accessToken;
    let filters = `name=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/companies?filter=${filters}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((c) => ({id: c.id, name: c.name}) );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const getEvent = (eventId) => (dispatch, getState) => {
        let { loggedUserState, currentSummitState } = getState();
        let { accessToken }     = loggedUserState;
        let { currentSummit }   = currentSummitState;

        dispatch(startLoading());
        return getRequest(
            null,
            createAction(RECEIVE_EVENT),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}?access_token=${accessToken}&expand=tags,speakers,sponsors,groups`,
            authErrorHandler
        )({})(dispatch).then(dispatch(stopLoading()));
};

export const resetEventForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_FORM)({}));
};

export const saveEvent = (entity, publish) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    if (entity.id) {

        let success_message = ['Done!', 'Event saved successfully.', 'success'];
        if (publish) success_message[1] = 'Event saved & published successfully.';

        putRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}?access_token=${accessToken}`,
            entity,
            authErrorHandler,
            entity
        )({})(dispatch)
        .then((payload) => {
            if (publish) dispatch(publishEvent(payload.response))
        })
        .then((payload) => {
            dispatch(showMessage(...success_message))
        });

    } else {
        let success_message = ['Done!', 'Event created successfully.', 'success'];
        if (publish) success_message[1] = 'Event created & published successfully.';

        postRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events?access_token=${accessToken}`,
            entity,
            eventErrorHandler,
            entity
        )({})(dispatch)
        .then((payload) => {
            if (publish) dispatch(publishEvent(payload.response))
        })
        .then((payload) => {
            dispatch(showMessage(...success_message))
        });
    }
}

const publishEvent = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    //dispatch(startLoading());

    putRequest(
        null,
        createAction(EVENT_PUBLISHED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}/publish?access_token=${accessToken}`,
        {
            location_id : entity.location_id,
            start_date  : entity.start_date,
            end_date    : entity.end_date,
        },
        authErrorHandler
    )({})(dispatch);
}

export const attachFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    //dispatch(startLoading());

    if (entity.id) {
        return dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            null,
            createAction(EVENT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}?access_token=${accessToken}`,
            entity,
            authErrorHandler
        )({})(dispatch).then(dispatch(uploadFile(entity, file))).then(dispatch(stopLoading()));
    }
}

const uploadFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    postRequest(
        null,
        createAction(FILE_ATTACHED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}/attachment?access_token=${accessToken}`,
        file,
        authErrorHandler
    )({})(dispatch)
}

const eventErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    switch (code) {
        case 401:
        case 403:
            swal("ERROR", T.translate("errors.session_expired"), "error");
            dispatch({
                type: "LOGOUT_USER",
                payload: {}
            });
            break;
        case 412:
            let msg = '';
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                msg += '- ' + value + '<br>';
            }
            swal("Validation ERROR", msg, "error");
            dispatch({
                type: EVENT_VALIDATION,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
            swal("ERROR", "There was a problem with our server, please contact admin.", "error");
    }
}