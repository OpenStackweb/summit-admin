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
    getCSV,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';

export const REQUEST_SPONSORS = 'REQUEST_SPONSORS';
export const RECEIVE_SPONSORS = 'RECEIVE_SPONSORS';
export const RECEIVE_SPONSOR = 'RECEIVE_SPONSOR';
export const RESET_SPONSOR_FORM = 'RESET_SPONSOR_FORM';
export const UPDATE_SPONSOR = 'UPDATE_SPONSOR';
export const SPONSOR_UPDATED = 'SPONSOR_UPDATED';
export const SPONSOR_ADDED = 'SPONSOR_ADDED';
export const SPONSOR_DELETED = 'SPONSOR_DELETED';
export const SPONSOR_ORDER_UPDATED = 'SPONSOR_ORDER_UPDATED';
export const MEMBER_ADDED_TO_SPONSOR = 'MEMBER_ADDED_TO_SPONSOR';
export const MEMBER_REMOVED_FROM_SPONSOR = 'MEMBER_REMOVED_FROM_SPONSOR';
export const COMPANY_ADDED = 'COMPANY_ADDED';

export const REQUEST_SUMMIT_SPONSORSHIPS = 'REQUEST_SUMMIT_SPONSORSHIPS';
export const RECEIVE_SUMMIT_SPONSORSHIPS = 'RECEIVE_SUMMIT_SPONSORSHIPS';
export const RECEIVE_SUMMIT_SPONSORSHIP = 'RECEIVE_SUMMIT_SPONSORSHIP';
export const RESET_SUMMIT_SPONSORSHIP_FORM = 'RESET_SUMMIT_SPONSORSHIP_FORM';
export const UPDATE_SUMMIT_SPONSORSHIP = 'UPDATE_SUMMIT_SPONSORSHIP';
export const SUMMIT_SPONSORSHIP_UPDATED = 'SUMMIT_SPONSORSHIP_UPDATED';
export const SUMMIT_SPONSORSHIP_ADDED = 'SUMMIT_SPONSORSHIP_ADDED';
export const SUMMIT_SPONSORSHIP_DELETED = 'SUMMIT_SPONSORSHIP_DELETED';
export const BADGE_IMAGE_ATTACHED = 'BADGE_IMAGE_ATTACHED';
export const BADGE_IMAGE_DELETED = 'BADGE_IMAGE_DELETED';
export const SUMMIT_SPONSORSHIP_ORDER_UPDATED = 'SUMMIT_SPONSORSHIP_ORDER_UPDATED';

export const REQUEST_BADGE_SCANS = 'REQUEST_BADGE_SCANS';
export const RECEIVE_BADGE_SCANS = 'RECEIVE_BADGE_SCANS';


/******************  SPONSORS ****************************************/


export const getSponsors = (term = null, page = 1, perPage = 100, order = 'order', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`company_name=@${escapedTerm},sponsorship_name=@${escapedTerm},sponsorship_size=@${escapedTerm}`);
    }

    const params = {
        page: page,
        per_page: perPage,
        expand: 'company,sponsorship',
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
        createAction(REQUEST_SPONSORS),
        createAction(RECEIVE_SPONSORS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSponsorsWithBadgeScans = () => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    const params = {
        page: 1,
        per_page: 100,
        expand: 'company',
        access_token: accessToken,
        'filter[]': ['badge_scans_count>0'],
        order: '+order'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPONSORS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSponsor = (sponsorId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'company, members',
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSponsorForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSOR_FORM)({}));
};

export const saveSponsor = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeSponsor(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPONSOR),
            createAction(SPONSOR_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_sponsor.sponsor_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsor.sponsor_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPONSOR),
            createAction(SPONSOR_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/sponsors/${payload.response.id}`)
                    }
                ));
            });
    }
};

export const addMemberToSponsor = (sponsorId, member) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    putRequest(
        null,
        createAction(MEMBER_ADDED_TO_SPONSOR)({member}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/users/${member.id}`,
        {},
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
        });
};

export const removeMemberFromSponsor = (sponsorId, memberId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    dispatch(startLoading());

    return deleteRequest(
        null,
        createAction(MEMBER_REMOVED_FROM_SPONSOR)({memberId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/users/${memberId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteSponsor = (sponsorId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSOR_DELETED)({sponsorId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateSponsorOrder = (sponsors, sponsorId, newOrder) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    const sponsor = sponsors.find(s => s.id === sponsorId);

    const normalizedEntity = normalizeSponsor(sponsor);

    putRequest(
        null,
        createAction(SPONSOR_ORDER_UPDATED)(sponsors),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}


const normalizeSponsor = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.company_id = (normalizedEntity.company) ? normalizedEntity.company.id : 0;

    delete (normalizedEntity.company);
    delete (normalizedEntity.sponsorship);


    return normalizedEntity;

};

export const createCompany = (company, callback) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token: accessToken,
    };

    dispatch(startLoading());

    postRequest(
        null,
        createAction(COMPANY_ADDED),
        `${window.API_BASE_URL}/api/v1/companies`,
        {name: company},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
        callback(payload.response);
    });

}


/******************  SPONSORSHIPS ****************************************/



export const getSummitSponsorships = (page = 1, perPage = 100, order = 'order', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        page: page,
        per_page: perPage,
        access_token: accessToken,
        expand: 'type',
    };

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_SUMMIT_SPONSORSHIPS),
        createAction(RECEIVE_SUMMIT_SPONSORSHIPS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types`,
        authErrorHandler,
        {order, orderDir, page}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSummitSponsorship = (sponsorshipId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'type'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMIT_SPONSORSHIP),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types/${sponsorshipId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetSummitSponsorshipForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SUMMIT_SPONSORSHIP_FORM)({}));
};

export const saveSummitSponsorship = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
        expand: 'type'
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeSponsorship(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SUMMIT_SPONSORSHIP),
            createAction(SUMMIT_SPONSORSHIP_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types/${entity.id}`,
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
            createAction(UPDATE_SUMMIT_SPONSORSHIP),
            createAction(SUMMIT_SPONSORSHIP_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/sponsorships/${payload.response.id}`)
                    }
                ));
            });
    }
}

export const uploadSponsorshipBadgeImage = (entity, file) => async (dispatch, getState) => {

    if (!entity.id) return Promise.reject();

    const {currentSummitState: {currentSummit}} = getState();

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return postRequest(
        null,
        createAction(BADGE_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types/${entity.id}/badge-image`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            history.push(`/app/summits/${currentSummit.id}/sponsorships/${entity.id}`)
        });

};

export const removeSponsorshipBadgeImage = (sponsorshipId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    dispatch(startLoading());

    return deleteRequest(
        null,
        createAction(BADGE_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types/${sponsorshipId}/badge-image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateSummitSponsorhipOrder = (sponsorships, sponsorshipId, newOrder) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
        per_page: 100,
    };

    putRequest(
        null,
        createAction(SUMMIT_SPONSORSHIP_ORDER_UPDATED)(sponsorships),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types/${sponsorshipId}`,
        {order: newOrder},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const deleteSummitSponsorship = (sponsorshipId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SUMMIT_SPONSORSHIP_DELETED)({sponsorshipId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsorships-types/${sponsorshipId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeSponsorship = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity['type_id'] = (normalizedEntity.type) ? normalizedEntity.type.id : 0;

    delete normalizedEntity['type'];

    return normalizedEntity;

}


/******************  BADGE SCANS  ****************************************/


export const getBadgeScans = (sponsorId = null, page = 1, perPage = 10, order = 'attendee_last_name', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    if (sponsorId) {
        filter.push(`sponsor_id==${sponsorId}`);
    }

    const params = {
        page: page,
        per_page: perPage,
        expand: 'badge,badge.ticket,badge.ticket.owner,badge.ticket.owner.member',
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
        createAction(REQUEST_BADGE_SCANS),
        createAction(RECEIVE_BADGE_SCANS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/badge-scans`,
        authErrorHandler,
        {page, perPage, order, orderDir, sponsorId}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const exportBadgeScans = (sponsor = null, order = 'attendee_last_name', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    const filename = sponsor.company.name + '-BadgeScans.csv';
    const params = {
        access_token: accessToken,
        columns: 'scan_date,attendee_first_name,attendee_last_name,attendee_email,attendee_company',
    };

    filter.push(`sponsor_id==${sponsor.id}`);

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/badge-scans/csv`, params, filename));

};
