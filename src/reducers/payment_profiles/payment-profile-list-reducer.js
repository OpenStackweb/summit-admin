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
    RECEIVE_PAYMENT_PROFILES,
    REQUEST_PAYMENT_PROFILES,
    PAYMENT_PROFILE_DELETED,
    PAYMENT_PROFILE_ADDED,
    PAYMENT_PROFILE_UPDATED
} from '../../actions/ticket-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    paymentProfiles         : [],
    order                   : 'id',
    orderDir                : 1,
    totalPaymentProfiles    : 0
};

const paymentProfileListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_PAYMENT_PROFILES: {
            let {order, orderDir} = payload;
            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_PAYMENT_PROFILES: {
            let { total } = payload.response;
            let paymentProfiles = payload.response.data;

            return {...state, paymentProfiles: paymentProfiles, totalPaymentProfiles: total };
        }
        break;
        case PAYMENT_PROFILE_ADDED: {
            let { response } = payload;
            return {...state, paymentProfiles: [...state.paymentProfiles, response]};
        }
        break;
        case PAYMENT_PROFILE_UPDATED: {
            let updatedEntity = {...payload.response};
            let paymentProfiles = state.paymentProfiles.map( pp => {
                if (pp.id === updatedEntity.id) return updatedEntity;
                return pp;
            });

            return {...state, paymentProfiles: paymentProfiles};
        }
        break;
        case PAYMENT_PROFILE_DELETED: {
            let {paymentProfileId} = payload;
            return {...state, paymentProfiles: state.paymentProfiles.filter(pp => pp.id !== paymentProfileId)};
        }
        break;
        default:
            return state;
    }
};

export default paymentProfileListReducer;
