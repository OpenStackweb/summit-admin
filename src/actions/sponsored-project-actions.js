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

export const REQUEST_SPONSORED_PROJECTS = 'REQUEST_SPONSORED_PROJECTS';
export const RECEIVE_SPONSORED_PROJECTS = 'RECEIVE_SPONSORED_PROJECTS';
export const RECEIVE_SPONSORED_PROJECT = 'RECEIVE_SPONSORED_PROJECT';
export const RESET_SPONSORED_PROJECT_FORM = 'RESET_SPONSORED_PROJECT_FORM';
export const SPONSORED_PROJECT_DELETED = 'SPONSORED_PROJECT_DELETED';
export const UPDATE_SPONSORED_PROJECT = 'UPDATE_SPONSORED_PROJECT';
export const SPONSORED_PROJECT_UPDATED = 'SPONSORED_PROJECT_UPDATED';
export const SPONSORED_PROJECT_ADDED = 'SPONSORED_PROJECT_ADDED';

export const getSponsoredProjects = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;
    const filter = [];

    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`name=@${escapedTerm}`);
    }

    const params = {
        page: page,
        per_page: perPage,
        access_token: accessToken,
    };

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_SPONSORED_PROJECTS),
        createAction(RECEIVE_SPONSORED_PROJECTS),
        `${window.API_BASE_URL}/api/v1/sponsored-projects`,
        authErrorHandler,
        {order, orderDir, page, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSponsoredProject = (projectId) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'sponsorship_types',
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPONSORED_PROJECT),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteSponsoredProject = (sponsoredProjectId) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return deleteRequest(
        null,
        createAction(SPONSORED_PROJECT_DELETED)({sponsoredProjectId}),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${sponsoredProjectId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSponsoredProjectForm = () => (dispatch) => {
    dispatch(createAction(RESET_SPONSORED_PROJECT_FORM)({}));
};

export const saveSponsoredProject = (entity) => (dispatch, getState) => {
    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPONSORED_PROJECT),
            createAction(SPONSORED_PROJECT_UPDATED_UPDATED),
            `${window.API_BASE_URL}/api/v1/sponsored-projects/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("sponsored_project_list.saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("sponsored_project_list.created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPONSORED_PROJECT),
            createAction(SPONSORED_PROJECT_ADDED),
            `${window.API_BASE_URL}/api/v1/sponsored-projects`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/sponsored-projects`)
                    }
                ));
            });
    }
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};
    return normalizedEntity;
};

/*********************************** Sponsorship types Actions **********************************/

export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED';
export const UPDATE_PROJECT_SPONSORSHIP_TYPE = 'UPDATE_PROJECT_SPONSORSHIP_TYPE';
export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_UPDATED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_UPDATED';
export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_DELETED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_DELETED';
export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_ORDER_UPDATED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_ORDER_UPDATED';
export const RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_FORM = 'RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_FORM';
export const RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE = 'RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE';

export const getSponsorshipType = (projectId, sponsorshipTypeId) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'supporting_companies, supporting_companies.company'
    };

    return getRequest(
        null,
        createAction(RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSponsorshipTypeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_FORM)({}));
}

export const deleteSponsorshipType = (projectId, sponsorshipTypeId) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_DELETED)({sponsorshipTypeId}),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateSponsorShipTypeOrder = (sponsorshipTypes, projectId, sponsorshipTypeId, newOrder) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    const params = {
        access_token: accessToken
    };

    const sponsorshipType = sponsorshipTypes.find(q => q.id === sponsorshipTypeId);

    putRequest(
        null,
        createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_ORDER_UPDATED)(sponsorshipTypes),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}`,
        sponsorshipType,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const saveSponsorshipType = (projectId, entity) => (dispatch, getState) => {
    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    let normalizedEntity = entity;

    if (entity.id) {

        putRequest(
            createAction(UPDATE_PROJECT_SPONSORSHIP_TYPE),
            createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_UPDATED),
            `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_sponsored_project_sponsorship_type.saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsored_project_sponsorship_type.created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_PROJECT_SPONSORSHIP_TYPE),
            createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_ADDED),
            `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/sponsored-projects/${projectId}`)
                    }
                ));
            });
    }
};

/******************************** Supporting Companies Actions **********************************/

export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED';
export const UPDATE_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY = 'UPDATE_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY';
export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_UPDATED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_UPDATED';
export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED';
export const SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ORDER_UPDATED = 'SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ORDER_UPDATED';
export const RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_FORM = 'RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_FORM';
export const RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY = 'RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY';

export const getSupportingCompany = (projectId, sponsorshipTypeId, supportingCompanyId) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'company',
    };

    return getRequest(
        null,
        createAction(RECEIVED_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}/supporting-companies/${supportingCompanyId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSupportingCompanyForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_FORM)({}));
}

export const deleteSupportingCompany = (projectId, sponsorshipTypeId, supportingCompanyId) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_DELETED)({supportingCompanyId}),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}/supporting-companies/${supportingCompanyId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateSupportingCompanyOrder = (supportingCompanies, projectId, sponsorshipTypeId, supportingCompanyId, newOrder) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    const params = {
        access_token: accessToken
    };

    const supportingCompany = supportingCompanies.find(q => q.id === supportingCompanyId);

    putRequest(
        null,
        createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ORDER_UPDATED)(supportingCompanies),
        `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}/supporting-companies/${supportingCompanyId}`,
        supportingCompany,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

const normalizeCompany = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.company_id = (normalizedEntity.company) ? normalizedEntity.company.id : 0;
    delete (normalizedEntity.company);

    return normalizedEntity;
};

export const saveSupportingCompany = (projectId, sponsorshipTypeId, entity) => (dispatch, getState) => {

    const {loggedUserState} = getState();
    const {accessToken} = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand:"company"
    };

    let normalizedEntity = normalizeCompany(entity);

    if (normalizedEntity.id) {

        putRequest(
            createAction(UPDATE_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY),
            createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_UPDATED),
            `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}/supporting-companies/${normalizedEntity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showSuccessMessage(T.translate("edit_sponsored_project_sponsorship_type_supporting_company.saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsored_project_sponsorship_type_supporting_company.created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY),
            createAction(SPONSORED_PROJECT_SPONSORSHIP_TYPE_SUPPORTING_COMPANY_ADDED),
            `${window.API_BASE_URL}/api/v1/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}/supporting-companies`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then(() => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/sponsored-projects/${projectId}/sponsorship-types/${sponsorshipTypeId}`)
                    }
                ));
            });
    }
};
