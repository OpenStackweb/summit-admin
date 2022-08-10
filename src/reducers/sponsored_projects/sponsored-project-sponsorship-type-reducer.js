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
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED,
    UPDATE_PROJECT_SPONSORSHIP_TYPE,
    RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_FORM,
    RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE,
    SPONSORED_PROJECT_UPDATED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ORDER_UPDATED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED
} from '../../actions/sponsored-project-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/utils/actions';

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    description: '',
    slug: '',
    is_active: false,
    supporting_companies: [],
};

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const sponsoredProjectSponsorshipTypeReducer = (state = DEFAULT_STATE, action) => {
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
        case RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_FORM: {
            return DEFAULT_STATE;
        }
            break;
        case UPDATE_PROJECT_SPONSORSHIP_TYPE: {
            return {...state,  entity: {...payload}, errors: {} };
        }
            break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED:
        case RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            entity.supporting_companies = entity.supporting_companies.map((c) => {
                return {...c, company_name: c.company.name};
            })

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
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED:{
            let {supportingCompanyId} = payload;
            return {...state, entity: {...state.entity, supporting_companies: state.entity.supporting_companies.filter(q => q.id !== supportingCompanyId)}};
        }
        break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ORDER_UPDATED:{
            let supporting_companies = payload.map(q => {

                return {
                    id: q.id,
                    company_name: q.company.name,
                    order: parseInt(q.order)
                };
            })

            return {...state, supporting_companies: supporting_companies };
        }
        break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED:{
            let entity = {...payload.response};
            entity.company_name = entity.company.name;
            let supporting_companies = [...state.entity.supporting_companies, entity];
            return {...state, entity: { ...state.entity, supporting_companies: supporting_companies}};
        }
        break;
        default:
            return state;
    }
};

export default sponsoredProjectSponsorshipTypeReducer;
