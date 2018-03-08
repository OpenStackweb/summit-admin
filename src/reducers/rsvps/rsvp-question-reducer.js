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
    RECEIVE_RSVP_QUESTION,
    RESET_RSVP_QUESTION_FORM,
    UPDATE_RSVP_QUESTION,
    RSVP_QUESTION_UPDATED,
    RECEIVE_RSVP_QUESTION_META
} from '../../actions/rsvp-template-actions';

import { LOGOUT_USER } from '../../actions/auth-actions';
import { VALIDATE } from '../../actions/base-actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id              : 0,
    name            : '',
    label           : '',
    class_name      : '',
    is_mandatory    : false,
    read_only       : false,
    values          : [],
    default_value   : ''
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    allClasses  : [],
    errors      : {},
};

const rsvpQuestionReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_RSVP_QUESTION_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_RSVP_QUESTION_META: {
            let allClasses = [...payload.response];

            return {...state, allClasses: allClasses }
        }
        break;
        case UPDATE_RSVP_QUESTION: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RECEIVE_RSVP_QUESTION: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case RSVP_QUESTION_UPDATED: {
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

export default rsvpQuestionReducer;