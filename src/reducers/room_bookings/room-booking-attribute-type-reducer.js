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
    RECEIVE_ROOM_BOOKING_ATTRIBUTE_TYPE,
    RESET_ROOM_BOOKING_ATTRIBUTE_TYPE_FORM,
    UPDATE_ROOM_BOOKING_ATTRIBUTE_TYPE,
    ROOM_BOOKING_ATTRIBUTE_TYPE_UPDATED,
    ROOM_BOOKING_ATTRIBUTE_TYPE_ADDED,
    ROOM_BOOKING_ATTRIBUTE_ADDED,
    ROOM_BOOKING_ATTRIBUTE_DELETED
} from '../../actions/room-booking-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';

import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id         : 0,
    type       : '',
    values     : [],
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const roomBookingAttributeTypeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_ROOM_BOOKING_ATTRIBUTE_TYPE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_ROOM_BOOKING_ATTRIBUTE_TYPE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_TYPE_ADDED:
        case RECEIVE_ROOM_BOOKING_ATTRIBUTE_TYPE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_TYPE_UPDATED: {
            return state;
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_ADDED: {
            let attribute = {...payload.response};
            return {...state, entity: {...state.entity, values:[...state.entity.values, attribute]} };
        }
        break;
        case ROOM_BOOKING_ATTRIBUTE_DELETED: {
            let {attributeValueId} = payload;
            let attributes = state.entity.values.filter(v => v.id !== attributeValueId);
            return {...state, entity: {...state.entity, values: attributes} };
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

export default roomBookingAttributeTypeReducer;
