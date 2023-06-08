/**
 * Copyright 2023 OpenStack Foundation
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

import { AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE } from '../../actions/promocode-actions';
import { RESET_PROMOCODE_SPEC_FORM, UPDATE_SPECS, VALIDATE_SPECS } from '../../actions/promocode-specification-actions';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';

export const DEFAULT_ENTITY = {
    existingPromoCode: null,
    type: '',
    tags: [],
    badgeFeatures: [],
    applyToAllTix: true,
    ticketTypes: [],
    amount: null,
    rate: null,    
}

const DEFAULT_STATE = {
    entity      : DEFAULT_ENTITY,
    errors      : {}
};

const promocodeSpecificationReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
            }
        }
        case SET_CURRENT_SUMMIT:
        case RESET_PROMOCODE_SPEC_FORM: {
            return {...state,  entity: {...DEFAULT_ENTITY}, errors: {} };
        }
        case UPDATE_SPECS: {
            const {promoCodeStrategy, entity} = payload;
            const ticketTypes = promoCodeStrategy === AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE && entity.applyToAllTix ? [] : entity.ticketTypes;
            return {...state,  entity: {...entity, ticketTypes}, errors: {} };
        }
        case VALIDATE_SPECS: {
            const {errors} = payload;
            return {...state,  errors: {...errors} };
        }
        default:
            return state;
    }
};

export default promocodeSpecificationReducer;
