/**
 * Copyright 2017 OpenStack Foundation
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

import
{
    RECEIVE_PROMOCODE,
    RECEIVE_PROMOCODE_META,
    RESET_PROMOCODE_FORM,
    UPDATE_PROMOCODE,
    PROMOCODE_UPDATED,
    PROMOCODE_ADDED,
    EMAIL_SENT,
    DISCOUNT_TICKET_ADDED,
    DISCOUNT_TICKET_DELETED
} from '../../actions/promocode-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                      : 0,
    owner                   : null,
    speaker                 : null,
    sponsor                 : null,
    first_name              : '',
    last_name               : '',
    email                   : '',
    type                    : '',
    class_name              : null,
    code                    : '',
    email_sent              : false,
    redeemed                : false,
    quantity_available      : '',
    quantity_used           : 0,
    valid_since_date        : '',
    valid_until_date        : '',
    badge_features          : [],
    allowed_ticket_types    : [],
    ticket_types_rules      : [],
    apply_to_all_tix        : true,
    amount                  : '',
    rate                    : ''
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
    allTypes    : [],
    allClasses  : []
};

const promocodeReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_PROMOCODE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_PROMOCODE_META: {
            let types = [...DEFAULT_STATE.allTypes];
            let allClasses = [...payload.response];

            allClasses.map(t => {
                types = types.concat(t.type)
            });

            let unique_types = [...new Set( types )];

            return {...state, allTypes: unique_types, allClasses: allClasses }
        }
        break;
        case UPDATE_PROMOCODE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case PROMOCODE_ADDED:
        case RECEIVE_PROMOCODE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            entity.owner = {
                email: entity.email,
                first_name: entity.first_name,
                last_name: entity.last_name,
            };

            entity.apply_to_all_tix = !!(entity.amount || entity.rate);

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case PROMOCODE_UPDATED: {
            return state;
        }
        break;
        case DISCOUNT_TICKET_ADDED: {
            let ticket = {...payload.response};
            return {...state, entity: {...state.entity, ticket_types_rules: ticket.ticket_types_rules, apply_to_all_tix: false} };
        }
        break;
        case DISCOUNT_TICKET_DELETED: {
            let {ticketId} = payload;
            let ticket_types_rules = state.entity.ticket_types_rules.filter(tr => tr.id !== ticketId);
            return {...state, entity: {...state.entity, ticket_types_rules, apply_to_all_tix: false } };
        }
        break;
        case EMAIL_SENT: {
            return {...state, entity: {...state.entity, email_sent: true}};
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default promocodeReducer;
