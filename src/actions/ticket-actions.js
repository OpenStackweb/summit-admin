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
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';
import {
    EVENT_CATEGORY_QUESTION_VALUE_ADDED,
    EVENT_CATEGORY_QUESTION_VALUE_DELETED,
    EVENT_CATEGORY_QUESTION_VALUE_UPDATED
} from "./event-category-actions";
import {CHANGE_MEMBER} from "./attendee-actions";
import {PURCHASE_ORDER_REFUNDED} from "./order-actions";

export const RECEIVE_TICKET             = 'RECEIVE_TICKET';
export const UPDATE_TICKET              = 'UPDATE_TICKET';
export const TICKET_UPDATED             = 'TICKET_UPDATED';
export const TICKET_REFUNDED            = 'TICKET_REFUNDED';
export const TICKET_MEMBER_ASSIGNED     = 'TICKET_MEMBER_ASSIGNED';
export const TICKET_MEMBER_REASSIGNED   = 'TICKET_MEMBER_REASSIGNED';
export const BADGE_ADDED_TO_TICKET      = 'BADGE_ADDED_TO_TICKET';

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




/**************************   TICKETS   ******************************************/

export const getTicket = (ticketId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'badge, badge.features, promo_code, ticket_type, owner, owner.member'
    };

    return getRequest(
        null,
        createAction(RECEIVE_TICKET),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/${ticketId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const assignTicket = (orderId, ticketId, attendee) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    putRequest(
        null,
        createAction(TICKET_MEMBER_ASSIGNED),
        `${window.API_BASE_URL}/api/v1/summits/all/orders/${orderId}/tickets/${ticketId}/attendee`,
        attendee,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            window.location.reload();
        });
};


export const reassignTicket = (attendeeId, newMemberId, orderId, ticketId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_ticket.ticket_reassigned"),
        type: 'success'
    };

    putRequest(
        null,
        createAction(TICKET_MEMBER_REASSIGNED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/attendees/${attendeeId}/tickets/${ticketId}/reassign/${newMemberId}`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => { window.location.reload(); }
            ));
        });
};


export const refundTicket = (ticketId, refundAmount) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TICKET_REFUNDED)({ticketId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/tickets/${ticketId}/refund`,
        {amount: refundAmount},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
            dispatch(showSuccessMessage(T.translate("edit_ticket.ticket_refunded")));
        }
    );
};


export const addBadgeToTicket = (ticketId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
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



/**************************   TICKET TYPES   ******************************************/


export const getTicketTypes = ( order = 'name', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
    };

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_TICKET_TYPES),
        createAction(RECEIVE_TICKET_TYPES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types`,
        authErrorHandler,
        {order, orderDir}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getTicketType = (ticketTypeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
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
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

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
        let success_message = {
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

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TICKET_TYPE_DELETED)({ticketTypeId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/ticket-types/${ticketTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const seedTicketTypes = ( ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let params = {
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
    let normalizedEntity = {...entity};

    if (!normalizedEntity.external_id)
        delete(normalizedEntity.external_id);

    delete(normalizedEntity.id);

    return normalizedEntity;

}



/***************************   REFUND POLICIES   ******************************/

export const getRefundPolicies = () => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let params = {
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
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
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

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(REFUND_POLICY_DELETED)({refundPolicyId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/refund-policies/${refundPolicyId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

};
