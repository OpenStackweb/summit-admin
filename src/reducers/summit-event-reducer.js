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
    RECEIVE_TRACKS,
    RECEIVE_VENUES,
    RECEIVE_EVENT_TYPES,
} from '../actions';

const DEFAULT_STATE = {
    track_options:  [],
    type_options: [],
    location_options:[],
    level_options:['N/A', 'Beginner', 'Intermediate', 'Advanced' ],
};

const summitEventReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case RECEIVE_TRACKS:
            return {...state,  track_options: payload.response.data };
        case RECEIVE_VENUES:
            return {...state,  location_options: payload.response.data };
        case RECEIVE_EVENT_TYPES:
            return {...state,  type_options: payload.response.data };
        default:
            return state;
    }
};

export default summitEventReducer;
