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

import {LOGOUT_USER} from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
  ticketTypes: [],
  order: 'name',
  orderDir: 1,
  totalTicketTypes: 0,
  audienceFilter: [],
  currentPage: 1,
  lastPage: 1,
  perPage: 25,
};

const ticketTypeListReducer = (state = DEFAULT_STATE, action) => {
  const {type, payload} = action
  switch (type) {
    case SET_CURRENT_SUMMIT:
    case LOGOUT_USER: {
      return DEFAULT_STATE;
    }
    case REQUEST_TICKET_TYPES: {
      let {order, orderDir, currentPage, perPage, audienceFilter} = payload;
      ;
      return {...state, order, orderDir, currentPage, perPage, audienceFilter}
    }
    case RECEIVE_TICKET_TYPES: {
      let {total} = payload.response;
      let ticketTypes = payload.response.data.map(t => {

        return {
          id: t.id,
          name: t.name,
          audience: t.audience,
          external_id: t.external_id,
          badge_type_name: t.hasOwnProperty("badge_type") ? t.badge_type.name : 'TBD',
          cost: t?.cost,
        };
      })

      return {...state, ticketTypes: ticketTypes, totalTicketTypes: total};
    }
    case TICKET_TYPES_SEEDED: {
      let {total} = payload.response;
      let ticketTypes = payload.response.data.map(t => {

        return {
          id: t.id,
          name: t.name,
          external_id: t.external_id,
          badge_type_name: t.hasOwnProperty("badge_type") ? t.badge_type.name : 'TBD',
          cost: t?.cost,
        };
      })

      return {...state, ticketTypes: [...state.ticketTypes, ticketTypes], totalTicketTypes: total};
    }
    case TICKET_TYPE_DELETED: {
      let {ticketTypeId} = payload;
      return {...state, ticketTypes: state.ticketTypes.filter(t => t.id !== ticketTypeId)};
    }
    default:
      return state;
  }
};

export default ticketTypeListReducer;
