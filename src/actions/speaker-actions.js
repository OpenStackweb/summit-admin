import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const RECEIVE_SPEAKERS       = 'RECEIVE_SPEAKERS';
export const RECEIVE_SPEAKER        = 'RECEIVE_SPEAKER';
export const RESET_SPEAKER_FORM     = 'RESET_SPEAKER_FORM';
export const UPDATE_SPEAKER         = 'UPDATE_SPEAKER';
export const SPEAKER_UPDATED        = 'SPEAKER_UPDATED';
export const SPEAKER_VALIDATION     = 'SPEAKER_VALIDATION';


export const getSpeakers = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = '1' ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`first_name=@${term},last_name=@${term},email=@${term}`);
    }

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        orderDir = (orderDir == '1') ? '+' : '-';
        params['order']= `${orderDir}${order}`;
    }


    return getRequest(
        null,
        createAction(RECEIVE_SPEAKERS),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers?access_token=${accessToken}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getSpeaker = (speakerId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    return getRequest(
        null,
        createAction(RECEIVE_SPEAKER),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers/${speakerId}?access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch).then(dispatch(stopLoading()));
};

export const resetSpeakerForm = () => (dispatch, getState) => {
    //dispatch(createAction(RESET_EVENT_FORM)({}));
};

export const saveSpeaker = (entity, publish, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = ['Done!', 'Event saved successfully.', 'success'];
        if (publish) success_message[1] = 'Event saved & published successfully.';

        putRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            eventErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                if (publish)
                    dispatch(publishEvent(normalizedEntity));
                else
                    dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = ['Done!', 'Event created successfully.', 'success'];

        postRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events?access_token=${accessToken}`,
            normalizedEntity,
            eventErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                if (publish) {
                    normalizedEntity.id = payload.response.id;
                    dispatch(publishEvent(normalizedEntity));
                }
                else
                    dispatch(showMessage(
                        ...success_message,
                        history.push(`/app/summits/${currentSummit.id}/events/${payload.response.id}`)
                    ));
            });
    }
}

export const attachPicture = (entity, file) => (dispatch, getState) => {
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
