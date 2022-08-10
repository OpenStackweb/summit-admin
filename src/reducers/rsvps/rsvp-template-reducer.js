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
    RECEIVE_RSVP_TEMPLATE,
    RSVP_TEMPLATE_ADDED,
    RESET_RSVP_TEMPLATE_FORM,
    UPDATE_RSVP_TEMPLATE,
    RSVP_TEMPLATE_UPDATED,
    QUESTION_ORDER_UPDATED,
    RSVP_QUESTION_DELETED,
    RSVP_QUESTION_ADDED,
    RSVP_QUESTION_UPDATED
} from '../../actions/rsvp-template-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id              : 0,
    title           : '',
    is_enabled      : false,
    questions       : []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
};

const rsvpTemplateReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_RSVP_TEMPLATE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_RSVP_TEMPLATE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case RSVP_TEMPLATE_ADDED:
        case RECEIVE_RSVP_TEMPLATE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case RSVP_TEMPLATE_UPDATED: {
            return state;
        }
        break;
        case QUESTION_ORDER_UPDATED: {
            let questions = payload.map(q => {

                return {
                    id: q.id,
                    name: q.name,
                    class_name: q.class_name,
                    order: parseInt(q.order)
                };
            })

            return {...state, questions: questions };
        }
        break;
        case RSVP_QUESTION_ADDED: {
            let entity = {...payload.response};
            let questions = [...state.entity.questions, entity];

            return {...state, entity: { ...state.entity, questions: questions}};
        }
        break;
        case RSVP_QUESTION_UPDATED: {
            let entity = {...payload.response};
            let questions_tmp = state.entity.questions.filter(q => q.id !== entity.id);
            let questions = [...questions_tmp, entity];

            questions.sort((a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0)));

            return {...state, entity: { ...state.entity, questions: questions}};
        }
        break;
        case RSVP_QUESTION_DELETED: {
            let {rsvpQuestionId} = payload;
            return {...state, entity: {...state.entity, questions: state.entity.questions.filter(q => q.id !== rsvpQuestionId)}};
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

export default rsvpTemplateReducer;
