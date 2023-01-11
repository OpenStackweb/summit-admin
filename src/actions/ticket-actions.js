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
    authErrorHandler,
    createAction,
    deleteRequest,
    downloadFileByContent,
    escapeFilterValue,
    getRawCSV,
    getRequest,
    postRequest,
    putRequest,
    showMessage,
    showSuccessMessage,
    startLoading,
    stopLoading, VALIDATE,
} from 'openstack-uicore-foundation/lib/utils/actions';

import {getAccessTokenSafely} from '../utils/methods';

import URI from "urijs";
import Swal from "sweetalert2";

export const REQUEST_TICKETS = 'REQUEST_TICKETS';
export const RECEIVE_TICKETS = 'RECEIVE_TICKETS';
export const EXTERNAL_TICKETS_INGESTED = 'EXTERNAL_TICKETS_INGESTED';
export const TICKETS_IMPORTED = 'TICKETS_IMPORTED';
export const RECEIVE_TICKET = 'RECEIVE_TICKET';
export const UPDATE_TICKET = 'UPDATE_TICKET';
export const TICKET_UPDATED = 'TICKET_UPDATED';
export const TICKET_REFUNDED = 'TICKET_REFUNDED';
export const TICKET_CANCEL_REFUND = 'TICKET_CANCEL_REFUND';
export const TICKET_MEMBER_REASSIGNED = 'TICKET_MEMBER_REASSIGNED';
export const BADGE_ADDED_TO_TICKET = 'BADGE_ADDED_TO_TICKET';
export const TICKET_EMAIL_SENT = 'TICKET_EMAIL_SENT';

export const REQUEST_TICKET_TYPES = 'REQUEST_TICKET_TYPES';
export const RECEIVE_TICKET_TYPES = 'RECEIVE_TICKET_TYPES';
export const RECEIVE_TICKET_TYPE = 'RECEIVE_TICKET_TYPE';
export const RESET_TICKET_TYPE_FORM = 'RESET_TICKET_TYPE_FORM';
export const UPDATE_TICKET_TYPE = 'UPDATE_TICKET_TYPE';
export const TICKET_TYPE_UPDATED = 'TICKET_TYPE_UPDATED';
export const TICKET_TYPE_ADDED = 'TICKET_TYPE_ADDED';
export const TICKET_TYPE_DELETED = 'TICKET_TYPE_DELETED';
export const TICKET_TYPES_SEEDED = 'TICKET_TYPES_SEEDED';

export const REQUEST_REFUND_POLICIES = 'REQUEST_REFUND_POLICIES';
export const RECEIVE_REFUND_POLICIES = 'RECEIVE_REFUND_POLICIES';
export const REFUND_POLICY_ADDED = 'REFUND_POLICY_ADDED';
export const REFUND_POLICY_UPDATED = 'REFUND_POLICY_UPDATED';
export const REFUND_POLICY_DELETED = 'REFUND_POLICY_DELETED';

export const REQUEST_PAYMENT_PROFILES = 'REQUEST_PAYMENT_PROFILES';
export const UPDATE_PAYMENT_PROFILE = 'UPDATE_PAYMENT_PROFILE';
export const RECEIVE_PAYMENT_PROFILES = 'RECEIVE_PAYMENT_PROFILES';
export const PAYMENT_PROFILE_ADDED = 'PAYMENT_PROFILE_ADDED';
export const PAYMENT_PROFILE_UPDATED = 'PAYMENT_PROFILE_UPDATED';
export const PAYMENT_PROFILE_DELETED = 'PAYMENT_PROFILE_DELETED';
export const RECEIVE_PAYMENT_PROFILE = 'RECEIVE_PAYMENT_PROFILE';

export const RESET_PAYMENT_PROFILE_FORM = 'RESET_PAYMENT_PROFILE_FORM';

// selection
export const SELECT_TICKET = 'SELECT_TICKET';
export const UNSELECT_TICKET = 'UNSELECT_TICKET';
export const CLEAR_ALL_SELECTED_TICKETS = 'CLEAR_ALL_SELECTED_TICKETS';
export const SET_SELECTED_ALL_TICKETS = 'SET_SELECTED_ALL_TICKETS';
export const PRINT_TICKETS = 'PRINT_TICKETS';

/**************************   TICKETS   ******************************************/

export const selectTicket = (ticketId) => (dispatch) => {
    dispatch(createAction(SELECT_TICKET)(ticketId));
};

export const unSelectTicket = (ticketId) => (dispatch) => {
    dispatch(createAction(UNSELECT_TICKET)(ticketId));
};

export const clearAllSelectedTicket = () => (dispatch) => {
    dispatch(createAction(CLEAR_ALL_SELECTED_TICKETS)());
}
export const setSelectedAll = (value) => (dispatch) => {
    dispatch(createAction(SET_SELECTED_ALL_TICKETS)(value));
};

export const reSendTicketEmail = (orderId, ticketId) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token: accessToken
    };

    dispatch(startLoading());

    return putRequest(
        null,
        createAction(TICKET_EMAIL_SENT)({ticketId}),
        `${window.API_BASE_URL}/api/v1/summits/all/orders/${orderId}/tickets/${ticketId}/attendee/reinvite`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(showSuccessMessage(T.translate("edit_ticket.email_resent")));
        }
    );
};

export const printTickets = (term, filters, order, orderDir, doAttendeeCheckinOnPrint = true, selectedViewType = null) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(createAction(PRINT_TICKETS));

    const params = {
        access_token: accessToken,
    };

    const filter = parseFilters(filters);

    if(term) {
        const escapedTerm = escapeFilterValue(term);
        let searchString = `number=@${escapedTerm},owner_email=@${escapedTerm},owner_name=@${escapedTerm},owner_company=@${escapedTerm}`;
        
        filter.push(searchString);
    }

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    params['check_in'] = doAttendeeCheckinOnPrint;

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    if(selectedViewType) {
        params['view_type'] = selectedViewType;
    }

    let url = URI(`${process.env['PRINT_APP_URL']}/check-in/${currentSummit.slug}/tickets`);

    window.open(url.query(params).toString(), '_blank');

};

const parseFilters = (filters) => {
    const filter = [];

    if (filters.hasOwnProperty('showOnlyPendingRefundRequests') && filters.showOnlyPendingRefundRequests) {
        filter.push('has_requested_refund_requests==1');
    }

    if (filters.hasOwnProperty('showOnlyPrintable') && filters.showOnlyPrintable) {
        filter.push('access_level_type_name==IN_PERSON');
        filter.push('is_active==1');
    }

    if (filters.hasOwnProperty('hasOwnerFilter') && filters.hasOwnerFilter) {
        if (filters.hasOwnerFilter === 'HAS_OWNER')
            filter.push(`has_owner==1`);
        if (filters.hasOwnerFilter === 'HAS_NO_OWNER')
            filter.push(`has_owner==0`)
    }

    if(filters.hasOwnProperty('hasBadgeFilter') && filters.hasBadgeFilter){
        if (filters.hasBadgeFilter === 'HAS_BADGE')
            filter.push(`has_badge==1`);
        if (filters.hasBadgeFilter === 'HAS_NO_BADGE')
            filter.push(`has_badge==0`)
    }

    if(filters.hasOwnProperty('ticketTypesFilter') && Array.isArray(filters.ticketTypesFilter) && filters.ticketTypesFilter.length > 0){
        filter.push(filters.ticketTypesFilter.reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? ',':'') +`ticket_type_id==${tt.value}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('viewTypesFilter') && Array.isArray(filters.viewTypesFilter) && filters.viewTypesFilter.length > 0){
        filter.push(filters.viewTypesFilter.reduce(
            (accumulator, tt) => accumulator +(accumulator !== '' ? ',':'') +`view_type_id==${tt.value}`,
            ''
        ));
    }

    if(filters.promocodesFilter?.length > 0){
        filter.push(filters.promocodesFilter.reduce(
          (accumulator, tt) => accumulator +(accumulator !== '' ? ',':'') +`promo_code_id==${tt.id}`,
          ''
        ));
    }

    if(filters.hasOwnProperty('completedFilter') && filters.completedFilter){
        filter.push(`owner_status==${filters.completedFilter}`);
    }

    if (filters.hasOwnProperty('amountFilter') && filters.amountFilter) {
        if (filters.amountFilter === 'Paid')
            filter.push(`final_amount>0`);
        if (filters.amountFilter === 'Free')
            filter.push(`final_amount==0`)
    }

    if(filters.hasOwnProperty('ownerFullNameStartWithFilter') && Array.isArray(filters.ownerFullNameStartWithFilter) && filters.ownerFullNameStartWithFilter.length > 0){
        filter.push(filters.ownerFullNameStartWithFilter.reduce(
            (accumulator, alpha) => accumulator +(accumulator !== '' ? ',':'') +`owner_first_name@@${alpha.value}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('audienceFilter') && Array.isArray(filters.audienceFilter) && filters.audienceFilter.length > 0){
        filter.push(filters.audienceFilter.reduce(
            (accumulator, aud) => accumulator +(accumulator !== '' ? ',':'') +`audience==${aud}`,
            ''
        ));
    }

    // tickets ids

    if(filters.hasOwnProperty("selectedIds") && Array.isArray(filters.selectedIds) && filters.selectedIds.length > 0){
        filter.push('id=='+filters.selectedIds.reduce(
            (accumulator, id) => accumulator +(accumulator !== '' ? '||':'') +`${id}`,
            ''
        ))
    }

    return filter;
}

export const getTickets =
    (
        term = '',
        page = 1,
        perPage = 10,
        order = 'id',
        orderDir = 1,
        filters = {},
        extraColumns = []
    ) => async (dispatch, getState) => {

        const { currentSummitState } = getState();
        const accessToken = await getAccessTokenSafely();
        const { currentSummit }   = currentSummitState;

        dispatch(startLoading());

        const params = {
            page: page,
            per_page: perPage,
            access_token: accessToken,
            expand: 'owner,order,ticket_type,badge,promo_code,refund_requests'
        };

        const filter = parseFilters(filters);

        if(term) {
            const escapedTerm = escapeFilterValue(term);
            let searchString = `number=@${escapedTerm},owner_email=@${escapedTerm},owner_name=@${escapedTerm},promo_code=@${escapedTerm},promo_code_description=@${escapedTerm}`;
            
            filter.push(searchString);
        }

        if (filter.length > 0) {
            params['filter[]'] = filter;
        }

        // order
        if (order != null && orderDir != null) {
            const orderDirSign = (orderDir === 1) ? '+' : '-';
            params['order'] = `${orderDirSign}${order}`;
        }

        return getRequest(
            createAction(REQUEST_TICKETS),
            createAction(RECEIVE_TICKETS),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets`,
            authErrorHandler,
            {term, page, perPage, order, orderDir, filters, extraColumns}
        )(params)(dispatch).then(() => {
                dispatch(stopLoading());
            }
        );
    };

export const ingestExternalTickets = (email) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("ticket_list.ingest_done"),
        type: 'success'
    };

    return postRequest(
        null,
        createAction(EXTERNAL_TICKETS_INGESTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/ingest`,
        {'email_to': email},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(showMessage(
                success_message,
                () => {
                    window.location.reload();
                }
            ));
        }
    );
};

export const importTicketsCSV = (file) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    postRequest(
        null,
        createAction(TICKETS_IMPORTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/csv`,
        file,
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            window.location.reload();
        });
};

export const exportTicketsCSV = (term = '',
                                 pageSize = 500,
                                 order = 'id',
                                 orderDir = 1, filters = {}, extraColumns = []) => async (dispatch, getState) => {
    dispatch(startLoading());
    const csvMIME = 'text/csv;charset=utf-8';
    const accessToken = await getAccessTokenSafely();
    const { currentSummitState, currentTicketListState} = getState();
    const { currentSummit }   = currentSummitState;
    const { totalTickets } = currentTicketListState;

    const filename = currentSummit.name + '-Tickets.csv';
    const totalPages = Math.ceil(totalTickets / pageSize);

    console.log(`exportTicketsCSV: totalTickets ${totalTickets} pageSize ${pageSize} totalPages ${totalPages}`)

    const endpoint = `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/csv`;

    // create the params for the promises all ( only diff is the page nbr)

    const filter = parseFilters(filters);

    if(term) {
        const escapedTerm = escapeFilterValue(term);
        let searchString = `number=@${escapedTerm},owner_email=@${escapedTerm},owner_name=@${escapedTerm},owner_company=@${escapedTerm},promo_code=@${escapedTerm},promo_code_description=@${escapedTerm}`;
        
        filter.push(searchString);
    }

    let params = Array.from({length: totalPages}, (_, i) => {

            let res = {
                page: i + 1,
                access_token: accessToken,
                per_page: pageSize,
            };

            if (filter.length > 0) {
                res['filter[]'] = filter;
            }

            // order
            if (order != null && orderDir != null) {
                const orderDirSign = (orderDir === 1) ? '+' : '-';
                res['order'] = `${orderDirSign}${order}`;
            }

            return res;
        }
    )

    // export CSV file by chunks ...
    Promise.all(params.map((p) => getRawCSV(endpoint, p)))
        .then((files) => {
            if (files.length > 0) {
                // if we get result try to get first the header
                let header = files[0].split('\n')[0];
                // and rebuild all the chunks using reduce
                let csv = files.reduce((final, currentCvs) => {
                    let lines = currentCvs.split('\n');
                    // remove one line, starting at the first position
                    lines.splice(0, 1);
                    let rawContent = lines.join('\n');
                    return final === '' ? rawContent : `${final}${rawContent}`;
                }, '');
                // then simulate the file download
                downloadFileByContent(filename, `${header}\n${csv}`, csvMIME);
            }
            dispatch(stopLoading());
        })
        .catch(err => {
            dispatch(stopLoading());
        });
};

export const getTicket = (ticketId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'badge, badge.features, promo_code, ticket_type, owner, owner.member, refund_requests, refund_requests.requested_by, refund_requests.action_by'
    };

    return getRequest(
        null,
        createAction(RECEIVE_TICKET),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/${ticketId}`,
        (err, res) => customErrorHandler(ticketId, err, res)
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
};

export const saveTicket = (orderId, ticket) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'badge, badge.features, promo_code, ticket_type, owner, owner.member, refund_requests, refund_requests.requested_by, refund_requests.action_by'
    };

    const normalizedEntity = normalizeTicket(ticket);

    return putRequest(
        null,
        createAction(RECEIVE_TICKET),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/orders/${orderId}/tickets/${ticket.id}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const activateTicket = (orderId, ticketId, isActive) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    if (isActive)
        return putRequest(
            null,
            createAction(TICKET_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/orders/${orderId}/tickets/${ticketId}/activate`,
            {},
            authErrorHandler
        )(params)(dispatch)
            .then(() => {
                dispatch(stopLoading());
            });

    return deleteRequest(
        null,
        createAction(TICKET_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/orders/${orderId}/tickets/${ticketId}/activate`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
}

export const reassignTicket = (ticketId, attendeeId, firstName, lastName, email, company ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_ticket.ticket_reassigned"),
        type: 'success'
    };

    const attendee = {
        attendee_first_name: firstName,
        attendee_last_name: lastName,
        attendee_email: email,
        attendee_company: company,
    };

    putRequest(
        null,
        createAction(TICKET_MEMBER_REASSIGNED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets/${ticketId}/reassign`,
        attendee,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(showMessage(
                success_message,
                () => {
                    window.location.reload();
                }
            ));
        });
};

/** TICKET REFUNDS **/

export const cancelRefundTicket = (orderId, ticketId, refundNotes = '') => async (dispatch) => {

    dispatch(startLoading());
    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token: accessToken,
        expand: 'refund_requests, refund_requests.requested_by, refund_requests.action_by',
    };

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_ticket.ticket_cancel_refund"),
        type: 'success'
    };

    return deleteRequest(
        null,
        createAction(TICKET_CANCEL_REFUND),
        `${window.API_BASE_URL}/api/v1/summits/all/orders/${orderId}/tickets/${ticketId}/refund/cancel`,
        {
            notes: refundNotes
        },
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(showMessage(success_message));
        }
    );
}

export const refundTicket = (ticketId, refundAmount, refundNotes = '') => async (dispatch, getState) => {

    dispatch(startLoading());

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken,
        expand: 'refund_requests, refund_requests.requested_by, refund_requests.action_by',
    };

    return deleteRequest(
        null,
        createAction(TICKET_REFUNDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/${ticketId}/refund`,
        {
            amount: refundAmount,
            notes: refundNotes
        },
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(showSuccessMessage(T.translate("edit_ticket.ticket_refunded")));
        }
    );
};

export const addBadgeToTicket = (ticketId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return postRequest(
        null,
        createAction(BADGE_ADDED_TO_TICKET),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/${ticketId}/badge`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeTicket = (entity) => {
    const normalizedEntity = {...entity};

    // if no owner then we are assigning the tix to someone
    if (!normalizedEntity.owner && normalizedEntity.attendee) {
        normalizedEntity.attendee_first_name = normalizedEntity.attendee.first_name;
        normalizedEntity.attendee_last_name = normalizedEntity.attendee.last_name;
        normalizedEntity.attendee_email = normalizedEntity.attendee.email;
    }

    delete (normalizedEntity.id);
    delete (normalizedEntity.badge);
    delete (normalizedEntity.ticket_type);
    delete (normalizedEntity.attendee);
    delete (normalizedEntity.owner);
    delete (normalizedEntity.owner_id);
    delete (normalizedEntity.owner_full_name);
    delete (normalizedEntity.created);
    delete (normalizedEntity.last_edited);
    delete (normalizedEntity.promocode);
    delete (normalizedEntity.promocode_id);
    delete (normalizedEntity.promocode_name);

    return normalizedEntity;

}

export const customErrorHandler = (ticketId, err, res) => (dispatch, state) => {
    const code = err.status;

    dispatch(stopLoading());

    switch (code) {
        case 412:
            Swal.fire("Validation error", `Ticket number ${ticketId} not found.`, "warning");
            break;
        default:
            dispatch(authErrorHandler(err, res));
    }
}


/**************************   TICKET TYPES   ******************************************/


export const getTicketTypes = (summit, order = 'name', orderDir = 1, currentPage = 1, perPage = 10, filters = {} ) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        page: currentPage,
        per_page: perPage,
        access_token: accessToken,
        expand: 'badge_type',
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
        createAction(REQUEST_TICKET_TYPES),
        createAction(RECEIVE_TICKET_TYPES),
        `${window.API_BASE_URL}/api/v2/summits/${summit.id}/ticket-types`,
        authErrorHandler,
        {order, orderDir, currentPage, perPage, ...filters}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getTicketType = (ticketTypeId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_TICKET_TYPE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types/${ticketTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetTicketTypeForm = () => (dispatch) => {
    dispatch(createAction(RESET_TICKET_TYPE_FORM)({}));
};

export const saveTicketType = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_TICKET_TYPE),
            createAction(TICKET_TYPE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_ticket_type.ticket_type_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_ticket_type.ticket_type_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_TICKET_TYPE),
            createAction(TICKET_TYPE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/ticket-types/${payload.response.id}`)
                    }
                ));
            });
    }
}

export const deleteTicketType = (ticketTypeId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(TICKET_TYPE_DELETED)({ticketTypeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types/${ticketTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const seedTicketTypes = ( ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const params = {
        access_token: accessToken
    };

    postRequest(
        null,
        createAction(TICKET_TYPES_SEEDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types/seed-defaults`,
        {},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    if (!normalizedEntity.external_id)
        delete (normalizedEntity.external_id);

    if (!normalizedEntity.badge_type_id)
        delete (normalizedEntity.badge_type_id);

    // clear dates
    if (entity.sales_start_date === 0) {
        normalizedEntity.sales_start_date = "";
    }

    if (entity.sales_end_date === 0) {
        normalizedEntity.sales_end_date = "";
    }

    delete (normalizedEntity.id);

    return normalizedEntity;

}


/***************************   REFUND POLICIES   ******************************/

export const getRefundPolicies = () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };


    return getRequest(
        createAction(REQUEST_REFUND_POLICIES),
        createAction(RECEIVE_REFUND_POLICIES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/refund-policies`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const saveRefundPolicy = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    if (entity.id) {
        putRequest(
            null,
            createAction(REFUND_POLICY_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/refund-policies/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(stopLoading());
            });

    } else {
        postRequest(
            null,
            createAction(REFUND_POLICY_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/refund-policies`,
            entity,
            authErrorHandler
        )(params)(dispatch)
            .then(() => {
                dispatch(stopLoading());
            });
    }

}

export const deleteRefundPolicy = (refundPolicyId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(REFUND_POLICY_DELETED)({refundPolicyId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/refund-policies/${refundPolicyId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

};


/***************************   PAYMENT PROFILES   ******************************/

export const getPaymentProfiles = (page = 1, perPage = 10, order = 'id', orderDir = 1 ) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        page: page,
        per_page: perPage,
        access_token: accessToken,
    };

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_PAYMENT_PROFILES),
        createAction(RECEIVE_PAYMENT_PROFILES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/payment-gateway-profiles`,
        authErrorHandler,
        {page, perPage, order, orderDir}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const savePaymentProfile = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    if (entity.id) {
        putRequest(
            createAction(UPDATE_PAYMENT_PROFILE),
            createAction(PAYMENT_PROFILE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/payment-gateway-profiles/${entity.id}`,
            entity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_payment_profile.payment_profile_saved")));
            });
        return;
    }

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_payment_profile.payment_profile_created"),
        type: 'success'
    };

    postRequest(
        createAction(UPDATE_PAYMENT_PROFILE),
        createAction(PAYMENT_PROFILE_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/payment-gateway-profiles`,
        entity,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => {
                    history.push(`/app/summits/${currentSummit.id}/payment-profiles/${payload.response.id}`)
                }
            ));
        });
}

export const deletePaymentProfile = (paymentProfileId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(PAYMENT_PROFILE_DELETED)({paymentProfileId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/payment-gateway-profiles/${paymentProfileId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getPaymentProfile = (paymentProfileId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_PAYMENT_PROFILE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/payment-gateway-profiles/${paymentProfileId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetPaymentProfileForm = () => (dispatch) => {
    dispatch(createAction(RESET_PAYMENT_PROFILE_FORM)({}));
};
