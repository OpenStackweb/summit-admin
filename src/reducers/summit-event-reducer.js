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
    RECEIVE_EVENT,
    EVENT_UPDATED,
    EVENT_ADDED,
    EVENT_DELETED
} from '../actions/actions';

const default_entity = {
    id: 0,
    title: '',
    description: '',
    social_description: '',
    attendees_expected_learnt: '',
    head_count: 0,
    rsvp_link: '',
    location_id: 0,
    start_date: '',
    end_date: '',
    type_id: 0,
    track_id: 0,
    level: 'N/A',
    allow_feedback: 0,
    to_record: 0,
    feature_cloud: 0,
    tags: [],
    sponsors: [],
    speakers: [],
    moderator_speaker_id: 0,
    discussion_leader: 0,
    groups: [],
    files: []
}

const DEFAULT_STATE = {
    track_options:  [],
    type_options: [],
    location_options: [],
    level_options: ['N/A', 'Beginner', 'Intermediate', 'Advanced' ],
    entity: default_entity
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
        case RECEIVE_EVENT:
            let entity = payload.response;
            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }
            return {...state,  entity: entity };
        default:
            return state;
    }
};

export default summitEventReducer;
