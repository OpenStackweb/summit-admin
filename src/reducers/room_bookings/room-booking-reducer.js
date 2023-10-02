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
    RECEIVE_ROOM_BOOKING,
    RESET_ROOM_BOOKING_FORM,
    ROOM_BOOKING_UPDATED,
    ROOM_BOOKING_ADDED,
    RECEIVE_ROOM_BOOKING_AVAILABILITY
} from '../../actions/room-booking-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    amount: 0,
    approved_payment_date: 0,
    currency: "USD",
    start_datetime: 0,
    end_datetime: 0,
    owner_id: 0,
    payment_gateway_client_token: null,
    room_id: 0,
    status: ""
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
    available_slots : null
};

const roomBookingReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_ROOM_BOOKING_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case ROOM_BOOKING_ADDED:
        case ROOM_BOOKING_UPDATED:
        case RECEIVE_ROOM_BOOKING: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case RECEIVE_ROOM_BOOKING_AVAILABILITY: {
            const availableSlots = payload.response.data;
            return {...state, available_slots: availableSlots}
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

export default roomBookingReducer;
