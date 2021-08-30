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
    RECEIVE_COMPANY,
    RESET_COMPANY_FORM,
    UPDATE_COMPANY,
    COMPANY_UPDATED,
    COMPANY_ADDED,
    LOGO_ATTACHED,
    BIG_LOGO_ATTACHED
} from '../../actions/company-actions';
import {
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED
} from "../../actions/sponsored-project-actions";

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';

export const DEFAULT_ENTITY = {
    id: 0,
    name: '',
    description: '',
    overview: '',
    url: '',
    display_on_site: false,
    featured: false,
    city: '',
    state: '',
    country: '',
    industry: '',
    products: '',
    contributions: '',
    contact_email: '',
    member_level: 'None',
    admin_email: '',
    commitment: '',
    commitment_author: '',
    logo: '',
    big_logo: '',
    color: '#DADADA',
    project_sponsorships: [],
};

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {},
    sponsored_projects:[],
};

const companyReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in ce the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        break;
        case RESET_COMPANY_FORM: {
            return DEFAULT_STATE;
        }
        break;
        case UPDATE_COMPANY: {
            return {...state,  entity: {...payload}, errors: {} };
        }
        break;
        case COMPANY_ADDED:
        case RECEIVE_COMPANY: {
            let entity = {...payload.response};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors: {} };
        }
        break;
        case LOGO_ATTACHED: {
            let logo = state.entity.logo + '?' + new Date().getTime();
            return {...state, entity: {...state.entity, logo: logo} };
        }
        case BIG_LOGO_ATTACHED: {
            let logo = state.entity.big_logo + '?' + new Date().getTime();
            return {...state, entity: {...state.entity, big_logo: logo} };
        }
        case COMPANY_UPDATED: {
            return state;
        }
        break;
        case VALIDATE: {
            return {...state,  errors: payload.errors };
        }
        break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED:{
            let {project_sponsorships} = state.entity;
            let f = project_sponsorships.find((ps) => {
                let e = ps.supporting_companies.find((sp) => sp.id == payload.supportingCompanyId)
                return e;
            })
            project_sponsorships = project_sponsorships.filter(e=> e.id != f.id)
            return {...state, entity: {...state.entity, project_sponsorships: project_sponsorships} };
        }
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED:{
            let entity = {...payload.response};
            let {project_sponsorships} = entity.company;
            return {...state, entity: {...state.entity, project_sponsorships: project_sponsorships} }
        }
        default:
            return state;
    }
};

export default companyReducer;
