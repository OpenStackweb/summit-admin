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
    RECEIVE_PURCHASE_ORDER,
    RESET_PURCHASE_ORDER_FORM, UPDATE_PURCHASE_ORDER
} from '../../actions/order-actions';


import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

export const DEFAULT_ENTITY = {
    id: 0,
    number: '',
    owner_company: '',
    owner_email: '',
    owner_first_name: '',
    owner_last_name: '',
    owner: {id: 0, first_name: '', last_name: '', email: ''},
    payment_method: '',
    status: '',
    billing_address_1: '',
    billing_address_2: '',
    billing_address_zip_code: '',
    billing_address_city: '',
    billing_address_state: '',
    billing_address_country_iso_code: '',
    extra_question_answers: [],
    tickets: [],
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const purchaseOrderReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_PURCHASE_ORDER_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_PURCHASE_ORDER: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            entity.owner = {
                email: entity.owner_email,
                first_name: entity.owner_first_name,
                last_name: entity.owner_last_name,
            };

            entity.tickets = entity.tickets.map(t => {
                let owner_full_name = 'N/A';
                let owner_email = 'N/A';
                let ticket_type_name = t.ticket_type ? t.ticket_type.name : 'N/A';
                const final_amount_formatted = `$${t.final_amount}`;

                if (t.owner) {
                    owner_email = t.owner.email;

                    if (t.owner.member) {
                        owner_full_name = `${t.owner.member.first_name} ${t.owner.member.last_name}`;
                    } else if (t.owner.first_name && t.owner.last_name) {
                        owner_full_name = `${t.owner.first_name} ${t.owner.last_name}`;
                    }
                }

                return ({...t, ticket_type_name, owner_full_name, owner_email, final_amount_formatted})
            });

            return {...state,  entity: {...entity}, errors: {} };
        }
        break;
        case UPDATE_PURCHASE_ORDER: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default purchaseOrderReducer;
