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

import { RECEIVE_SELECTED_EVENTS, UPDATE_LOCAL_EVENT, UPDATED_REMOTE_EVENTS } from '../actions/summit-event-bulk-actions';

const DEFAULT_STATE = {
    selectedEvents: []
}

const summitEventBulkActionReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch(type){
        case RECEIVE_SELECTED_EVENTS:
            let { data } = payload.response;
            return {...state,
                selectedEvents: data.map((event) => ({ ...event, is_valid: true}))
            };
            break;
        case UPDATE_LOCAL_EVENT:
            let { eventId, mutator } = payload;
            let { selectedEvents } = state;
            selectedEvents = selectedEvents.map(event => {
                return event.id == eventId ? mutator(event) : event
            });
            return { ... state, selectedEvents}
            break;
        case UPDATED_REMOTE_EVENTS:
        default:
            return state;
            break;
    }
}

export default summitEventBulkActionReducer