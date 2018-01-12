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
    RECEIVE_ATTENDEE,
    RESET_ATTENDEE_FORM,
    UPDATE_ATTENDEE,
    ATTENDEE_UPDATED
} from '../actions/attendee-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { VALIDATE } from '../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    member: null,
    affiliation: {title: '', company: {}, start_date: '', end_date: '', current: 0},
    shared_contact_info: 0,
    summit_hall_checked_in: 0,
    summit_hall_checked_in_date: '',
    tickets: {}
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const attendeeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_ATTENDEE_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_ATTENDEE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_ATTENDEE: {
            let entity = {...payload.response};

            return state;
        }
        break;
        case ATTENDEE_UPDATED: {
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

export default attendeeReducer;
