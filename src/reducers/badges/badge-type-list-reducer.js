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
    RECEIVE_BADGE_TYPES,
    REQUEST_BADGE_TYPES,
    BADGE_TYPE_DELETED,
} from '../../actions/badge-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    badgeTypes            : [],
    order               : 'name',
    orderDir            : 1,
    totalBadgeTypes       : 0
};

const badgeTypeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_BADGE_TYPES: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        case RECEIVE_BADGE_TYPES: {
            let { total } = payload.response;
            let badgeTypes = payload.response.data;

            badgeTypes = badgeTypes.map(b => {
                let access_level_names = b.access_levels.map(al => al.name).join(' ,');
                return {...b, access_level_names};
            });

            return {...state, badgeTypes: badgeTypes, totalBadgeTypes: total };
        }
        case BADGE_TYPE_DELETED: {
            let {badgeTypeId} = payload;
            return {...state, badgeTypes: state.badgeTypes.filter(t => t.id !== badgeTypeId), totalBadgeTypes: (state.totalBadgeTypes - 1)};
        }
        default:
            return state;
    }
};

export default badgeTypeListReducer;
