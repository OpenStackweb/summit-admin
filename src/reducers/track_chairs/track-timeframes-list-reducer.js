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
    RECEIVE_TRACK_TIMEFRAMES,
    TRACK_TIMEFRAME_ADDED,
    TRACK_TIMEFRAME_DELETED,
} from '../../actions/track-timeframes-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    tracksTimeframes    : [],
    currentPage         : 1,
    lastPage            : 1,
    perPage             : 10,
    totalItems          : 0,
};

const trackTimeframesListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case RECEIVE_TRACK_TIMEFRAMES: {
            const {total, last_page, current_page, data} = payload.response;

            const tracksTimeframes = data.map(tt => ({
                ...tt,
                locationsStr: tt.proposed_schedule_allowed_locations.map(al => al.location.name).join(', ')
            }));

            return {...state, tracksTimeframes, currentPage: current_page, totalItems: total, lastPage: last_page };
        }
        case TRACK_TIMEFRAME_ADDED: {
            const entity = {...payload.response};
            return {...state, tracksTimeframes: [...state.tracksTimeframes, entity]}
        }
        case TRACK_TIMEFRAME_DELETED: {
            const {trackId} = payload;
            
            return {...state, tracksTimeframes: state.tracksTimeframes.filter(tt => tt.id !== trackId)};
        }
        default:
            return state;
    }
};

export default trackTimeframesListReducer;
