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

import T from 'i18n-react/dist/i18n-react';
import {
    createAction,
    escapeFilterValue,
    fetchResponseHandler,
    fetchErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';

import {getAccessTokenSafely} from '../utils/methods';

export const UPDATE_SPECS = 'UPDATE_SPECS';
export const VALIDATE_SPECS = 'VALIDATE_SPECS';
export const RESET_PROMOCODE_SPEC_FORM = 'RESET_PROMOCODE_SPEC_FORM';

export const SPEAKERS_PROMO_CODE_CLASS_NAME = 'SPEAKERS_PROMO_CODE';
export const SPEAKERS_DISCOUNT_CODE_CLASS_NAME = 'SPEAKERS_DISCOUNT_CODE';

export const updateSpecs = (promoCodeStrategy, entity) => (dispatch) => {
    dispatch(createAction(UPDATE_SPECS)({promoCodeStrategy, entity}));
    return false;
};

export const validateSpecs = (promoCodeStrategy, entity, callback) => (dispatch) => {
    let errors = {};

    if ([1,2].includes(promoCodeStrategy) && !entity.existingPromoCode) {
        errors['existingPromoCode'] = T.translate("promo_code_specification.promo_code_mandatory");
        dispatch(createAction(VALIDATE_SPECS)({errors}));
        return;
    } 
    if ([3,4].includes(promoCodeStrategy) && !entity.type) {
        errors['type'] = T.translate("promo_code_specification.type_mandatory");
        dispatch(createAction(VALIDATE_SPECS)({errors}));
        return;
    } 
    callback();
};

export const resetPromoCodeSpecForm = () => (dispatch) => {
    dispatch(createAction(RESET_PROMOCODE_SPEC_FORM)({}));
};

export const queryMultiSpeakersPromocodes = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessTokenSafely();

    input = escapeFilterValue(input);

    const params = `filter[]=code=@${input}&filter[]=class_name==${SPEAKERS_PROMO_CODE_CLASS_NAME}||${SPEAKERS_DISCOUNT_CODE_CLASS_NAME}`;

    fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/promo-codes?${params}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            const options = [...json.data];
            callback(options);
        })
        .catch(fetchErrorHandler);
}, 500);