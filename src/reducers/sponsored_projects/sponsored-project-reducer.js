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
    RECEIVE_SPONSORED_PROJECT,
    RESET_SPONSORED_PROJECT_FORM,
    UPDATE_SPONSORED_PROJECT,
    SPONSORED_PROJECT_UPDATED,
    SPONSORED_PROJECT_ADDED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_UPDATED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_DELETED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_ORDER_UPDATED,
} from '../../actions/sponsored-project-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    description: '',
    slug: '',
    is_active: false,
    sponsorship_types: [],
};

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const sponsoredProjectReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SPONSORED_PROJECT_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_SPONSORED_PROJECT: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case SPONSORED_PROJECT_ADDED:
        case RECEIVE_SPONSORED_PROJECT: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors: {} };
        }
        break;
        case SPONSORED_PROJECT_UPDATED: {
            return state;
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED: {
            let entity = {...payload.response};
            let sponsorship_types = [...state.entity.sponsorship_types, entity];
            return {...state, entity: { ...state.entity, sponsorship_types: sponsorship_types}};
        }
        break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_ORDER_UPDATED: {
            let sponsorship_types = payload.map(q => {

                return {
                    id: q.id,
                    name: q.name,
                    order: parseInt(q.order)
                };
            })

            return {...state, sponsorship_types: sponsorship_types };
        }
        break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_UPDATED: {
            let entity = {...payload.response};
            let sponsorship_types_tmp = state.entity.sponsorship_types.filter(q => q.id !== entity.id);
            let sponsorship_types = [...sponsorship_types_tmp, entity];

            sponsorship_types.sort((a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0)));

            return {...state, entity: { ...state.entity, sponsorship_types: sponsorship_types}};
        }
            break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_DELETED: {
            let {sponsorshipTypeId} = payload;
            return {...state, entity: {...state.entity, sponsorship_types: state.entity.sponsorship_types.filter(q => q.id !== sponsorshipTypeId)}};
        }
            break;
        default:
            return state;
    }
};

export default sponsoredProjectReducer;
