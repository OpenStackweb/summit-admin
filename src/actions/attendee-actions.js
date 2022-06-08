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
import {RECEIVE_PURCHASE_ORDERS, REQUEST_PURCHASE_ORDERS} from "./order-actions";

export const REQUEST_ATTENDEES          = 'REQUEST_ATTENDEES';
export const RECEIVE_ATTENDEES          = 'RECEIVE_ATTENDEES';
export const RECEIVE_ATTENDEE           = 'RECEIVE_ATTENDEE';
export const RECEIVE_ATTENDEE_ORDERS    = 'RECEIVE_ATTENDEE_ORDERS';
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

export const selectAttendee = (attendeeId) => (dispatch) => {
    dispatch(createAction(SELECT_ATTENDEE)(attendeeId));
};

export const unSelectAttendee = (attendeeId) => (dispatch) => {
    dispatch(createAction(UNSELECT_ATTENDEE)(attendeeId));
};

export const clearAllSelectedAttendees = () => (dispatch) => {
    dispatch(createAction(CLEAR_ALL_SELECTED_ATTENDEES)());
}

export const setCurrentFlowEvent = (value) => (dispatch) => {
    dispatch(createAction(SET_ATTENDEES_CURRENT_FLOW_EVENT)(value));
};

export const setSelectedAll = (value) => (dispatch) => {
    dispatch(createAction(SET_SELECTED_ALL_ATTENDEES)(value));
};

const parseFilters = (filters) => {
    const filter = [];

    if (filters.hasOwnProperty('term') && filters.term) {
        const escapedTerm = escapeFilterValue(filters.term);
        filter.push(`first_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm},company=@${escapedTerm},ticket_type=@${escapedTerm},badge_type=@${escapedTerm},full_name=@${escapedTerm}`);
    }

    if(filters.hasOwnProperty('statusFilter') && filters.statusFilter){
        filter.push(`status==${filters.statusFilter}`)
    }

    if(filters.hasOwnProperty('memberFilter') && filters.memberFilter){
        if(filters.memberFilter === 'HAS_MEMBER')
            filter.push(`has_member==true`);
        if(filters.memberFilter === 'HAS_NO_MEMBER')
            filter.push(`has_member==false`)
    }

    if(filters.hasOwnProperty('ticketsFilter') && filters.ticketsFilter){
        if(filters.ticketsFilter === 'HAS_TICKETS')
            filter.push(`has_tickets==true`);
        if(filters.ticketsFilter === 'HAS_NO_TICKETS')
            filter.push(`has_tickets==false`)
    }

    if(filters.hasOwnProperty('virtualCheckInFilter') && filters.virtualCheckInFilter){
        if(filters.virtualCheckInFilter === 'HAS_VIRTUAL_CHECKIN')
            filter.push(`has_virtual_checkin==true`);
        if(filters.virtualCheckInFilter === 'HAS_NO_VIRTUAL_CHECKIN')
            filter.push(`has_virtual_checkin==false`)
    }

    if(filters.hasOwnProperty('checkedInFilter') && filters.checkedInFilter){
        if(filters.checkedInFilter === 'CHECKED_IN')
            filter.push(`has_checkin==true`);
        if(filters.checkedInFilter === 'NO_CHECKED_IN')
            filter.push(`has_checkin==false`)
    }

    if(filters.hasOwnProperty('ticketTypeFilter') && Array.isArray(filters.ticketTypeFilter)
        && filters.ticketTypeFilter.length > 0){
        filter.push(filters.ticketTypeFilter.reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? ',':'') +`ticket_type==${tt}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('featuresFilter') && Array.isArray(filters.featuresFilter)
        && filters.featuresFilter.length > 0){
        filter.push(filters.featuresFilter.reduce(
            (accumulator, f) => accumulator +(accumulator !== '' ? ',':'') +`features==${f}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('badgeTypeFilter') && Array.isArray(filters.badgeTypeFilter)
        && filters.badgeTypeFilter.length > 0){
        filter.push(filters.badgeTypeFilter.reduce(
            (accumulator, bt) => accumulator +(accumulator !== '' ? ',':'') +`badge_type==${bt}`,
            ''
        ));
    }



    return filter;
}

export const getAttendees = ( page = 1,
                              perPage = 10,
                              order = 'id',
                              orderDir = 1,
                              filters = {}

) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;
    dispatch(startLoading());

    const params = {
        expand       : '',
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    const filter = parseFilters(filters);

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_ATTENDEES),
        createAction(RECEIVE_ATTENDEES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees`,
        authErrorHandler,
        {page, perPage, order, orderDir, ...filters}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const exportAttendees = (order = 'id', orderDir = 1, filters = {}) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-Attendees.csv';

    const params = {
        expand       : '',
        access_token : accessToken,
    };

    const filter = parseFilters(filters);

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/csv`, params, filename));
};

export const getAttendee = (attendeeId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : 'member, speaker, tickets, rsvp, schedule_summit_events, all_affiliations, extra_questions, tickets.badge, tickets.badge.type, tickets.promo_code',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDEE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}`,
        authErrorHandler
    )(params)(dispatch).then(({response}) => {
            getAttendeeOrders(response)(dispatch, getState);
        }
    );
};

export const getAttendeeOrders = ( attendee ) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        expand       : 'tickets',
        page         : 1,
        per_page     : 30,
        access_token : accessToken,
        'filter[]'   : [`owner_email==${attendee.email}`]
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDEE_ORDERS),
        `${window.API_BASE_URL}/api/v1/summits/${attendee.summit_id}/orders`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetAttendeeForm = () => (dispatch) => {
    dispatch(createAction(RESET_ATTENDEE_FORM)({}));
};

export const reassignTicket = (attendeeId, newMemberId, ticketId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    const success_message = {
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
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    const params = {
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
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_attendee.attendee_saved")));
            });

    } else {
        const success_message = {
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
};

export const deleteAttendee = (attendeeId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
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

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
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

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
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

export const sendEmails = (currentFlowEvent,
                           selectedAll = false ,
                           selectedIds = [],
                           filters = {}
                           ) => (dispatch, getState) => {


    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    const filter = parseFilters(filters);

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    const payload =  {
        email_flow_event : currentFlowEvent
    };

    if(!selectedAll && selectedIds.length > 0){
        payload['attendees_ids'] = selectedIds;
    }

    dispatch(startLoading());

    const success_message = {
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
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;

    delete normalizedEntity['summit_hall_checked_in_date'];
    delete normalizedEntity['member'];
    delete normalizedEntity['tickets'];
    delete normalizedEntity['id'];
    delete normalizedEntity['created'];
    delete normalizedEntity['last_edited'];
    delete normalizedEntity['last_edited'];
    return normalizedEntity;
};