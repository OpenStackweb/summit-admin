import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const RECEIVE_ATTENDEES       = 'RECEIVE_ATTENDEES';
export const RECEIVE_ATTENDEE        = 'RECEIVE_ATTENDEE';
export const REQUEST_ATTENDEE        = 'REQUEST_ATTENDEE';
export const RESET_ATTENDEE_FORM     = 'RESET_ATTENDEE_FORM';
export const UPDATE_ATTENDEE         = 'UPDATE_ATTENDEE';
export const ATTENDEE_UPDATED        = 'ATTENDEE_UPDATED';
export const ATTENDEE_ADDED          = 'ATTENDEE_ADDED';


export const getAttendees = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = '1' ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`first_name=@${term},last_name=@${term},email=@${term}`);
    }

    let params = {
        expand       : 'member, tickets, schedule',
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
        createAction(RECEIVE_ATTENDEES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getAttendee = (attendeeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : 'member, speaker, tickets, ticket_type',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDEE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetAttendeeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ATTENDEE_FORM)({}));
};

export const saveAttendee = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = ['Done!', 'Attendee saved successfully.', 'success'];

        putRequest(
            createAction(UPDATE_ATTENDEE),
            createAction(ATTENDEE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = ['Done!', 'Attendee created successfully.', 'success'];

        postRequest(
            createAction(UPDATE_ATTENDEE),
            createAction(ATTENDEE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    history.push(`/app/summits/${currentSummit.id}/attendees/${payload.response.id}`)
                ));
            });
    }
}

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;

    delete normalizedEntity['presentations'];
    delete normalizedEntity['all_presentations'];
    delete normalizedEntity['moderated_presentations'];
    delete normalizedEntity['all_moderated_presentations'];
    delete normalizedEntity['affiliations'];
    delete normalizedEntity['gender'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['member'];
    delete normalizedEntity['summit_assistance'];
    delete normalizedEntity['code_redeemed'];

    return normalizedEntity;

}
