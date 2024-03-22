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

import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods'
import
{
    RECEIVE_BADGE_SCANS,
    RECEIVE_SPONSORS,
    REQUEST_BADGE_SCANS
} from '../../actions/sponsor-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    badgeScans      : [],
    sponsorId       : null,
    order           : 'attendee_last_name',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalBadgeScans : 0,
    allSponsors     : [],
    summitTZ        : '',
};

const badgeScansListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_BADGE_SCANS: {
            let {order, orderDir, sponsorId, summitTZ} = payload;
            return {...state, order, orderDir, sponsorId, summitTZ };
        }
        case RECEIVE_BADGE_SCANS: {
            let {current_page, total, last_page} = payload.response;
            let badgeScans = payload.response.data.map(s => {
                let scanDate = s.scan_date ? epochToMomentTimeZone(s.scan_date, state.summitTZ).format('MMMM Do YYYY, h:mm:ss a') :
                    epochToMomentTimeZone(s.created, state.summitTZ).format('MMMM Do YYYY, h:mm:ss a') ;
                let firstName = '';
                let lastName = '';
                let company = '';
                let email = '';

                if (s.hasOwnProperty("badge") && s.badge.ticket && s.badge.ticket.owner) {
                    firstName = s.badge.ticket.owner.member ? s.badge.ticket.owner.member.first_name : s.badge.ticket.owner.first_name;
                    lastName = s.badge.ticket.owner.member ? s.badge.ticket.owner.member.last_name : s.badge.ticket.owner.last_name;
                    email = s.badge.ticket.owner.email;
                    company = s.badge.ticket.owner.company || 'N/A';
                }

                if(s.hasOwnProperty("attendee_first_name")){
                    firstName = s.attendee_first_name;
                    lastName = s.attendee_last_name;
                    email = s.attendee_email;
                    company = s.hasOwnProperty("attendee_company") ? s.attendee_company : 'N/A';
                }

                return {
                    id: s.id,
                    attendee_first_name: firstName,
                    attendee_last_name: lastName,
                    attendee_email: email,
                    scan_date: scanDate,
                    attendee_company: company
                };
            });

            return {...state, badgeScans: badgeScans, currentPage: current_page, totalBadgeScans: total, lastPage: last_page };
        }
        case RECEIVE_SPONSORS: {
            return {...state, allSponsors: payload.response.data }
        }
        default:
            return state;
    }
};

export default badgeScansListReducer;
