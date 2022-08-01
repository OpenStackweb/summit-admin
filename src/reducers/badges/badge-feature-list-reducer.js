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
    RECEIVE_BADGE_FEATURES,
    REQUEST_BADGE_FEATURES,
    BADGE_FEATURE_DELETED,
} from '../../actions/badge-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    badgeFeatures       : [],
    order               : 'name',
    orderDir            : 1,
    totalBadgeFeatures  : 0
};

const badgeFeatureListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_BADGE_FEATURES: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        case RECEIVE_BADGE_FEATURES: {
            let { total } = payload.response;
            let badgeFeatures = payload.response.data;

            return {...state, badgeFeatures: badgeFeatures, totalBadgeFeatures: total };
        }
        case BADGE_FEATURE_DELETED: {
            let {badgeFeatureId} = payload;
            return {...state, badgeFeatures: state.badgeFeatures.filter(t => t.id !== badgeFeatureId), totalBadgeFeatures: (state.totalBadgeFeatures - 1)};
        }
        default:
            return state;
    }
};

export default badgeFeatureListReducer;
