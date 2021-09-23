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
    getCSV,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_TICKETS            = 'REQUEST_TICKETS';
export const RECEIVE_TICKETS            = 'RECEIVE_TICKETS';
export const EXTERNAL_TICKETS_INGESTED  = 'EXTERNAL_TICKETS_INGESTED';
export const TICKETS_IMPORTED           = 'TICKETS_IMPORTED';
export const RECEIVE_TICKET             = 'RECEIVE_TICKET';
export const UPDATE_TICKET              = 'UPDATE_TICKET';
export const TICKET_UPDATED             = 'TICKET_UPDATED';
export const TICKET_REFUNDED            = 'TICKET_REFUNDED';
export const TICKET_CANCEL_REFUND       = 'TICKET_CANCEL_REFUND';
export const TICKET_MEMBER_ASSIGNED     = 'TICKET_MEMBER_ASSIGNED';
export const TICKET_MEMBER_REASSIGNED   = 'TICKET_MEMBER_REASSIGNED';
export const BADGE_ADDED_TO_TICKET      = 'BADGE_ADDED_TO_TICKET';
export const TICKET_EMAIL_SENT          = 'TICKET_EMAIL_SENT';

export const REQUEST_TICKET_TYPES       = 'REQUEST_TICKET_TYPES';
export const RECEIVE_TICKET_TYPES       = 'RECEIVE_TICKET_TYPES';
export const RECEIVE_TICKET_TYPE        = 'RECEIVE_TICKET_TYPE';
export const RESET_TICKET_TYPE_FORM     = 'RESET_TICKET_TYPE_FORM';
export const UPDATE_TICKET_TYPE         = 'UPDATE_TICKET_TYPE';
export const TICKET_TYPE_UPDATED        = 'TICKET_TYPE_UPDATED';
export const TICKET_TYPE_ADDED          = 'TICKET_TYPE_ADDED';
export const TICKET_TYPE_DELETED        = 'TICKET_TYPE_DELETED';
export const TICKET_TYPES_SEEDED        = 'TICKET_TYPES_SEEDED';

export const REQUEST_REFUND_POLICIES    = 'REQUEST_REFUND_POLICIES';
export const RECEIVE_REFUND_POLICIES    = 'RECEIVE_REFUND_POLICIES';
export const REFUND_POLICY_ADDED        = 'REFUND_POLICY_ADDED';
export const REFUND_POLICY_UPDATED      = 'REFUND_POLICY_UPDATED';
export const REFUND_POLICY_DELETED      = 'REFUND_POLICY_DELETED';

export const REQUEST_PAYMENT_PROFILES   = 'REQUEST_PAYMENT_PROFILES';
export const UPDATE_PAYMENT_PROFILE     = 'UPDATE_PAYMENT_PROFILE';
export const RECEIVE_PAYMENT_PROFILES   = 'RECEIVE_PAYMENT_PROFILES';
export const PAYMENT_PROFILE_ADDED      = 'PAYMENT_PROFILE_ADDED';
export const PAYMENT_PROFILE_UPDATED    = 'PAYMENT_PROFILE_UPDATED';
export const PAYMENT_PROFILE_DELETED    = 'PAYMENT_PROFILE_DELETED';
export const RECEIVE_PAYMENT_PROFILE    = 'RECEIVE_PAYMENT_PROFILE';
export const RESET_PAYMENT_PROFILE_FORM = 'RESET_PAYMENT_PROFILE_FORM';


/**************************   TICKETS   ******************************************/

export const reSendTicketEmail = (orderId, ticketId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken
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

export const getTickets = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1, showOnlyPendingRefundRequests = false ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand       : 'owner,order,ticket_type,badge,promo_code,refund_requests'
    };

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`number=@${escapedTerm},owner_email=@${escapedTerm},owner_name=@${escapedTerm},owner_company=@${escapedTerm}`);
    }

    if(showOnlyPendingRefundRequests){
        filter.push('has_requested_refund_requests==1');
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_TICKETS),
        createAction(RECEIVE_TICKETS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets`,
        authErrorHandler,
        {page, perPage, order, orderDir, term, showOnlyPendingRefundRequests}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const ingestExternalTickets = (email) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(EXTERNAL_TICKETS_INGESTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/ingest`,
        {email},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const importTicketsCSV = (file) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
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

export const exportTicketsCSV = ( ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-Tickets.csv';
    const params = {
        access_token : accessToken
    };

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/csv`, params, filename));

};

export const getTicket = (ticketId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'badge, badge.features, promo_code, ticket_type, owner, owner.member, refund_requests, refund_requests.requested_by, refund_requests.action_by'
    };

    return getRequest(
        null,
        createAction(RECEIVE_TICKET),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/${ticketId}`,
        authErrorHandler
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
};

export const saveTicket = (orderId, ticket) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'badge, badge.features, promo_code, ticket_type, owner, owner.member, refund_requests, refund_requests.requested_by, refund_requests.action_by'
    };

    const normalizedEntity = normalizeTicket(ticket);

    return putRequest(
        null,
        createAction(TICKET_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/orders/${orderId}/tickets/${ticket.id}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
        });
};

export const activateTicket = (orderId, ticketId, isActive) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    if(isActive)
        return putRequest(
            null,
            createAction(TICKET_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/orders/${orderId}/tickets/${ticketId}/activate`,
            {},
            authErrorHandler
        )(params)(dispatch)
            .then((payload) => {
                dispatch(stopLoading());
            });

    return deleteRequest(
        null,
        createAction(TICKET_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/orders/${orderId}/tickets/${ticketId}/activate`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
        });
}

export const reassignTicket = (ticketId, attendeeId, firstName, lastName, email, company ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
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
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => { window.location.reload(); }
            ));
        });
};

/** TICKET REFUNDS **/

export const cancelRefundTicket = (orderId, ticketId, refundNotes = '') => (dispatch, getState) => {

    dispatch(startLoading());

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken,
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

export const refundTicket = (ticketId, refundAmount, refundNotes = '') => (dispatch, getState) => {

    dispatch(startLoading());

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
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

export const addBadgeToTicket = (ticketId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
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

    delete(normalizedEntity.id);
    delete(normalizedEntity.badge);
    delete(normalizedEntity.ticket_type);
    delete(normalizedEntity.attendee);
    delete(normalizedEntity.owner);
    delete(normalizedEntity.owner_id);
    delete(normalizedEntity.owner_full_name);
    delete(normalizedEntity.created);
    delete(normalizedEntity.last_edited);
    delete(normalizedEntity.promocode);
    delete(normalizedEntity.promocode_id);
    delete(normalizedEntity.promocode_name);

    return normalizedEntity;

}


/**************************   TICKET TYPES   ******************************************/


export const getTicketTypes = (summit, order = 'name', orderDir = 1, page = 1, per_page = 100 ) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : per_page,
        access_token : accessToken,
        expand: 'badge_type',
    };

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_TICKET_TYPES),
        createAction(RECEIVE_TICKET_TYPES),
        `${window.API_BASE_URL}/api/v1/summits/${summit.id}/ticket-types`,
        authErrorHandler,
        {order, orderDir}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getTicketType = (ticketTypeId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
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

export const resetTicketTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_TICKET_TYPE_FORM)({}));
};

export const saveTicketType = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
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
            .then((payload) => {
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
                    () => { history.push(`/app/summits/${currentSummit.id}/ticket-types/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteTicketType = (ticketTypeId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
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

export const seedTicketTypes = ( ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;
    const params = {
        access_token : accessToken
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
        delete(normalizedEntity.external_id);

    if (!normalizedEntity.badge_type_id)
        delete(normalizedEntity.badge_type_id);

    // clear dates
    if (entity.sales_start_date === 0) {
        normalizedEntity.sales_start_date = "";
    }

    if (entity.sales_end_date === 0) {
        normalizedEntity.sales_end_date = "";
    }

    delete(normalizedEntity.id);

    return normalizedEntity;

}



/***************************   REFUND POLICIES   ******************************/

export const getRefundPolicies = () => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
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

export const saveRefundPolicy = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
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
            .then((payload) => {
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
            .then((payload) => {
                dispatch(stopLoading());
            });
    }

}

export const deleteRefundPolicy = (refundPolicyId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
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

export const getPaymentProfiles = (page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
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

export const savePaymentProfile = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
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
            .then((payload) => {
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
        ) (params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => { history.push(`/app/summits/${currentSummit.id}/payment-profiles/${payload.response.id}`) }
            ));
        });
}

export const deletePaymentProfile = (paymentProfileId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
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

export const getPaymentProfile = (paymentProfileId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
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

export const resetPaymentProfileForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_PAYMENT_PROFILE_FORM)({}));
};
