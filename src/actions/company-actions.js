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
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_COMPANIES       = 'REQUEST_COMPANIES';
export const RECEIVE_COMPANIES       = 'RECEIVE_COMPANIES';
export const RECEIVE_COMPANY        = 'RECEIVE_COMPANY';
export const RESET_COMPANY_FORM     = 'RESET_COMPANY_FORM';
export const COMPANY_DELETED        = 'COMPANY_DELETED';
export const UPDATE_COMPANY         = 'UPDATE_COMPANY';
export const COMPANY_UPDATED        = 'COMPANY_UPDATED';
export const COMPANY_ADDED          = 'COMPANY_ADDED';
export const LOGO_ATTACHED           = 'LOGO_ATTACHED';
export const BIG_LOGO_ATTACHED       = 'BIG_LOGO_ATTACHED';


export const getCompanies = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;
    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`name=@${escapedTerm}`);
    }

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_COMPANIES),
        createAction(RECEIVE_COMPANIES),
        `${window.API_BASE_URL}/api/v1/companies`,
        authErrorHandler,
        {order, orderDir, page, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getCompany = (companyId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'sponsorships,project_sponsorships',
    };

    return getRequest(
        null,
        createAction(RECEIVE_COMPANY),
        `${window.API_BASE_URL}/api/v1/companies/${companyId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteCompany = (companyId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(COMPANY_DELETED)({companyId}),
        `${window.API_BASE_URL}/api/v1/companies/${companyId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const resetCompanyForm = () => (dispatch) => {
    dispatch(createAction(RESET_COMPANY_FORM)({}));
};

export const saveCompany = (entity) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_COMPANY),
            createAction(COMPANY_UPDATED),
            `${window.API_BASE_URL}/api/v1/companies/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_company.company_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_company.company_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_COMPANY),
            createAction(COMPANY_ADDED),
            `${window.API_BASE_URL}/api/v1/companies`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/companies`) }
                ));
            });
    }
};

export const attachLogo = (entity, file, picAttr) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    const normalizedEntity = normalizeEntity(entity);

    const uploadFile = picAttr === 'logo' ? uploadLogo : uploadBigLogo;

    if (entity.id) {
        dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_COMPANY),
            createAction(COMPANY_ADDED),
            `${window.API_BASE_URL}/api/v1/companies`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(uploadFile(payload.response, file));
            }
        );
    }
};

const uploadLogo = (entity, file) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(LOGO_ATTACHED),
        `${window.API_BASE_URL}/api/v1/companies/${entity.id}/logo`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            history.push(`/app/companies/${entity.id}`)
        });
};

const uploadBigLogo = (entity, file) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(BIG_LOGO_ATTACHED),
        `${window.API_BASE_URL}/api/v1/companies/${entity.id}/logo/big`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            history.push(`/app/companies/${entity.id}`)
        });
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    //remove # from color hexa
    normalizedEntity['color'] = normalizedEntity['color'].substr(1);

    delete normalizedEntity['logo'];
    delete normalizedEntity['big_logo'];

    return normalizedEntity;
};

