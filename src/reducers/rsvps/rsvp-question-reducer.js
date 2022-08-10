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
    RSVP_QUESTION_ADDED,
    RECEIVE_RSVP_QUESTION_META,
    RSVP_QUESTION_VALUE_DELETED,
    QUESTION_VALUE_ORDER_UPDATED,
    RSVP_QUESTION_VALUE_ADDED,
    RSVP_QUESTION_VALUE_UPDATED
} from '../../actions/rsvp-template-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    label               : '',
    order               : 0,
    class_name          : '',
    is_mandatory        : false,
    is_read_only        : false,
    is_multiselect     : false,
    use_chosen_plugin   : false,
    is_country_selector : false,
    content             : '',
    empty_string        : '',
    default_value_id    : 0,
    initial_value       : '',
    values              : []
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
        case RSVP_QUESTION_ADDED:
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
        case QUESTION_VALUE_ORDER_UPDATED: {
            let values = [...payload];
            return {...state, entity: {...state.entity, values: values}}
            }
        break;
        case RSVP_QUESTION_VALUE_ADDED: {
            let entity = {...payload.response};
            let values = [...state.entity.values, entity];

            return {...state, entity: { ...state.entity, values: values}};
        }
        break;
        case RSVP_QUESTION_VALUE_UPDATED: {
            let entity = {...payload.response};
            let values_tmp = state.entity.values.filter(v => v.id !== entity.id);
            let values = [...values_tmp, entity];

            values.sort((a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0)));

            return {...state, entity: { ...state.entity, values: values}};
        }
        break;
        case RSVP_QUESTION_VALUE_DELETED: {
            let {rsvpQuestionValueId} = payload;
            return {...state, entity: {...state.entity, values: state.entity.values.filter(v => v.id !== rsvpQuestionValueId)}};
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
