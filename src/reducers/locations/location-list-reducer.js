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
    RECEIVE_LOCATIONS,
    LOCATION_ORDER_UPDATED,
    REQUEST_LOCATIONS,
    LOCATION_DELETED,
    LOCATIONS_SEEDED
} from '../../actions/location-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    locations       : [],
    totalLocations : 0,
    allTypes       : ['ALL']
};

const locationListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_LOCATIONS: {
            return {...state }
        }
        case RECEIVE_LOCATIONS: {
            let {total} = payload.response;
            let locations = payload.response.data.map(l => {

                return {
                    id: l.id,
                    name: l.name,
                    class_name: l.class_name,
                    order: l.order
                };
            })

            return {...state, locations: locations, totalLocations: total };
        }
        case LOCATIONS_SEEDED: {
            const newLocations = payload.response.data?.map(l => {
                return {
                    id: l.id,
                    name: l.name,
                    class_name: l.class_name,
                    order: l.order
                };
            }) || [];

            return {...state, locations: [...state.locations, ... newLocations] };
        }
        case LOCATION_ORDER_UPDATED: {
            let locations = payload.map(l => {

                return {
                    id: l.id,
                    name: l.name,
                    class_name: l.class_name,
                    order: parseInt(l.order)
                };
            })

            return {...state, locations: locations };
        }
        case LOCATION_DELETED: {
            let {locationId} = payload;
            return {...state, locations: state.locations.filter(l => l.id !== locationId)};
        }
        default:
            return state;
    }
};

export default locationListReducer;
