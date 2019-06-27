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
    RECEIVE_ROOM_BOOKINGS,
    REQUEST_ROOM_BOOKINGS,
    ROOM_BOOKING_DELETED,
    ROOM_BOOKING_REFUNDED
} from '../../actions/room-booking-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';
import {epochToMomentTimeZone} from "openstack-uicore-foundation/lib/methods";

const DEFAULT_STATE = {
    roomBookings        : [],
    order               : 'start_datetime',
    orderDir            : 1,
    totalRoomBookings   : 0
};

const roomBookingListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_ROOM_BOOKINGS: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_ROOM_BOOKINGS: {
            let { total } = payload.response;
            let room_bookings = payload.response.data.map(rb => {
                let ownerName = rb.owner.first_name + ' ' + rb.owner.last_name;
                return {
                    ...rb,
                    owner: ownerName,
                    room: rb.room.name,
                    room_id: rb.room.id
                };
            })

            return {...state, roomBookings: room_bookings, totalRoomBookings: total };
        }
        break;
        case ROOM_BOOKING_DELETED: {
            let {roomBookingId} = payload;
            return {...state, roomBookings: state.roomBookings.filter(rb => rb.id != roomBookingId)};
        }
        break;
        case ROOM_BOOKING_REFUNDED: {
            let {roomBookingId} = payload;
            let roomBookings = [...state.roomBookings];
            roomBookings.forEach(rb => {
               if (rb.id == roomBookingId) {
                   rb.status = 'Refunded';
               }
            });

            return {...state, roomBookings: roomBookings};
        }
        break;
        default:
            return state;
    }
};

export default roomBookingListReducer;
