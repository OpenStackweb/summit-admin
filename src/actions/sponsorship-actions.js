/**
 * Copyright 2018 OpenStack Foundation
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

import T from "i18n-react/dist/i18n-react";
import history from '../history'
import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler,    
    escapeFilterValue,
    fetchResponseHandler,
    fetchErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_SPONSORSHIPS       = 'REQUEST_SPONSORSHIPS';
export const RECEIVE_SPONSORSHIPS       = 'RECEIVE_SPONSORSHIPS';
export const RECEIVE_SPONSORSHIP        = 'RECEIVE_SPONSORSHIP';
export const RESET_SPONSORSHIP_FORM     = 'RESET_SPONSORSHIP_FORM';
export const UPDATE_SPONSORSHIP         = 'UPDATE_SPONSORSHIP';
export const SPONSORSHIP_UPDATED        = 'SPONSORSHIP_UPDATED';
export const SPONSORSHIP_ADDED          = 'SPONSORSHIP_ADDED';
export const SPONSORSHIP_DELETED        = 'SPONSORSHIP_DELETED';

/******************  SPONSORS ****************************************/

export const getSponsorships = ( page = 1, perPage = 10, order = 'name', orderDir = 1 ) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();    

    dispatch(startLoading());

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_SPONSORSHIPS),
        createAction(RECEIVE_SPONSORSHIPS),
        `${window.API_BASE_URL}/api/v1/sponsorship-types`,
        authErrorHandler,
        {order, orderDir, page}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSponsorship = (sponsorshipId) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPONSORSHIP),
        `${window.API_BASE_URL}/api/v1/sponsorship-types/${sponsorshipId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSponsorshipForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSORSHIP_FORM)({}));
};

export const saveSponsorship = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeSponsorship(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPONSORSHIP),
            createAction(SPONSORSHIP_UPDATED),
            `${window.API_BASE_URL}/api/v1/sponsorship-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_sponsorship.sponsorship_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsorship.sponsorship_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPONSORSHIP),
            createAction(SPONSORSHIP_ADDED),
            `${window.API_BASE_URL}/api/v1/sponsorship-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/sponsorship-types/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteSponsorship = (sponsorshipId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSORSHIP_DELETED)({sponsorshipId}),
        `${window.API_BASE_URL}/api/v1/sponsorship-types/${sponsorshipId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeSponsorship = (entity) => {
    const normalizedEntity = {...entity};

    return normalizedEntity;

}

export const querySponsorships = _.debounce(async (input, callback) => {

    const accessToken = await getAccessTokenSafely();

    input = escapeFilterValue(input);

    fetch(`${window.API_BASE_URL}/api/v1/sponsorship-types?filter=name=@${input}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            const options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, 500);
