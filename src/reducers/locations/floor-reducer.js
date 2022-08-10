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
    RECEIVE_FLOOR,
    RESET_FLOOR_FORM,
    UPDATE_FLOOR,
    FLOOR_ADDED,
    FLOOR_UPDATED,
    ROOM_DELETED,
    FLOOR_IMAGE_ATTACHED,
    FLOOR_IMAGE_DELETED
} from '../../actions/location-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    description         : '',
    number              : 0,
    rooms               : [],
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
};

const floorReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_FLOOR_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_FLOOR: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case FLOOR_ADDED:
        case RECEIVE_FLOOR: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case FLOOR_UPDATED: {
            return state;
        }
        break;
        case ROOM_DELETED: {
            let {roomId} = payload;
            return {...state, entity: {...state.entity, rooms: state.entity.rooms.filter(r => r.id !== roomId)}};
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case FLOOR_IMAGE_ATTACHED: {
            let image = {...payload.response};
            //let image = {...state.entity.image, url:  state.entity.image.url + '?' + new Date().getTime()};
            return {...state, entity: {...state.entity, image: image.url} };
        }
        break;
        case FLOOR_IMAGE_DELETED: {
            let {floorId} = payload;
            return {...state, entity: {...state.entity, image: null} };
        }
        break;
        default:
            return state;
    }
};

export default floorReducer;
