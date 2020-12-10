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
    RECEIVE_EVENT_CATEGORY_QUESTION,
    RESET_EVENT_CATEGORY_QUESTION_FORM,
    UPDATE_EVENT_CATEGORY_QUESTION,
    RECEIVE_EVENT_CATEGORY_QUESTION_META,
    UPDATE_EVENT_CATEGORY_QUESTION_VALUE,
    EVENT_CATEGORY_QUESTION_VALUE_ADDED,
    EVENT_CATEGORY_QUESTION_VALUE_UPDATED,
    EVENT_CATEGORY_QUESTION_VALUE_DELETED
} from '../../actions/event-category-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                              : 0,
    class_name                      : '',
    name                            : '',
    label                           : '',
    content                         : '',
    empty_string                    : '',
    initial_value                   : '',
    is_mandatory                    : 0,
    is_read_only                    : 0,
    is_country_selector             : 0,
    is_multi_select                 : 0,
    default_value_id                : 0,
    values                          : []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    allClasses  : [],
    errors      : {}
};

const eventCategoryQuestionReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_EVENT_CATEGORY_QUESTION_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case RECEIVE_EVENT_CATEGORY_QUESTION_META: {
            let allClasses = [...payload.response];

            return {...state, allClasses: allClasses }
        }
        break;
        case UPDATE_EVENT_CATEGORY_QUESTION: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case UPDATE_EVENT_CATEGORY_QUESTION_VALUE: {
            return {...state, entity: {...state.entity, values: [...state.entity.values, payload]}, errors: {} };
        }
        break;
        case RECEIVE_EVENT_CATEGORY_QUESTION: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case EVENT_CATEGORY_QUESTION_VALUE_UPDATED: {
            let newValue = {...payload.response};
            let oldValues = state.entity.values.filter(v => v.id !== newValue.id);
            let values = [...oldValues, newValue];

            return {...state, entity: {...state.entity, values: values}, errors: {} };
        }
        break;
        case EVENT_CATEGORY_QUESTION_VALUE_ADDED: {
            let newValue = {...payload.response};
            let values = [...state.entity.values, newValue];

            return {...state, entity: {...state.entity, values: values}, errors: {} };
        }
        break;
        case EVENT_CATEGORY_QUESTION_VALUE_DELETED: {
            let {valueId} = payload;
            let values = state.entity.values.filter(v => v.id !== valueId);

            return {...state, entity: {...state.entity, values: values}};
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

export default eventCategoryQuestionReducer;
