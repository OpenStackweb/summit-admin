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

import {
    RESET_ORDER_EXTRA_QUESTION_SUB_QUESTION_FORM,
    UPDATE_ORDER_EXTRA_QUESTION_SUB_QUESTION,
    RECEIVE_ORDER_EXTRA_QUESTION_SUB_QUESTION,
    ORDER_EXTRA_QUESTION_SUB_QUESTION_ADDED
} from '../../actions/order-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';

export const DEFAULT_ENTITY = {
    id: 0,
    visibility: 'Visible',
    visibility_condition: "Equal",
    answer_values: [],
    answer_values_operator: 'And',
    sub_question_id: null
}

const DEFAULT_STATE = {
    entity: { ...DEFAULT_ENTITY},
    errors: {},
};

const orderExtraQuestionRuleReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return { ...state, entity: { ...DEFAULT_ENTITY }, errors: {} };
            }
        }
        case RESET_ORDER_EXTRA_QUESTION_SUB_QUESTION_FORM: {
            return { ...state, entity: { ...DEFAULT_ENTITY }, errors: {} };
        }
        case UPDATE_ORDER_EXTRA_QUESTION_SUB_QUESTION: {
            return { ...state, entity: { ...payload }, errors: {} };
        }
        case RECEIVE_ORDER_EXTRA_QUESTION_SUB_QUESTION: {
            let entity = { ...payload.response };

            for (var key in entity) {
                if (entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key];
                }
            }

            return { ...state, entity: { ...DEFAULT_ENTITY, ...entity } };
        }
        case ORDER_EXTRA_QUESTION_SUB_QUESTION_ADDED: {
            return { ...state, entity: { ...DEFAULT_ENTITY }, errors: {} };
        }
        case VALIDATE: {
            return { ...state, errors: payload.errors };
        }
        default:
            return state;
    }
};

export default orderExtraQuestionRuleReducer;
