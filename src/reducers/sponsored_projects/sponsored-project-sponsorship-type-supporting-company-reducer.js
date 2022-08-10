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
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED,
    UPDATE_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY,
    SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_UPDATED,
    RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_FORM,
    RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY,
} from '../../actions/sponsored-project-actions';

import {LOGOUT_USER, VALIDATE} from 'openstack-uicore-foundation/lib/utils/actions';

export const DEFAULT_ENTITY = {
    id: 0,
    company: null,
};

const DEFAULT_STATE = {
    entity: DEFAULT_ENTITY,
    errors: {}
};

const sponsoredProjectSponsorshipTypeSupportingCompanyReducer = (state = DEFAULT_STATE, action) => {
    const {type, payload} = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state, entity: {...DEFAULT_ENTITY}, errors: {}};
            }
        }
            break;
        case RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_FORM: {
            return DEFAULT_STATE;
        }
            break;
        case UPDATE_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY: {
            return {...state, entity: {...payload}, errors: {}};
        }
            break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED:
        case RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY: {
            let entity = {...payload.response};

            for (var key in entity) {
                if (entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key];
                }
            }

            return {...state, entity: {...DEFAULT_ENTITY, ...entity}, errors: {}};
        }
            break;
        case SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_UPDATED: {
            return state;
        }
            break;
        case VALIDATE: {
            return {...state, errors: payload.errors};
        }
            break;
        default:
            return state;
    }
};

export default sponsoredProjectSponsorshipTypeSupportingCompanyReducer;
