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
import React from "react";
import history from "../../history";
import
{
    RECEIVE_PURCHASE_ORDER,
    RESET_PURCHASE_ORDER_FORM,
    UPDATE_PURCHASE_ORDER,
    PURCHASE_ORDER_CANCEL_REFUND,
    PURCHASE_ORDER_UPDATED,
    RECEIVE_PURCHASE_ORDER_REFUNDS
} from '../../actions/order-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

export const DEFAULT_ENTITY = {
    id: 0,
    number: '',
    ticket_qty: 1,
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
    promo_code: '',
    credit_card_type: '',
    credit_card_4number: '',
    applied_taxes: [],
    approved_refunds: [],
    approved_refunds_taxes: []
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const assembleTicketsState = (tickets) => {
    return tickets.map(t => {
        let owner_full_name = 'N/A';
        let owner_email = 'N/A';
        let owner_link = 'N/A';
        let email_link = 'N/A';
        let ticket_type_name = t.ticket_type ? t.ticket_type.name : 'N/A';

        const final_amount_formatted = `$${t.final_amount.toFixed(2)}`;
        const refunded_amount_formatted = `$${t.refunded_amount.toFixed(2)}`;
        const final_amount_adjusted_formatted = `$${((t.final_amount - t.refunded_amount).toFixed(2))}`;

        if (t.owner) {
            owner_email = t.owner.email;

            if (t.owner.first_name && t.owner.last_name) {
                owner_full_name = `${t.owner.first_name} ${t.owner.last_name}`;
            } else if (t.owner.member?.first_name && t.owner.member?.last_name) {
                owner_full_name = `${t.owner.member.first_name} ${t.owner.member.last_name}`;
            }

            owner_link = <a href="" onClick={ev => { ev.stopPropagation(); history.push(`/app/summits/${entity.summit_id}/attendees/${t.owner.id}`)}}>{owner_full_name}</a>;
            email_link = <a href="" onClick={ev => { ev.stopPropagation(); window.open(`mailto:${owner_email}`, '_blank')}} target="_blank">{owner_email}</a>
        }

        return ({...t, ticket_type_name, owner_full_name, owner_email, owner_link, email_link,
            final_amount_formatted,
            refunded_amount_formatted,
            final_amount_adjusted_formatted,})
    });
}

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

            const final_amount_formatted = `$${entity.amount.toFixed(2)}`;
            const refunded_amount_formatted = `$${entity.total_refunded_amount.toFixed(2)}`;
            const final_amount_adjusted_formatted = `$${((entity.amount - entity.total_refunded_amount).toFixed(2))}`;

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

            entity.tickets = assembleTicketsState(entity.tickets);

            return {...state,  entity: {...entity,
                    final_amount_formatted,
                    refunded_amount_formatted,
                    final_amount_adjusted_formatted,}, errors: {} };
        }
        break;
        case UPDATE_PURCHASE_ORDER: {
            return {...state,  entity: {...payload }, errors: {} };
        }
        case PURCHASE_ORDER_UPDATED: {
            let entity = {...payload.response};

            return {
                ...state,
                entity: {
                    owner: {
                        email: entity.owner_email,
                        first_name: entity.owner_first_name,
                        last_name: entity.owner_last_name,
                    },
                    ...entity,
                    tickets: assembleTicketsState(entity.tickets)
                },
                errors: {}
            }
        }
        case RECEIVE_PURCHASE_ORDER_REFUNDS: {
            const approved_refunds = payload.response.data;
            const approved_refunds_taxes = [];
            const purchaseOrder = state.entity;
            let adjusted_order_price = purchaseOrder.amount;
            let adjusted_net_price = purchaseOrder.raw_amount;            
            let adjusted_total_order_purchase_price = 0;
            let adjusted_applied_taxes = purchaseOrder.applied_taxes;
            approved_refunds.forEach(refund => {
                refund.ticket_id = refund.ticket.id;
                refund.refunded_amount_formatted = `$${refund.refunded_amount.toFixed(2)}`;
                refund.total_refunded_amount_formatted = `$${refund.total_refunded_amount.toFixed(2)}`;
                adjusted_total_order_purchase_price += refund.total_refunded_amount;                
                adjusted_net_price -= refund.refunded_amount;                
                refund.adjusted_net_price_formatted = `$${adjusted_net_price.toFixed(2)}`;
                adjusted_order_price -= refund.total_refunded_amount;
                refund.adjusted_order_price_formatted = `$${adjusted_order_price.toFixed(2)}`;
                refund.refunded_taxes.forEach(rt => {
                    // field for the tax column of that refund
                    refund[`tax_${rt.tax.id}_refunded_amount`] = `$${rt.refunded_amount.toFixed(2)}`
                    adjusted_applied_taxes.forEach(t => {                        
                        if(t.id === rt.tax.id) {
                            t.amount -= rt.refunded_amount;                            
                            refund[`tax_${rt.tax.id}_adjusted_refunded_amount`] = `$${(t.amount).toFixed(2)}`
                        }
                    });                    
                    // add tax type to array
                    approved_refunds_taxes.push(rt.tax);
                });
            });
            adjusted_total_order_purchase_price = (purchaseOrder.amount - adjusted_total_order_purchase_price);
            const unique_approved_refunds_taxes = approved_refunds_taxes.filter((tax, idx, arr) => {
                return idx === arr.findIndex(obj => obj.id === tax.id);
            });            
            return {...state, entity: {...state.entity, approved_refunds, adjusted_total_order_purchase_price, approved_refunds_taxes: unique_approved_refunds_taxes }};
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        case PURCHASE_ORDER_CANCEL_REFUND:{
            const { entity} = state;
            return {...state,  entity: {...entity, status: 'Paid' }};
        }
        break;
        default:
            return state;
    }
};

export default purchaseOrderReducer;
