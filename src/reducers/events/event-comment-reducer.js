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
    RECEIVE_EVENT_COMMENT,
    RESET_EVENT_COMMENT_FORM,
    EVENT_COMMENT_UPDATED,
    UPDATE_EVENT_COMMENT,
} from '../../actions/event-comment-actions';

import { VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id                          : 0,
    creator                     : null,
    body                        : '',
    is_activity                 : false,
    is_public                   : false,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const eventCommentReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_EVENT_COMMENT_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case EVENT_COMMENT_UPDATED: {
            let entity = {...payload.response};

            entity = {
                ...entity,
                owner_full_name: `${entity.creator.first_name} ${entity.creator.last_name}`,
            };

            return {...state,  entity: entity, errors: {} };
        }
        break;
        case RECEIVE_EVENT_COMMENT: {
            console.log('recieve paytload', payload);
            let entity = payload.response;

            entity = {
                ...entity,
                owner_full_name: `${entity.creator.first_name} ${entity.creator.last_name}`,
            }
        
            return {...state, entity: {...DEFAULT_ENTITY, ...entity} };
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

export default eventCommentReducer;
