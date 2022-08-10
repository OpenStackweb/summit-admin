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
    LOCATION_UPDATED,
    LOCATION_ADDED,
    LOCATION_GMAP_UPDATED,
    LOCATION_ADDRESS_UPDATED,
    FLOOR_DELETED,
    FLOOR_ADDED,
    FLOOR_UPDATED,
    ROOM_ADDED,
    ROOM_DELETED,
    LOCATION_IMAGE_DELETED,
    LOCATION_MAP_DELETED
} from '../../actions/location-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    short_name          : '',
    class_name          : '',
    description         : '',
    location_type       : '',
    address_1            : '',
    address_2            : '',
    zip_code            : '',
    city                : '',
    state               : '',
    country             : '',
    website_url         : '',
    lng                 : 0,
    lat                 : 0,
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
    airport_type        : '',
    hotel_type          : '',
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
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
                return DEFAULT_STATE;
            }
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_LOCATION_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_LOCATION_META: {
            let allClasses = [...payload.response];

            return {...state, allClasses: allClasses }
        }
        break;
        case UPDATE_LOCATION: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case LOCATION_ADDED:
        case RECEIVE_LOCATION: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.hasOwnProperty('floors') && entity.hasOwnProperty('rooms')) {
                entity.floors = entity.floors.sort((a, b) => {
                    return parseInt(a.number) - parseInt(b.number)
                });
                entity.rooms = entity.rooms.map(r => {
                    let floor = entity.floors.find(f => f.id === r.floor_id);
                    let floor_name = floor ? floor.name : 'N/A';

                    return {...r, floor_name: floor_name}
                });
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors:{} };
        }
        break;
        case LOCATION_UPDATED: {
            return state;
        }
        break;
        case LOCATION_GMAP_UPDATED: {
            let {location} = payload[0].geometry;
            return {...state, entity: {...state.entity, lat: location.lat(), lng: location.lng()}};
        }
        break;
        case LOCATION_ADDRESS_UPDATED: {
            let address = payload[0].address_components;
            let {location} = payload[0].geometry;
            let st_nmbr = address.find(l => l.types.indexOf('street_number') !== -1).short_name;
            let street = address.find(l => l.types.indexOf('route') !== -1).short_name;
            let city = address.find(l => l.types.indexOf('locality') !== -1).short_name;
            let loc_state = address.find(l => l.types.indexOf('administrative_area_level_1') !== -1).short_name;
            let country = address.find(l => l.types.indexOf('country') !== -1).short_name;

            return {...state, entity: {...state.entity,
                address_1: st_nmbr + ' ' + street,
                city: city,
                state: loc_state,
                country: country,
                lat: location.lat(),
                lng: location.lng()
            }};
        }
        break;
        case FLOOR_ADDED: {
            let { response } = payload;
            return {...state, entity: {...state.entity, floors: [...state.entity.floors, response] }};
        }
        break;
        case FLOOR_UPDATED: {
            let { response } = payload;
            let floors = state.entity.floors.filter(f => f.id !== response.id);
            return {...state, entity: {...state.entity, floors: [...floors, response] }};
        }
        break;
        case FLOOR_DELETED: {
            let {floorId} = payload;
            return {...state, entity: {...state.entity, floors: state.entity.floors.filter(f => f.id !== floorId)}};
        }
        break;
        case ROOM_ADDED: {
            let { response } = payload;
            let floor = state.entity.floors.find(f => f.id === response.floor_id);
            response.floor_name = floor ? floor.name : 'N/A';

            return {...state, entity: {...state.entity, rooms: [...state.entity.rooms, response] }};
        }
        break;
        case ROOM_DELETED: {
            let {roomId} = payload;
            return {...state, entity: {...state.entity, rooms: state.entity.rooms.filter(r => r.id !== roomId)}};
        }
        break;
        case LOCATION_IMAGE_DELETED: {
            let {imageId} = payload;
            return {...state, entity: {...state.entity, images: state.entity.images.filter(i => i.id !== imageId)}};
        }
        break;
        case LOCATION_MAP_DELETED: {
            let {mapId} = payload;
            return {...state, entity: {...state.entity, maps: state.entity.maps.filter(m => m.id !== mapId)}};
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
