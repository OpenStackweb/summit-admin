/**
 * Copyright 2017 OpenStack Foundation
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
    RECEIVE_SUMMITDOC,
    RESET_SUMMITDOC_FORM,
    UPDATE_SUMMITDOC,
    SUMMITDOC_ADDED,
    SUMMITDOC_FILE_ADDED,
    SUMMITDOC_FILE_DELETED
} from '../../actions/summitdoc-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                  : 0,
    name                : '',
    label               : '',
    description         : '',
    event_types         : [],
    file_preview        : '',
    selection_plan_id   : null,
    show_always         : false,
    web_link            : null
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const summitDocReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SUMMITDOC_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_SUMMITDOC: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case SUMMITDOC_ADDED:
        case RECEIVE_SUMMITDOC: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case SUMMITDOC_FILE_ADDED: {
            let entity = {...payload.response};

            return {...state, entity: {...entity} };
        }
        case SUMMITDOC_FILE_DELETED: {
            return {...state, entity: {...state.entity, file_preview: '', file: null} };
        }
        default:
            return state;
    }
};

export default summitDocReducer;
