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
    RECEIVE_BADGE_FEATURE,
    RESET_BADGE_FEATURE_FORM,
    UPDATE_BADGE_FEATURE,
    BADGE_FEATURE_UPDATED,
    BADGE_FEATURE_ADDED, BADGE_FEATURE_IMAGE_ATTACHED, BADGE_FEATURE_IMAGE_DELETED
} from '../../actions/badge-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    description         : '',
    template_content    : '',
    image               : null,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const badgeFeatureReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_BADGE_FEATURE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_BADGE_FEATURE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case BADGE_FEATURE_ADDED:
        case RECEIVE_BADGE_FEATURE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case BADGE_FEATURE_UPDATED: {
            return state;
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case BADGE_FEATURE_IMAGE_ATTACHED: {
            let image = {...payload.response};
            //let image = {...state.entity.image, url:  state.entity.image.url + '?' + new Date().getTime()};
            return {...state, entity: {...state.entity, image: image.url} };
        }
            break;
        case BADGE_FEATURE_IMAGE_DELETED: {
            return {...state, entity: {...state.entity, image: null} };
        }
            break;
        default:
            return state;
    }
};

export default badgeFeatureReducer;
