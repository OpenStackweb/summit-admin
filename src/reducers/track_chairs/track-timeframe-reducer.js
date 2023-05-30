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
import React from "react";
import
{
    RESET_TRACK_TIMEFRAME_FORM,
    RECEIVE_TRACK_TIMEFRAME,
    LOCATION_TIMEFRAME_ADDED,
    LOCATION_TIMEFRAME_DELETED,
    DAY_TIMEFRAME_UPDATED,
    DAY_TIMEFRAME_ADDED,
    DAY_TIMEFRAME_DELETED
} from '../../actions/track-timeframes-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

export const DEFAULT_ENTITY = {
    id: null,
    proposed_schedule_allowed_locations: []
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};
const trackTimeframeReducer = (state = DEFAULT_STATE, action) => {
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
        case SET_CURRENT_SUMMIT:
        case RESET_TRACK_TIMEFRAME_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        case RECEIVE_TRACK_TIMEFRAME: {
            const track = {...payload.response};
            
            return {...state, entity: track, errors: {} };
        }
        case LOCATION_TIMEFRAME_ADDED: {
            const entity = {...payload.response};
            return {
                ...state,
                entity: {
                    ...state.entity,
                    proposed_schedule_allowed_locations: [
                        ...state.entity.proposed_schedule_allowed_locations,
                        entity
                    ]
                }
            }
        }
        case LOCATION_TIMEFRAME_DELETED: {
            const {allowedLocationId} = payload;
    
            return {
                ...state,
                entity: {
                    ...state.entity,
                    proposed_schedule_allowed_locations: state.entity.proposed_schedule_allowed_locations.filter(psal => psal.id !== allowedLocationId)}
            };
        }
        case DAY_TIMEFRAME_UPDATED:
        case DAY_TIMEFRAME_ADDED: {
            const entity = {...payload.response};
            const newLocs = state.entity.proposed_schedule_allowed_locations.map(psal => {
                if (psal.id === entity.allowed_location_id) {
                    const newDayTimeframes = [...psal.allowed_timeframes.filter(at => at.id !== entity.id), entity]
                    return {...psal, allowed_timeframes: newDayTimeframes}
                }
                return psal;
            });
    
            return {
                ...state,
                entity: { ...state.entity, proposed_schedule_allowed_locations: newLocs}
            };
        }
        case DAY_TIMEFRAME_DELETED: {
            const {allowedLocationId, timeframeId} = payload;
            const newLocs = state.entity.proposed_schedule_allowed_locations.map(psal => {
                if (psal.id === allowedLocationId) {
                    return {...psal, allowed_timeframes: psal.allowed_timeframes.filter(at => at.id !== timeframeId)}
                }
                return psal;
            });
    
            return {
                ...state,
                entity: { ...state.entity, proposed_schedule_allowed_locations: newLocs}
            };
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }
};

export default trackTimeframeReducer;
