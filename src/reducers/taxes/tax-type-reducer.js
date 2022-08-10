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
    RECEIVE_TAX_TYPE,
    RESET_TAX_TYPE_FORM,
    UPDATE_TAX_TYPE,
    TAX_TYPE_UPDATED,
    TAX_TYPE_ADDED,
    TAX_TICKET_ADDED,
    TAX_TICKET_REMOVED
} from '../../actions/tax-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id              : 0,
    name            : '',
    rate            : 0,
    tax_id          : '',
    ticket_types    : [],
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const taxTypeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_TAX_TYPE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_TAX_TYPE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case TAX_TYPE_ADDED:
        case RECEIVE_TAX_TYPE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case TAX_TYPE_UPDATED: {
            return state;
        }
        break;
        case TAX_TICKET_ADDED: {
            let { ticket } = payload;
            return {...state, entity: {...state.entity, ticket_types:[...state.entity.ticket_types, ticket]}};
        }
        break;
        case TAX_TICKET_REMOVED: {
            let { ticketId } = payload;
            let ticketTypes = state.entity.ticket_types.filter(tt => tt.id !== ticketId);
            return {...state, entity: {...state.entity, ticket_types:ticketTypes}};
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

export default taxTypeReducer;
