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
    RECEIVE_SCORE_TYPE,
    RESET_SCORE_TYPE_FORM,
    SCORE_TYPE_UPDATED,
} from '../../actions/ranking-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id          : 0,
    name        : '',
    score       : 0,
    description : '',
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {},
};

const scoreTypeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SCORE_TYPE_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        case RECEIVE_SCORE_TYPE: {
            const entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }
            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        case SCORE_TYPE_UPDATED: {
            const entity = {...payload.response};
            return {...state,  entity: {...entity}, errors: {} };
        }
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        default:
            return state;
    }
};

export default scoreTypeReducer;
