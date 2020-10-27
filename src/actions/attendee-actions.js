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
    authErrorHandler,
    escapeFilterValue, getCSV
} from "openstack-uicore-foundation/lib/methods";
import {RECEIVE_INVITATION} from "./registration-invitation-actions";

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
export const SELECT_ATTENDEE = 'SELECT_ATTENDEE';
export const UNSELECT_ATTENDEE = 'UNSELECT_ATTENDEE';
export const CLEAR_ALL_SELECTED_ATTENDEES = 'CLEAR_ALL_SELECTED_ATTENDEES';
export const SET_ATTENDEES_CURRENT_FLOW_EVENT = 'SET_ATTENDEES_CURRENT_FLOW_EVENT';
export const SET_SELECTED_ALL_ATTENDEES = 'SET_SELECTED_ALL_ATTENDEES';
export const SEND_ATTENDEES_EMAILS = 'SEND_ATTENDEES_EMAILS';

export const selectAttendee = (attendeeId) => (dispatch, getState) => {
    dispatch(createAction(SELECT_ATTENDEE)(attendeeId));
};

export const unSelectAttendee = (attendeeId) => (dispatch, getState) => {
    dispatch(createAction(UNSELECT_ATTENDEE)(attendeeId));
};

export const clearAllSelectedAttendees = () => (dispatch, getState) => {
    dispatch(createAction(CLEAR_ALL_SELECTED_ATTENDEES)());
}

export const setCurrentFlowEvent = (value) => (dispatch, getState) => {
    dispatch(createAction(SET_ATTENDEES_CURRENT_FLOW_EVENT)(value));
};

export const setSelectedAll = (value) => (dispatch, getState) => {
    dispatch(createAction(SET_SELECTED_ALL_ATTENDEES)(value));
};

export const getAttendees = ( term = null, page = 1, perPage = 10,
                              order = 'id', orderDir = 1,
                              statusFilter= null, memberFilter= null
) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`first_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm},company=@${escapedTerm},ticket_type=@${escapedTerm},badge_type=@${escapedTerm}`);
    }

    let params = {
        expand       : '',
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(statusFilter){
        filter.push(`status==${statusFilter}`)
    }

    if(memberFilter){
        if(memberFilter == 'HAS_MEMBER')
            filter.push(`has_member==true`)
        if(memberFilter == 'HAS_NO_MEMBER')
            filter.push(`has_member==false`)
    }

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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees`,
        authErrorHandler,
        {page, perPage, order, orderDir, term, statusFilter, memberFilter}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const exportAttendees = ( term = null,
                              order = 'id', orderDir = 1,
                              statusFilter= null, memberFilter= null
) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];
    let filename = currentSummit.name + '-Attendees.csv';
    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`first_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm},company=@${escapedTerm},ticket_type=@${escapedTerm},badge_type=@${escapedTerm}`);
    }

    let params = {
        expand       : '',
        access_token : accessToken,
    };

    if(statusFilter){
        filter.push(`status==${statusFilter}`)
    }

    if(memberFilter){
        if(memberFilter == 'HAS_MEMBER')
            filter.push(`has_member==true`)
        if(memberFilter == 'HAS_NO_MEMBER')
            filter.push(`has_member==false`)
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/csv`, params, filename));
};

export const getAttendee = (attendeeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        expand       : 'member, speaker, tickets, rsvp, schedule_summit_events, all_affiliations, extra_questions, tickets.badge, tickets.badge.type, tickets.promo_code',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDEE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetAttendeeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ATTENDEE_FORM)({}));
};

export const reassignTicket = (attendeeId, newMemberId, ticketId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_attendee.ticket_reassigned"),
        type: 'success'
    };

    putRequest(
        null,
        createAction(CHANGE_MEMBER),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets/${ticketId}/reassign/${newMemberId}`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => { history.push(`/app/summits/${currentSummit.id}/attendees/${payload.response.owner_id}`) }
            ));
        });
};

export const saveAttendee = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken,
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_ATTENDEE),
            createAction(ATTENDEE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_attendee.attendee_saved")));
            });

    } else {
        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_attendee.attendee_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_ATTENDEE),
            createAction(ATTENDEE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/attendees/${payload.response.id}`) }
                ));
            });
    }
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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}`,
        null,
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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets/${ticketId}`,
        null,
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
        access_token : accessToken,
        expand:'tickets',
    };

    postRequest(
        null,
        createAction(TICKET_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets`,
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
        `${window.API_BASE_URL}/api/v1/members/${memberId}/rsvp/${rsvpId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;

    delete normalizedEntity['summit_hall_checked_in_date'];
    delete normalizedEntity['member'];
    delete normalizedEntity['tickets'];
    delete normalizedEntity['id'];
    delete normalizedEntity['created'];
    delete normalizedEntity['last_edited'];

    return normalizedEntity;
}

export const sendEmails = (currentFlowEvent, selectedAll = false , selectedIds = [],
                           term = null, statusFilter= null, memberFilter= null
                           ) => (dispatch, getState) => {


    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let filter = [];

    let params = {
        access_token : accessToken,
    };

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`first_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm},company=@${escapedTerm},ticket_type=@${escapedTerm},badge_type=@${escapedTerm}`);
    }

    if(statusFilter){
        filter.push(`status==${statusFilter}`)
    }

    if(memberFilter){
        if(memberFilter == 'HAS_MEMBER')
            filter.push(`has_member==true`)
        if(memberFilter == 'HAS_NO_MEMBER')
            filter.push(`has_member==false`)
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    let payload =  {
        email_flow_event : currentFlowEvent
    };

    if(!selectedAll && selectedIds.length > 0){
        payload['attendees_ids'] = selectedIds;
    }

    dispatch(startLoading());

    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("registration_invitation_list.resend_done"),
        type: 'success'
    };

    return putRequest(
        null,
        createAction(SEND_ATTENDEES_EMAILS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/all/send`,
        payload,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
            ));
            dispatch(stopLoading());
            return payload;
        });
}

