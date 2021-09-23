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
    RECEIVE_TICKET_TYPES,
    REQUEST_TICKET_TYPES,
    TICKET_TYPE_DELETED,
    TICKET_TYPES_SEEDED
} from '../../actions/ticket-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    ticketTypes         : [],
    order               : 'name',
    orderDir            : 1,
    totalticketTypes    : 0
};

const ticketTypeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_TICKET_TYPES: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_TICKET_TYPES: {
            let { total } = payload.response;
            let ticketTypes = payload.response.data.map(t => {

                return {
                    id: t.id,
                    name: t.name,
                    external_id: t.external_id,
                    badge_type_name: t.hasOwnProperty("badge_type") ? t.badge_type.name : 'TBD',
                    cost: t?.cost,
                };
            })

            return {...state, ticketTypes: ticketTypes, totalTicketTypes: total };
        }
        break;
        case TICKET_TYPES_SEEDED: {
            let { total } = payload.response;
            let ticketTypes = payload.response.data.map(t => {

                return {
                    id: t.id,
                    name: t.name,
                    external_id: t.external_id,
                    badge_type_name: t.hasOwnProperty("badge_type") ? t.badge_type.name : 'TBD',
                    cost: t?.cost,
                };
            })

            return {...state, ticketTypes: [...state.ticketTypes, ticketTypes], totalTicketTypes: total };
        }
            break;
        case TICKET_TYPE_DELETED: {
            let {ticketTypeId} = payload;
            return {...state, ticketTypes: state.ticketTypes.filter(t => t.id !== ticketTypeId)};
        }
        break;
        default:
            return state;
    }
};

export default ticketTypeListReducer;
