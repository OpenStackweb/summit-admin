/**
 * Copyright 2018 OpenStack Foundation
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
    RECEIVE_TAG_GROUP,
    RESET_TAG_GROUP_FORM,
    UPDATE_TAG_GROUP,
    TAG_GROUP_ADDED,
    TAG_ADDED_TO_GROUP,
    TAG_REMOVED_FROM_GROUP
} from '../../actions/tag-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id              : 0,
    name            : '',
    label           : '',
    is_mandatory    : false,
    allowed_tags    : []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const tagGroupReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_TAG_GROUP_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_TAG_GROUP: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case TAG_GROUP_ADDED:
        case RECEIVE_TAG_GROUP: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            entity.allowed_tags = entity.allowed_tags.map(at => at.tag);

            return {...state, entity: entity, errors: {} };
        }
        break;
        case TAG_ADDED_TO_GROUP: {
            return {...state,  entity: {...state.entity, allowed_tags: [...state.entity.allowed_tags, payload]} };
        }
        break;
        case TAG_REMOVED_FROM_GROUP: {
            let allowed_tags = state.entity.allowed_tags.filter(t => t.id !== payload);
            return {...state,  entity: {...state.entity, allowed_tags: allowed_tags} };
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

export default tagGroupReducer;
