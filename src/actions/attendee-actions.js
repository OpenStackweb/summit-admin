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
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const REQUEST_ATTENDEES          = 'REQUEST_ATTENDEES';
export const RECEIVE_ATTENDEES          = 'RECEIVE_ATTENDEES';
export const RECEIVE_ATTENDEE           = 'RECEIVE_ATTENDEE';
export const CHANGE_MEMBER              = 'CHANGE_MEMBER';
export const RESET_ATTENDEE_FORM        = 'RESET_ATTENDEE_FORM';
export const UPDATE_ATTENDEE            = 'UPDATE_ATTENDEE';
export const ATTENDEE_UPDATED           = 'ATTENDEE_UPDATED';
export const ATTENDEE_ADDED             = 'ATTENDEE_ADDED';
export const ATTENDEE_DELETED           = 'ATTENDEE_DELETED';
export const TICKET_ADDED               = 'TICKET_ADDED';
export const TICKET_DELETED             = 'TICKET_DELETED';
export const RSVP_DELETED               = 'RSVP_DELETED';
export const AFFILIATION_UPDATED        = 'AFFILIATION_UPDATED';


export const getAttendees = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`first_name=@${term},last_name=@${term},email=@${term}`);
    }

    let params = {
        expand       : 'member, tickets, schedule_summit_events',
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_ATTENDEES),
        createAction(RECEIVE_ATTENDEES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getAttendee = (attendeeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : 'member, speaker, tickets, rsvp, schedule_summit_events, all_affiliations',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDEE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetAttendeeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ATTENDEE_FORM)({}));
};

export const changeMember = (member) => (dispatch, getState) => {
    if (member !== null) {
        dispatch(createAction(CHANGE_MEMBER)({member}));
    }
};

export const saveAttendee = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken,
    };

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_attendee.attendee_saved"),
            'success'
        ];

        putRequest(
            createAction(UPDATE_ATTENDEE),
            createAction(ATTENDEE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(updateAffiliation(normalizedEntity.affiliation));
            })
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = [
            T.translate("general.done"),
            T.translate("edit_attendee.attendee_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_ATTENDEE),
            createAction(ATTENDEE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(updateAffiliation(normalizedEntity.affiliation));
                return payload;
            })
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/attendees/${payload.response.id}`) }
                ));
            });
    }
}

export const updateAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    putRequest(
        null,
        createAction(AFFILIATION_UPDATED),
        `${apiBaseUrl}/api/v1/members/${affiliation.owner_id}/affiliations/${affiliation.id}`,
        affiliation,
        authErrorHandler
    )(params)(dispatch)

}

export const deleteAttendee = (attendeeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(ATTENDEE_DELETED)({attendeeId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteTicket = (attendeeId, ticketId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(TICKET_DELETED)({ticketId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets/${ticketId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const saveTicket = (attendeeId, newTicket) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(TICKET_ADDED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets`,
        newTicket,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteRsvp = (memberId, rsvpId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(RSVP_DELETED)({rsvpId}),
        `${apiBaseUrl}/api/v1/members/${memberId}/rsvp/${rsvpId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;

    normalizedEntity.affiliation = {
        id: entity.affiliation_id,
        owner_id: entity.affiliation_owner_id,
        start_date: entity.affiliation_start_date,
        end_date: entity.affiliation_end_date,
        is_current: entity.affiliation_current,
        job_title: entity.affiliation_title,
        organization_id: entity.affiliation_organization_id
    }

    delete normalizedEntity['summit_hall_checked_in_date'];
    delete normalizedEntity['affiliation_id'];
    delete normalizedEntity['affiliation_owner_id'];
    delete normalizedEntity['affiliation_start_date'];
    delete normalizedEntity['affiliation_end_date'];
    delete normalizedEntity['affiliation_current'];
    delete normalizedEntity['affiliation_title'];
    delete normalizedEntity['affiliation_organization_id'];
    delete normalizedEntity['affiliation_organization_name'];
    delete normalizedEntity['member'];
    delete normalizedEntity['speaker'];
    delete normalizedEntity['tickets'];

    return normalizedEntity;

}
