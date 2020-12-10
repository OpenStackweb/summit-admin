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
    RECEIVE_BADGE_TYPE,
    RESET_BADGE_TYPE_FORM,
    UPDATE_BADGE_TYPE,
    BADGE_TYPE_UPDATED,
    BADGE_TYPE_ADDED,
    BADGE_ACCESS_LEVEL_ADDED,
    BADGE_ACCESS_LEVEL_REMOVED,
    FEATURE_ADDED_TO_TYPE,
    FEATURE_REMOVED_FROM_TYPE
} from '../../actions/badge-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    description         : '',
    is_default          : 0,
    access_levels       : [],
    badge_features      : [],
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const badgeTypeReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_BADGE_TYPE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_BADGE_TYPE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case BADGE_TYPE_ADDED:
        case RECEIVE_BADGE_TYPE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case BADGE_TYPE_UPDATED: {
            return state;
        }
        break;
        case BADGE_ACCESS_LEVEL_ADDED: {
            let newAccessLevel = {...payload.accessLevel};
            let accessLevels = [...state.entity.access_levels, newAccessLevel];

            return {...state, entity: {...state.entity, access_levels: accessLevels}, errors: {} };
        }
        break;
        case BADGE_ACCESS_LEVEL_REMOVED: {
            let {accessLevelId} = payload;
            let accessLevels = state.entity.access_levels.filter(a => a.id !== accessLevelId);
            return {...state, entity: {...state.entity, access_levels: accessLevels} };
        }
        break;
        case FEATURE_ADDED_TO_TYPE: {
            let newFeature = {...payload.feature};
            let badgeFeatures = [...state.entity.badge_features, newFeature];

            return {...state, entity: {...state.entity, badge_features: badgeFeatures}, errors: {} };
        }
        break;
        case FEATURE_REMOVED_FROM_TYPE: {
            let {featureId} = payload;
            let badgeFeatures = state.entity.badge_features.filter(f => f.id !== featureId);
            return {...state, entity: {...state.entity, badge_features: badgeFeatures} };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default badgeTypeReducer;
