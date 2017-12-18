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
    RECEIVE_SPEAKER,
    RESET_SPEAKER_FORM,
    UPDATE_SPEAKER,
    SPEAKER_UPDATED,
    SPEAKER_VALIDATION
} from '../actions/speaker-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { SET_CURRENT_SUMMIT } from '../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    title: '',
    first_name: '',
    last_name: '',
    member_id: 0,
    email: '',
    twitter: '',
    irc: '',
    bio: '',
    pic: '',
    presentations: [],
    registration_code: {},
    summit_assistance: {}
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const speakerReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case SET_CURRENT_SUMMIT:
        case RESET_SPEAKER_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_SPEAKER: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_SPEAKER: {
            let entity = payload.response;

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }
            return {...state, entity: {...state.entity, ...entity}, errors: {} };
        }
        break;
        case SPEAKER_UPDATED: {
            return state;
        }
        break;
        case SPEAKER_VALIDATION: {
            return {...state,  errors: payload.errors };
        }
        break;
        default:
            return state;
    }
};

export default speakerReducer;
