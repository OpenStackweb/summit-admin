/**
 * Copyright 2019 OpenStack Foundation
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
import React from "react";
import {RawHTML} from "openstack-uicore-foundation/lib/components";

import
{
    RECEIVE_ORDER_EXTRA_QUESTIONS,
    REQUEST_ORDER_EXTRA_QUESTIONS,
    ORDER_EXTRA_QUESTION_DELETED,
    ORDER_EXTRA_QUESTION_ORDER_UPDATED
} from '../../actions/order-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    orderExtraQuestions         : [],
    order                       : 'order',
    orderDir                    : 1,
    totalOrderExtraQuestions    : 0
};

const orderExtraQuestionListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_ORDER_EXTRA_QUESTIONS: {
            const {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_ORDER_EXTRA_QUESTIONS: {
            const { total } = payload.response;

            return {...state, orderExtraQuestions: payload.response.data, totalOrderExtraQuestions: total };
        }
        break;
        case ORDER_EXTRA_QUESTION_ORDER_UPDATED: {
            const questions = payload.map(q => {

                return {
                    id: q.id,
                    name: q.name,
                    label: q.label,
                    type: q.type,
                    order: parseInt(q.order)
                };
            });

            return {...state, orderExtraQuestions: questions };
        }
        break;
        case ORDER_EXTRA_QUESTION_DELETED: {
            const {orderExtraQuestionId} = payload;
            return {...state, orderExtraQuestions: state.orderExtraQuestions.filter(t => t.id !== orderExtraQuestionId)};
        }
        break;
        default:
            return state;
    }
};

export default orderExtraQuestionListReducer;
