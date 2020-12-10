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
    RECEIVE_PROMOCODES,
    RECEIVE_PROMOCODE_META,
    REQUEST_PROMOCODES,
    PROMOCODE_DELETED
} from '../../actions/promocode-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/actions';

const DEFAULT_STATE = {
    promocodes       : [],
    term            : null,
    type            : 'ALL',
    order           : 'code',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalPromocodes : 0,
    allTypes        : ['ALL'],
    allClasses      : ['ALL']
};

const promocodeListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case REQUEST_PROMOCODES: {
            let {order, orderDir, type, term} = payload;

            return {...state, order, orderDir, type, term }
        }
        break;
        case RECEIVE_PROMOCODE_META: {
            let types = [...DEFAULT_STATE.allTypes];
            let allClasses = [...DEFAULT_STATE.allClasses, ...payload.response];

            payload.response.forEach(t => {
                types = types.concat(t.type)
            });

            let unique_types = [...new Set( types )];

            return {...state, allTypes: unique_types, allClasses: allClasses }
        }
        break;
        case RECEIVE_PROMOCODES: {
            let {current_page, total, last_page} = payload.response;
            let promocodes = payload.response.data.map(p => {
                let owner = '', owner_email = '';

                switch (p.class_name) {
                    case 'MEMBER_PROMO_CODE':
                        if (p.owner) {
                            owner = p.owner.first_name + ' ' + p.owner.last_name;
                            owner_email = p.owner.email;
                        } else {
                            owner = (p.first_name && p.last_name) ? p.first_name + ' ' + p.last_name : '';
                            owner_email = (p.email) ? p.email : '';
                        }
                        break;
                    case 'SPEAKER_PROMO_CODE':
                        if (p.speaker) {
                            owner = p.speaker.first_name + ' ' + p.speaker.last_name;
                            owner_email = p.speaker.email;
                        }
                        break;
                    case 'SPONSOR_PROMO_CODE':
                        if (p.owner) {
                            owner = p.owner.first_name + ' ' + p.owner.last_name;
                            owner_email = p.owner.email;
                        } else if (p.sponsor) {
                            owner = p.sponsor.name;
                        } else {
                            owner = (p.first_name && p.last_name) ? p.first_name + ' ' + p.last_name : '';
                            owner_email = (p.email) ? p.email : '';
                        }
                        break;
                }

                return {
                    id: p.id,
                    class_name: p.class_name,
                    code: p.code,
                    type: p.type,
                    owner: owner,
                    owner_email: owner_email,
                    email_sent: (p.email_sent ? 'Yes' : 'No'),
                    redeemed: (p.redeemed ? 'Yes' : 'No'),
                    creator: p.creator.first_name + ' ' + p.creator.last_name
                };
            })

            return {...state, promocodes: promocodes, currentPage: current_page, totalPromocodes: total, lastPage: last_page };
        }
        break;
        case PROMOCODE_DELETED: {
            let {promocodeId} = payload;
            return {...state, promocodes: state.promocodes.filter(p => p.id !== promocodeId)};
        }
        break;
        default:
            return state;
    }
};

export default promocodeListReducer;
