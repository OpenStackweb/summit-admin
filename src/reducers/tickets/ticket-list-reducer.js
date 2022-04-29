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
    CLEAR_ALL_SELECTED_TICKETS,
    RECEIVE_TICKETS,
    REQUEST_TICKETS,
    SELECT_TICKET,
    SET_SELECTED_ALL_TICKETS,
    UNSELECT_TICKET,
} from '../../actions/ticket-actions';

import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/actions';
import {epochToMoment} from "openstack-uicore-foundation/lib/methods";

const DEFAULT_STATE = {
    tickets: [],
    term: null,
    order: 'id',
    orderDir: 1,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    totalTickets: 0,
    selectedIds: [],
    selectedAll: false,
    // filters
    showOnlyPendingRefundRequests: false,
    ticketTypesFilter : [],
    ownerFullNameStartWithFilter:[],
    hasOwnerFilter : null,
    completedFilter : null,
    hasBadgeFilter : null,
};

const ticketListReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
            break;
        case REQUEST_TICKETS: {
            let {order, orderDir, page, perPage, ...rest} = payload;
            return {...state, order, orderDir, currentPage: page, perPage, ...rest}
        }
            break;
        case RECEIVE_TICKETS: {
            let {total, last_page, data} = payload.response;
            let tickets = data.map(t => {

                let bought_date = t.bought_date ? epochToMoment(t.bought_date).format('MMMM Do YYYY, h:mm:ss a') : '';
                let number = t.external_order_id || `...${t.number.slice(-15)}`;

                const final_amount_formatted = `$${t.final_amount.toFixed(2)}`;
                const refunded_amount_formatted = `$${t.refunded_amount.toFixed(2)}`;
                const final_amount_adjusted_formatted = `$${((t.final_amount - t.refunded_amount).toFixed(2))}`;

                return {
                    id: t.id,
                    number: number,
                    order_id: t.order.id,
                    ticket_type: t.ticket_type ? t.ticket_type.name : 'N/A',
                    bought_date: bought_date,
                    owner_name: t.owner ? t.owner.first_name + ' ' + t.owner.last_name : 'N/A',
                    owner_email: t.owner ? t.owner.email : 'N/A',
                    status: t.status,
                    final_amount_formatted,
                    refunded_amount_formatted,
                    final_amount_adjusted_formatted,
                    refund_requests: [...t.refund_requests],
                };
            })
            return {...state, tickets: tickets, lastPage: last_page, totalTickets: total};
        }
            break;
        case SELECT_TICKET:
            return {...state, selectedIds: [...state.selectedIds, payload]};
            break;
        case UNSELECT_TICKET:
            return {
                ...state,
                selectedIds: state.selectedIds.filter(element => element !== payload),
                selectedAll: false
            };
            break;
        case SET_SELECTED_ALL_TICKETS:
            return {...state, selectedAll: payload, selectedIds: []};
            break;
        case CLEAR_ALL_SELECTED_TICKETS:
            return {...state, selectedIds: [], selectedAll: false};
            break;
        default:
            return state;
    }
};

export default ticketListReducer;
