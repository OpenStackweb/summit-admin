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
    REQUEST_COMPANIES,
    RECEIVE_COMPANIES,
    COMPANY_DELETED
} from '../../actions/company-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    companies        : {},
    term            : null,
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalCompanies   : 0
};

const companyListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_COMPANIES: {
            let {order, orderDir, term, page} = payload;
            return {...state, order, orderDir, term, currentPage: page};
        }
        case RECEIVE_COMPANIES: {
            let {current_page, total, last_page} = payload.response;
            let companies = payload.response.data.map(c => ({
                ...c
            }));

            return {...state, companies: companies, currentPage: current_page, totalCompanies: total, lastPage: last_page };
        }
        case COMPANY_DELETED: {
            let {companyId} = payload;
            return {...state, companies: state.companies.filter(s => s.id !== companyId)};
        }
        default:
            return state;
    }
};

export default companyListReducer;
