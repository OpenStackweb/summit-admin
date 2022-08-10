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
    RECEIVE_ACCESS_LEVELS,
    REQUEST_ACCESS_LEVELS,
    ACCESS_LEVEL_DELETED,
} from '../../actions/badge-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    accessLevels            : [],
    order               : 'name',
    orderDir            : 1,
    totalAccessLevels       : 0
};

const accessLevelListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_ACCESS_LEVELS: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        case RECEIVE_ACCESS_LEVELS: {
            let { total } = payload.response;
            let accessLevels = payload.response.data;

            return {...state, accessLevels: accessLevels, totalAccessLevels: total };
        }
        case ACCESS_LEVEL_DELETED: {
            let {accessLevelId} = payload;
            return {...state, accessLevels: state.accessLevels.filter(t => t.id !== accessLevelId), totalAccessLevels: (state.totalAccessLevels - 1)};
        }
        default:
            return state;
    }
};

export default accessLevelListReducer;
