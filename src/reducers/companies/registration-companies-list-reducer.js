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

import {
    REQUEST_REGISTRATION_COMPANIES,
    RECEIVE_REGISTRATION_COMPANIES,
    REGISTRATION_COMPANY_ADDED,
    REGISTRATION_COMPANY_DELETED
} from '../../actions/registration-companies-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";

const DEFAULT_STATE = {
    companies: [],
    term: null,
    order: 'id',
    orderDir: 1,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    totalCompanies: 0
};

const registrationCompanyListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_REGISTRATION_COMPANIES: {
            let { order, orderDir, term, page } = payload;
            return { ...state, order, orderDir, term, currentPage: page };
        }
        case RECEIVE_REGISTRATION_COMPANIES: {
            let { current_page, total, last_page } = payload.response;
            let companies = payload.response.data.map(c => ({
                ...c
            }));

            return { ...state, companies: companies, currentPage: current_page, totalCompanies: total, lastPage: last_page };
        }
        case REGISTRATION_COMPANY_ADDED: {
            return { ...state, companies: [...state.companies, payload.entity] }
        }
        case REGISTRATION_COMPANY_DELETED: {
            let { companyId } = payload;
            return { ...state, companies: state.companies.filter(s => s.id !== companyId) };
        }
        default:
            return state;
    }
};

export default registrationCompanyListReducer;
