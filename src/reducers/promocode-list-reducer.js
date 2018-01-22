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

import moment from 'moment-timezone';
import
{
    RECEIVE_PROMOCODES,
    REQUEST_PROMOCODES,
    PROMOCODE_DELETED
} from '../actions/promocode-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { SET_CURRENT_SUMMIT } from '../actions/summit-actions';

const DEFAULT_STATE = {
    promocodes       : [],
    term            : null,
    type            : 'ALL',
    order           : 'code',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalPromocodes  : 0
};

const promocodeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        break;
        case REQUEST_PROMOCODES: {
            let {order, orderDir, type} = payload;

            return {...state, order, orderDir, type }
        }
        break;
        case RECEIVE_PROMOCODES: {
            let {current_page, total, last_page} = payload.response;
            let promocodes = payload.response.data.map(p => {

                return {
                    id: p.id,
                    code: p.code,
                    type: p.type,
                    owner: p.speaker.first_name + ' ' + p.speaker.last_name,
                    owner_email: p.speaker.email,
                    email_sent: (p.email_sent ? 'Yes' : 'No'),
                    redeemed: (p.redeemed ? 'Yes' : 'No'),
                    creator: p.creator.first_name + ' ' + p.creator.last_name
                };
            })

            return {...state, promocodes: promocodes, currentPage: current_page, totalPromocodes: total, lastPage: last_page };
        }
        break;
        case PROMOCODE_DELETED: {
            let {promocodeId} = payload;
            return {...state, promocodes: state.promocodes.filter(p => p.id != promocodeId)};
        }
        break;
        default:
            return state;
    }
};

export default promocodeListReducer;
