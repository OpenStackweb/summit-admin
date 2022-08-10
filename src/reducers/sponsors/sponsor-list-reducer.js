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
    SPONSOR_ORDER_UPDATED
} from '../../actions/sponsor-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    sponsors            : [],
    order               : 'order',
    orderDir            : 1,
    totalSponsors       : 0
};

const sponsorListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_SPONSORS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_SPONSORS: {
            let { total } = payload.response;
            let sponsors = payload.response.data;

            sponsors = sponsors.map(s => {
                let sponsorship_name = (s.sponsorship) ? s.sponsorship.name : '';
                let company_name = (s.company) ? s.company.name : '';

                return ({...s, sponsorship_name: sponsorship_name, company_name: company_name});
            });

            return {...state, sponsors: sponsors, totalSponsors: total };
        }
        case SPONSOR_ORDER_UPDATED: {
            let sponsors = payload.map(s => {
                let sponsorship_name = (s.sponsorship) ? s.sponsorship.name : '';
                let company_name = (s.company) ? s.company.name : '';

                return ({...s, sponsorship_name: sponsorship_name, company_name: company_name});
            });

            return {...state, sponsors: sponsors };
        }
        case SPONSOR_DELETED: {
            let {sponsorId} = payload;
            return {...state, sponsors: state.sponsors.filter(t => t.id !== sponsorId)};
        }
        default:
            return state;
    }
};

export default sponsorListReducer;
