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

import {
    RECEIVE_SPONSOR_MATERIAL,
    SPONSOR_MATERIAL_UPDATED,
    RESET_SPONSOR_MATERIAL_FORM,
    SPONSOR_MATERIAL_ADDED,
    UPDATE_SPONSOR_MATERIAL
} from '../../actions/sponsor-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id: 0, 
    link: '',
    name: '',
    type: '',
    order: 0,
}

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const sponsorMaterialReducer = (state = DEFAULT_STATE, action) => {
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
            break;
        case SET_CURRENT_SUMMIT:
        case RESET_SPONSOR_MATERIAL_FORM: {
            return { ...state, entity: { ...DEFAULT_ENTITY }, errors: {} };
        }
            break;
        case UPDATE_SPONSOR_MATERIAL: {
            return { ...state, entity: { ...payload }, errors: {} };
        }
            break;
        case SPONSOR_MATERIAL_ADDED:
        case RECEIVE_SPONSOR_MATERIAL: {
            let entity = { ...payload.response };

            for (var key in entity) {
                if (entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key];
                }
            }

            return { ...state, entity: { ...state.entity, ...entity } };
        }
            break;
        case SPONSOR_MATERIAL_UPDATED: {
            return state;
        }
            break;
        case VALIDATE: {
            return { ...state, errors: payload.errors };
        }
            break;
        default:
            return state;
    }
};

export default sponsorMaterialReducer;
