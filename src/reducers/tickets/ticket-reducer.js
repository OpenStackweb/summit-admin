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
    BADGE_ADDED_TO_TICKET
} from '../../actions/ticket-actions';
import {
    BADGE_DELETED,
    BADGE_TYPE_CHANGED,
    FEATURE_BADGE_ADDED,
    FEATURE_BADGE_REMOVED
} from '../../actions/badge-actions'
import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

import {epochToMoment} from "openstack-uicore-foundation/lib/methods";

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
    applied_taxes: []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
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
        break;
        case UPDATE_TICKET: {
            return {...state,  entity: {...payload} };
        }
        break;
        case RECEIVE_TICKET: {
            let entity = {...payload.response};
            let bought_date = epochToMoment(entity.bought_date).format('MMMM Do YYYY, h:mm:ss a');
            let owner_full_name = '';
            let owner_email = '';
            let promocode_name = 'N/A';

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.promo_code) {
                promocode_name = entity.promo_code.code;
            }

            if (entity.owner) {
                owner_email = entity.owner.email;

                if (entity.owner.member) {
                    owner_full_name = `${entity.owner.member.first_name} ${entity.owner.member.last_name}`;
                } else if (entity.owner.first_name && entity.owner.surname) {
                    owner_full_name = `${entity.owner.first_name} ${entity.owner.surname}`;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity, owner_full_name, owner_email, bought_date, promocode_name} };
        }
        break;
        case TICKET_UPDATED: {
            return state;
        }
        break;
        case TICKET_MEMBER_REASSIGNED: {
            return state;
        }
        break;
        case BADGE_ADDED_TO_TICKET: {
            let entity = {...payload.response};
            return {...state, entity: {...state.entity, badge: {...entity} } };
        }
        break;
        case BADGE_DELETED: {
            return {...state,  entity: {...state.entity, badge: null} };
        }
        break;
        case BADGE_TYPE_CHANGED: {
            let {newBadgeType} = payload;
            return {...state, entity: {...state.entity, badge: {...state.entity.badge, type: newBadgeType} } };
        }
        break;
        case FEATURE_BADGE_REMOVED: {
            let {featureId} = payload;
            let badgeFeatures = state.entity.badge.features.filter(f => f.id != featureId);
            return {...state, entity: {...state.entity, badge: {...state.entity.badge, features: badgeFeatures} } };
        }
        break;
        case FEATURE_BADGE_ADDED: {
            let newBadgeFeature = {...payload.feature};
            let badgeFeatures = [...state.entity.badge.features, newBadgeFeature];

            return {...state, entity: {...state.entity,  badge: {...state.entity.badge, features: badgeFeatures}} };
        }
        break;
        default:
            return state;
    }
};

export default ticketReducer;
