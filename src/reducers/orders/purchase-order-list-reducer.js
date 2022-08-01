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
    RECEIVE_PURCHASE_ORDERS,
    REQUEST_PURCHASE_ORDERS,
} from '../../actions/order-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {epochToMoment} from "openstack-uicore-foundation/lib/methods";
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    purchaseOrders          : {},
    term                    : null,
    order                   : 'name',
    orderDir                : 1,
    currentPage             : 1,
    lastPage                : 1,
    perPage                 : 10,
    totalPurchaseOrders     : 0
};

const purchaseOrderListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_PURCHASE_ORDERS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_PURCHASE_ORDERS: {
            let {current_page, total, last_page} = payload.response;
            let purchaseOrders = payload.response.data.map(a => {
                let bought_date = epochToMoment(a.created).format('MMMM Do YYYY, h:mm:ss a');

                return {
                    id: a.id,
                    number: a.number,
                    owner_id: a.owner_id,
                    owner_name: a.owner_first_name + ' ' + a.owner_last_name,
                    owner_email: a.owner_email,
                    company: a.owner_company,
                    bought_date: bought_date,
                    amount: `$${a.amount}`,
                    payment_method: a.payment_method,
                    status: a.status
                };
            })

            return {...state, purchaseOrders: purchaseOrders, currentPage: current_page, totalPurchaseOrders: total, lastPage: last_page };
        }
        default:
            return state;
    }
};

export default purchaseOrderListReducer;
