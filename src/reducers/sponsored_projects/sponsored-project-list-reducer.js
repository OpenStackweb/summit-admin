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
    REQUEST_SPONSORED_PROJECTS,
    RECEIVE_SPONSORED_PROJECTS,
    SPONSORED_PROJECT_DELETED
} from '../../actions/sponsored-project-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    sponsoredProjects : [],
    term            : '',
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalSponsoredProjects   : 0
};

const sponsoredProjectListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return state;
        }
        break;
        case REQUEST_SPONSORED_PROJECTS: {
            let {order, orderDir, term, page} = payload;
            return {...state, order, orderDir, term, currentPage: page};
        }
        break;
        case RECEIVE_SPONSORED_PROJECTS: {
            let {current_page, total, last_page} = payload.response;
            let sponsoredProjects = payload.response.data.map(c => ({
                ...c
            }));

            return {...state,
                sponsoredProjects: sponsoredProjects,
                currentPage: current_page,
                totalSponsoredProjects: total, lastPage: last_page };
        }
        break;
        case SPONSORED_PROJECT_DELETED: {
            let {sponsoredProjectId} = payload;
            return {...state, sponsoredProjects: state.sponsoredProjects.filter(s => s.id !== sponsoredProjectId)};
        }
        break;
        default:
            return state;
    }
};

export default sponsoredProjectListReducer;
