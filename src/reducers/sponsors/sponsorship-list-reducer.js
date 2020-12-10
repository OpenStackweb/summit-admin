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
    RECEIVE_SPONSORSHIPS,
    REQUEST_SPONSORSHIPS,
    SPONSORSHIP_DELETED,
} from '../../actions/sponsor-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    sponsorships            : [],
    order               : 'name',
    orderDir            : 1,
    totalSponsorships       : 0
};

const sponsorshipListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_SPONSORSHIPS: {
            let {order, orderDir} = payload;

            return {...state, order, orderDir }
        }
        break;
        case RECEIVE_SPONSORSHIPS: {
            let { total } = payload.response;
            let sponsorships = payload.response.data;

            return {...state, sponsorships: sponsorships, totalSponsorships: total };
        }
        break;
        case SPONSORSHIP_DELETED: {
            let {sponsorshipId} = payload;
            return {...state, sponsorships: state.sponsorships.filter(t => t.id !== sponsorshipId)};
        }
        break;
        default:
            return state;
    }
};

export default sponsorshipListReducer;
