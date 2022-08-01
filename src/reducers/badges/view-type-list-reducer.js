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
    RECEIVE_VIEW_TYPES,
    REQUEST_VIEW_TYPES,
    VIEW_TYPE_DELETED, 
} from '../../actions/badge-actions';

import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    viewTypes           : [],
    term                : null,
    order               : 'name',
    orderDir            : 1,
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalViewTypes      : 0
};

const viewTypeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_VIEW_TYPES: {
            let {term, order, orderDir} = payload;

            return {...state, term, order, orderDir }
        }
        break;
        case RECEIVE_VIEW_TYPES: {
            let { total } = payload.response;
            let viewTypes = payload.response.data;

            return {...state, viewTypes, totalViewTypes: total };
        }
        break;
        case VIEW_TYPE_DELETED: {
            let {viewTypeId} = payload;
            return {...state, viewTypes: state.viewTypes.filter(t => t.id !== viewTypeId), totalViewTypes: (state.totalViewTypes - 1)};
        }
        break;
        default:
            return state;
    }
};

export default viewTypeListReducer;
