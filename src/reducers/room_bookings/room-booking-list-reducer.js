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
    ROOM_BOOKING_REFUNDED
} from '../../actions/room-booking-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {epochToMoment} from "openstack-uicore-foundation/lib/utils/methods";

const DEFAULT_STATE = {
    roomBookings        : [],
    term                : null,
    order               : 'start_datetime',
    orderDir            : 1,
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalRoomBookings   : 0
};

const roomBookingListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_ROOM_BOOKINGS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_ROOM_BOOKINGS: {
            let { current_page, total, last_page } = payload.response;
            let room_bookings = payload.response.data.map(rb => {
                let ownerName = rb.owner.first_name + ' ' + rb.owner.last_name;
                let created = epochToMoment(rb.created).format('M/D/YYYY, h:mm:ss a');
                return {
                    ...rb,
                    created: created,
                    owner_name: ownerName,
                    owner_email: rb.owner.email,
                    room_name: rb.room.name,
                    room_id: rb.room.id,
                    amount_str: `$${rb.amount}`,
                    refunded_amount_str: `$${rb.refunded_amount}`
                };
            })

            return {...state, roomBookings: room_bookings, currentPage: current_page, totalRoomBookings: total, lastPage: last_page };
        }
        case ROOM_BOOKING_REFUNDED: {
            let roomBooking = payload.response;
            let roomBookings = [...state.roomBookings];
            roomBookings.forEach(rb => {
               if (rb.id === roomBooking.id) {
                   rb.status = 'Refunded';
                   rb.refunded_amount_str = `$${roomBooking.refunded_amount}`
               }
            });

            return {...state, roomBookings: roomBookings};
        }
        default:
            return state;
    }
};

export default roomBookingListReducer;
