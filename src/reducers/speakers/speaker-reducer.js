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
    SPEAKER_ADDED,
    PIC_ATTACHED
} from '../../actions/speaker-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { VALIDATE } from '../../actions/base-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    title: '',
    first_name: '',
    last_name: '',
    member: {},
    email: '',
    twitter: '',
    irc: '',
    bio: '',
    pic: '',
    all_presentations: [],
    registration_codes: [],
    summit_assistances: []
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const speakerReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SPEAKER_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_SPEAKER: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case SPEAKER_ADDED:
        case RECEIVE_SPEAKER: {
            let entity = {...payload.response};
            let registration_code = '', on_site_phone = '', registered = false, checked_in = false, confirmed = false;

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            if (entity.hasOwnProperty('registration_code')) {
                entity.registration_code = entity.registration_code.code;
                entity.code_redeemed = entity.registration_code.redeemed;
            }

            if (entity.hasOwnProperty('summit_assistance')) {
                entity.on_site_phone = entity.summit_assistance.on_site_phone;
                entity.registered = entity.summit_assistance.registered;
                entity.checked_in = entity.summit_assistance.checked_in;
                entity.confirmed = entity.summit_assistance.confirmed;
            }

            return {...state, entity: {...state.entity, ...entity}, errors: {} };
        }
        break;
        case PIC_ATTACHED: {
            let pic = state.entity.pic + '?' + new Date().getTime();
            return {...state, entity: {...state.entity, pic: pic} };;
        }
        case SPEAKER_UPDATED: {
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

export default speakerReducer;
