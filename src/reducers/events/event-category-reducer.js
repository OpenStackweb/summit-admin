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
    RECEIVE_EVENT_CATEGORY,
    RESET_EVENT_CATEGORY_FORM,
    EVENT_CATEGORY_ADDED,
    UPDATE_EVENT_CATEGORY,
    EVENT_CATEGORY_QUESTION_DELETED,
    EVENT_CATEGORY_QUESTION_ADDED,
    EVENT_CATEGORY_QUESTION_ASSIGNED
} from '../../actions/event-category-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                          : 0,
    name                        : '',
    code                        : '',
    color                       : '#DADADA',
    description                 : '',
    session_count               : 0,
    alternate_count             : 0,
    lightning_count             : 0,
    lightning_alternate_count   : 0,
    voting_visible              : false,
    chair_visible               : false,
    allowed_tags                : [],
    track_groups                : [],
    extra_questions             : []
};

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    allClasses  : [],
    errors      : {}
};

const eventCategoryReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_EVENT_CATEGORY_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_EVENT_CATEGORY: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case EVENT_CATEGORY_ADDED:
        case RECEIVE_EVENT_CATEGORY: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, errors: {}, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case EVENT_CATEGORY_QUESTION_DELETED: {
            let {questionId} = payload;
            let extra_questions = state.entity.extra_questions.filter(eq => eq.id != questionId);

            return {...state, entity: { ...state.entity, extra_questions: extra_questions}};
        }
        break;
        case EVENT_CATEGORY_QUESTION_ADDED: {
            let entity = {...payload.response};
            let extra_questions = [...state.entity.extra_questions, entity];

            return {...state, entity: { ...state.entity, extra_questions: extra_questions}};
        }
        break;
        case EVENT_CATEGORY_QUESTION_ASSIGNED: {
            let entity = {...payload};
            let extra_questions = [...state.entity.extra_questions, entity];

            return {...state, entity: { ...state.entity, extra_questions: extra_questions}};
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

export default eventCategoryReducer;
