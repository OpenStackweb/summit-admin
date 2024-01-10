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

import {
    RECEIVE_TICKET,
    UPDATE_TICKET,
    TICKET_UPDATED,
    TICKET_MEMBER_REASSIGNED,
    BADGE_ADDED_TO_TICKET, TICKET_CANCEL_REFUND, TICKET_REFUNDED
} from '../../actions/ticket-actions';
import {
    BADGE_DELETED, BADGE_PRINTS_CLEARED,
    BADGE_TYPE_CHANGED,
    FEATURE_BADGE_ADDED,
    FEATURE_BADGE_REMOVED
} from '../../actions/badge-actions'
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";
import moment from "moment-timezone";

export const DEFAULT_ENTITY = {
    id: 28,
    bought_date: 0,
    currency: "USD",
    discount: 0,
    external_attendee_id: null,
    external_order_id: null,
    final_amount: 500,
    number: '',
    order_id: 30,
    raw_cost: 500,
    refunded_amount: 0,
    status: '',
    badge: null,
    promocode: null,
    ticket_type: null,
    owner: null,
    applied_taxes: [],
    attendee: {},
    attendee_company: '',
    is_active: true,
    refund_requests:[],
    ticket_type_id:0,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors: {}
};

const ticketReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY} };
            }
        }
        case UPDATE_TICKET: {
            return {...state,  entity: {...payload} };
        }
        case RECEIVE_TICKET: {
            let entity = {...payload.response};
            let bought_date = entity.bought_date ? epochToMoment(entity.bought_date).format('MMMM Do YYYY, h:mm:ss a') : null;
            let attendee_full_name = null;
            let promocode_name = 'N/A';
            let attendee_company = 'N/A';
            let attendee_email = null;
            const final_amount_formatted = `$${entity.final_amount.toFixed(2)}`;
            const refunded_amount_formatted = `$${entity.refunded_amount.toFixed(2)}`;
            const final_amount_adjusted_formatted = `$${((entity.final_amount - entity.refunded_amount).toFixed(2))}`;
            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.promo_code) {
                promocode_name = entity.promo_code.code;
            }

            if (entity.owner) {
                attendee_company = entity.owner?.company;
                attendee_email = entity.owner.email;
                if (entity.owner.first_name && entity.owner.last_name) {
                    attendee_full_name = `${entity.owner.first_name} ${entity.owner.last_name}`;
                } else if (entity.owner.member?.first_name && entity.owner.member?.last_name) {
                    attendee_full_name = `${entity.owner.member.first_name} ${entity.owner.member.last_name}`;
                }
            }

            if(entity.hasOwnProperty("refund_requests")){
                entity.refund_requests = entity.refund_requests.map( r => ({...r,
                    requested_by_fullname: r.requested_by ? `${r.requested_by.first_name} ${r.requested_by.last_name}`:'TBD',
                    action_by_fullname: r.action_by ? `${r.action_by.first_name} ${r.action_by.last_name}`:'TBD',
                    refunded_amount_formatted: `$${r.refunded_amount.toFixed(2)}`
                }))
            }

            return {...state, entity: {...DEFAULT_ENTITY,
                    ...entity,
                    attendee_full_name,
                    bought_date,
                    promocode_name,
                    final_amount_formatted,
                    refunded_amount_formatted,
                    final_amount_adjusted_formatted,
                    ticket_type_id: entity?.ticket_type?.id,
                    attendee_email: attendee_email,
                    attendee_company,
                } };
        }
        case TICKET_REFUNDED:
        case TICKET_CANCEL_REFUND:
        {
            let entity = {...payload.response};

            const refunded_amount_formatted = `$${entity.refunded_amount.toFixed(2)}`;
            const final_amount_adjusted_formatted = `$${((entity.final_amount - entity.refunded_amount).toFixed(2))}`;
            if(entity.hasOwnProperty("refund_requests")){
                entity.refund_requests = entity.refund_requests.map( r => ({...r,
                    requested_by_fullname: r.requested_by ? `${r.requested_by.first_name} ${r.requested_by.last_name}`:'TBD',
                    action_by_fullname: r.action_by ? `${r.action_by.first_name} ${r.action_by.last_name}`:'TBD',
                    refunded_amount_formatted: `$${r.refunded_amount.toFixed(2)}`
                }))
            }
            return {...state, entity:{...state.entity,
                    refund_requests : entity.refund_requests,
                    refunded_amount: entity.refunded_amount,
                    refunded_amount_formatted : refunded_amount_formatted,
                    final_amount_adjusted_formatted : final_amount_adjusted_formatted
                }};
        }
        case TICKET_UPDATED: {
            let entity = {...payload.response};
            return {...state, entity:{...state.entity, is_active: entity.is_active, ticket_type_id: entity?.ticket_type?.id}};
        }
        case TICKET_MEMBER_REASSIGNED: {
            return state;
        }
        case BADGE_ADDED_TO_TICKET: {
            let entity = {...payload.response};
            return {...state, entity: {...state.entity, badge: {...entity} } };
        }
        case BADGE_DELETED: {
            return {...state,  entity: {...state.entity, badge: null} };
        }
        case BADGE_TYPE_CHANGED: {
            let {newBadgeType} = payload;
            return {...state, entity: {...state.entity, badge: {...state.entity.badge, type_id: newBadgeType.id} } };
        }
        case FEATURE_BADGE_REMOVED: {
            let {featureId} = payload;
            let badgeFeatures = state.entity.badge.features.filter(f => f.id !== featureId);
            return {...state, entity: {...state.entity, badge: {...state.entity.badge, features: badgeFeatures} } };
        }
        case FEATURE_BADGE_ADDED: {
            let newBadgeFeature = {...payload.feature};
            let badgeFeatures = [...state.entity.badge.features, newBadgeFeature];

            return {...state, entity: {...state.entity,  badge: {...state.entity.badge, features: badgeFeatures}} };
        }
        case BADGE_PRINTS_CLEARED: {
            return {...state, entity: {...state.entity,  badge: {...state.entity.badge, print_excerpt: {}}} };
        }
        default:
            return state;
    }
};

export default ticketReducer;
