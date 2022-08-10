/**
 * Copyright 2022 OpenStack Foundation
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
    RECEIVE_RATING_TYPE,
    RESET_RATING_TYPE_FORM,
    RECEIVE_SCORE_TYPES,
    RATING_TYPE_SCORE_TYPE_REMOVED,
    RATING_TYPE_SCORE_TYPE_ADDED,
    RATING_TYPE_SCORE_TYPE_ORDER_UPDATED
} from '../../actions/ranking-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id          : 0,
    name        : '',
    weight      : 0.0,
    order       : 1,
    score_types : []
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
};

const ratingTypeReducer = (state = DEFAULT_STATE, action) => {
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
        case SET_CURRENT_SUMMIT:
        case RESET_RATING_TYPE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        case RECEIVE_RATING_TYPE: {
            const entity = {...payload.response};
            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }
            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        case RECEIVE_SCORE_TYPES: {
            const entity = {...payload.response};
            return {...state, entity: {...state.entity, score_types: [...entity.data]} };
        }
        case RATING_TYPE_SCORE_TYPE_REMOVED: {
            const {scoreTypeId} = payload;
            const scoreTypes = state.entity.score_types.filter(t => t.id !== scoreTypeId);
            return {...state, entity: {...state.entity, score_types: scoreTypes} };
        }
        case RATING_TYPE_SCORE_TYPE_ADDED: {
            const scoreType = {...payload.scoreType};
            return {...state, entity: {...state.entity, score_types: [...state.entity.score_types, scoreType]} };
        }
        case RATING_TYPE_SCORE_TYPE_ORDER_UPDATED: {
            const score_types = payload.map(s => {
                return {
                    id: s.id,
                    name: s.name,
                    score: parseInt(s.score),
                    description: s.description
                };
            })
            return {...state, entity: {...state.entity, score_types : score_types}}
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }
};

export default ratingTypeReducer;
