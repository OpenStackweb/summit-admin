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
    RECEIVE_ROOM,
    RESET_ROOM_FORM,
    UPDATE_ROOM,
    ROOM_ADDED,
    ROOM_UPDATED,
    ATTRIBUTE_ADDED,
    ATTRIBUTE_REMOVED,
    ROOM_IMAGE_ATTACHED,
    ROOM_IMAGE_DELETED
} from '../../actions/location-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    class_name          : null,
    description         : '',
    capacity            : 0,
    override_blackouts  : false,
    time_slot_cost      : 0,
    currency            : 'USD',
    attributes          : [],
    floor               : null,
    floor_id            : null,
    image               : null,
    opening_hour        : null,
    closing_hour        : null,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
};

const roomReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_ROOM_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_ROOM: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case ROOM_ADDED:
        case RECEIVE_ROOM: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case ROOM_UPDATED: {
            return state;
        }
        break;
        case ATTRIBUTE_ADDED: {
            let {attribute} = payload;
            return {...state, entity: {...state.entity, attributes: [...state.entity.attributes, attribute]}};
        }
        break;
        case ATTRIBUTE_REMOVED: {
            let {attributeId} = payload;
            let attributes = state.entity.attributes.filter(at => at.id !== attributeId);
            return {...state, entity: {...state.entity, attributes: attributes} };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case ROOM_IMAGE_ATTACHED: {
            let image = {...payload.response};
            //let image = {...state.entity.image, url:  state.entity.image.url + '?' + new Date().getTime()};
            return {...state, entity: {...state.entity, image: image} };
        }
        break;
        case ROOM_IMAGE_DELETED: {
            let {roomId} = payload;
            return {...state, entity: {...state.entity, image: null} };
        }
        break;
        default:
            return state;
    }
};

export default roomReducer;
