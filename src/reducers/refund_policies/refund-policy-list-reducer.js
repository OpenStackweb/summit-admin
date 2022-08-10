/**
 * Copyright 2019 OpenStack Foundation
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
    RECEIVE_REFUND_POLICIES,
    REQUEST_REFUND_POLICIES,
    REFUND_POLICY_DELETED,
    REFUND_POLICY_ADDED,
    REFUND_POLICY_UPDATED
} from '../../actions/ticket-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    refundPolicies          : [],
    order                   : 'name',
    orderDir                : 1,
    totalRefundPolicies     : 0
};

const refundPolicyListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_REFUND_POLICIES: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        case RECEIVE_REFUND_POLICIES: {
            let { total } = payload.response;
            let refundPolicies = payload.response.data;

            return {...state, refundPolicies: refundPolicies, totalRefundPolicies: total };
        }
        case REFUND_POLICY_ADDED: {
            let { response } = payload;
            return {...state, refundPolicies: [...state.refundPolicies, response]};
        }
        case REFUND_POLICY_UPDATED: {
            let updatedEntity = {...payload.response};
            let refundPolicies = state.refundPolicies.map( rp => {
                if (rp.id === updatedEntity.id) return updatedEntity;
                return rp;
            });

            return {...state, refundPolicies: refundPolicies};
        }
        case REFUND_POLICY_DELETED: {
            let {refundPolicyId} = payload;
            return {...state, refundPolicies: state.refundPolicies.filter(t => t.id !== refundPolicyId)};
        }
        default:
            return state;
    }
};

export default refundPolicyListReducer;
