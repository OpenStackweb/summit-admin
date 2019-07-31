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
    RECEIVE_TAX_TYPES,
    REQUEST_TAX_TYPES,
    TAX_TYPE_DELETED,
    TAX_TYPES_SEEDED
} from '../../actions/tax-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

const DEFAULT_STATE = {
    taxTypes            : [],
    order               : 'name',
    orderDir            : 1,
    totalTaxTypes       : 0
};

const taxTypeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_TAX_TYPES: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_TAX_TYPES: {
            let { total } = payload.response;
            let taxTypes = payload.response.data;

            return {...state, taxTypes: taxTypes, totalTaxTypes: total };
        }
        break;
        case TAX_TYPES_SEEDED: {
            let { total } = payload.response;
            let taxTypes = payload.response.data;

            return {...state, taxTypes: [...state.taxTypes, taxTypes], totalTaxTypes: total };
        }
            break;
        case TAX_TYPE_DELETED: {
            let {taxTypeId} = payload;
            return {...state, taxTypes: state.taxTypes.filter(t => t.id != taxTypeId)};
        }
        break;
        default:
            return state;
    }
};

export default taxTypeListReducer;
