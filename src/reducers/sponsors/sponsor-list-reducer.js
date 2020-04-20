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
    RECEIVE_SPONSORS,
    REQUEST_SPONSORS,
    SPONSOR_DELETED,
} from '../../actions/sponsor-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

const DEFAULT_STATE = {
    sponsors            : [],
    order               : 'order',
    orderDir            : 1,
    totalSponsors       : 0
};

const sponsorListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_SPONSORS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        break;
        case RECEIVE_SPONSORS: {
            let { total } = payload.response;
            let sponsors = payload.response.data;

            sponsors = sponsors.map(s => ({...s, sponsorship_name: s.sponsorship.name, company_name: s.company.name}));

            return {...state, sponsors: sponsors, totalSponsors: total };
        }
        break;
        case SPONSOR_DELETED: {
            let {sponsorId} = payload;
            return {...state, sponsors: state.sponsors.filter(t => t.id != sponsorId)};
        }
        break;
        default:
            return state;
    }
};

export default sponsorListReducer;
