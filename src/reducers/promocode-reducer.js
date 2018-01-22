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
    RECEIVE_PROMOCODE,
    RESET_PROMOCODE_FORM,
    UPDATE_PROMOCODE,
    PROMOCODE_UPDATED
} from '../actions/promocode-actions';

import { LOGOUT_USER } from '../actions/auth-actions';
import { VALIDATE } from '../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0,
    member: null,
    speaker: null,
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const promocodeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_PROMOCODE_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_PROMOCODE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_PROMOCODE: {
            let entity = {...payload.response};

            return {...state };
        }
        break;
        case PROMOCODE_UPDATED: {
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

export default promocodeReducer;
