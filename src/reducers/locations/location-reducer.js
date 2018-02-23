/**
 * Copyright 2017 OpenStack Foundation
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
    RECEIVE_LOCATION,
    RECEIVE_LOCATION_META,
    RESET_LOCATION_FORM,
    UPDATE_LOCATION,
    LOCATION_UPDATED
} from '../../actions/location-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { VALIDATE } from '../../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    class_name          : '',
    description         : '',
    location_type       : '',
    type                : '',
    address_1           : '',
    address_2           : '',
    zipcode             : '',
    city                : '',
    state               : '',
    country             : '',
    website             : '',
    lng                 : '',
    lat                 : '',
    display_on_site     : false,
    details_page        : false,
    is_main             : false,
    location_message    : '',
    maps                : [],
    images              : [],
    rooms               : [],
    floors              : [],
    capacity            : 0,
    booking_link        : '',
    sold_out            : false,

}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
    allTypes    : [],
    allClasses  : []
};

const locationReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_LOCATION_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_LOCATION_META: {
            let types = [...DEFAULT_STATE.allTypes];
            let allClasses = [...payload.response];

            allClasses.map(t => {
                types = types.concat(t.type)
            });

            let unique_types = [...new Set( types )];

            return {...state, allTypes: unique_types, allClasses: allClasses }
        }
        break;
        case UPDATE_LOCATION: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_LOCATION: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case LOCATION_UPDATED: {
            return state;
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

export default locationReducer;