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

import
{
    RECEIVE_SPONSOR,
    RESET_SPONSOR_FORM,
    UPDATE_SPONSOR,
    SPONSOR_UPDATED,
    SPONSOR_ADDED,
    MEMBER_ADDED_TO_SPONSOR,
    MEMBER_REMOVED_FROM_SPONSOR
} from '../../actions/sponsor-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    id              : 0,
    company         : null,
    sponsorship_id  : null,
    members         : [],
    order           : 0,
    is_published    : false,
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const sponsorReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SPONSOR_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        break;
        case UPDATE_SPONSOR: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case SPONSOR_ADDED:
        case RECEIVE_SPONSOR: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...state.entity, ...entity} };
        }
        break;
        case SPONSOR_UPDATED: {
            return state;
        }
        break;
        case MEMBER_ADDED_TO_SPONSOR: {
            let {member} = payload;
            return {...state, entity: {...state.entity, members: [...state.entity.members, member] } };
        }
        break;
        case MEMBER_REMOVED_FROM_SPONSOR: {
            let {memberId} = payload;
            let currentMembers = state.entity.members.filter(m => m.id !== memberId);
            return {...state, entity: {...state.entity, members: currentMembers } };
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

export default sponsorReducer;
