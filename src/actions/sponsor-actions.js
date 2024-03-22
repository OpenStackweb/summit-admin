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
    escapeFilterValue,
    fetchResponseHandler,
    fetchErrorHandler
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
export const RECEIVE_SPONSOR_EXTRA_QUESTION_META = 'RECEIVE_SPONSOR_EXTRA_QUESTION_META';
export const SPONSOR_EXTRA_QUESTION_ORDER_UPDATED = 'SPONSOR_EXTRA_QUESTION_ORDER_UPDATED';
export const SPONSOR_EXTRA_QUESTION_DELETED = 'SPONSOR_EXTRA_QUESTION_DELETED';
export const RECEIVE_SPONSOR_EXTRA_QUESTION      = 'RECEIVE_SPONSOR_EXTRA_QUESTION';
export const UPDATE_SPONSOR_EXTRA_QUESTION       = 'UPDATE_SPONSOR_EXTRA_QUESTION';
export const SPONSOR_EXTRA_QUESTION_UPDATED      = 'SPONSOR_EXTRA_QUESTION_UPDATED';
export const SPONSOR_EXTRA_QUESTION_ADDED        = 'SPONSOR_EXTRA_QUESTION_ADDED';
export const RESET_SPONSOR_EXTRA_QUESTION_FORM   = 'RESET_SPONSOR_EXTRA_QUESTION_FORM';
export const SPONSOR_EXTRA_QUESTION_VALUE_DELETED   = 'SPONSOR_EXTRA_QUESTION_VALUE_DELETED';
export const SPONSOR_EXTRA_QUESTION_VALUE_ADDED   = 'SPONSOR_EXTRA_QUESTION_VALUE_ADDED';
export const SPONSOR_EXTRA_QUESTION_VALUE_UPDATED   = 'SPONSOR_EXTRA_QUESTION_VALUE_UPDATED';

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
export const RECEIVE_BADGE_SCAN  = 'RECEIVE_BADGE_SCAN';
export const BADGE_SCAN_UPDATED  = 'BADGE_SCAN_UPDATED';
export const RESET_BADGE_SCAN_FORM = 'RESET_BADGE_SCAN_FORM';

export const HEADER_IMAGE_ATTACHED            = 'HEADER_IMAGE_ATTACHED';
export const HEADER_MOBILE_IMAGE_ATTACHED     = 'HEADER_MOBILE_IMAGE_ATTACHED';
export const SIDE_IMAGE_ATTACHED              = 'SIDE_IMAGE_ATTACHED';
export const CAROUSEL_IMAGE_ATTACHED          = 'CAROUSEL_IMAGE_ATTACHED';
export const HEADER_IMAGE_DELETED             = 'HEADER_IMAGE_DELETED';
export const HEADER_MOBILE_IMAGE_DELETED      = 'HEADER_MOBILE_IMAGE_DELETED';
export const SIDE_IMAGE_DELETED               = 'SIDE_IMAGE_DELETED';
export const CAROUSEL_IMAGE_DELETED           = 'CAROUSEL_IMAGE_DELETED';

export const RECEIVE_SPONSOR_ADVERTISEMENTS     = 'RECEIVE_SPONSOR_ADVERTISEMENTS';
export const RECEIVE_SPONSOR_ADVERTISEMENT      = 'RECEIVE_SPONSOR_ADVERTISEMENT';
export const UPDATE_SPONSOR_ADVERTISEMENT       = 'UPDATE_SPONSOR_ADVERTISEMENT';
export const SPONSOR_ADVERTISEMENT_UPDATED      = 'SPONSOR_ADVERTISEMENT_UPDATED';
export const SPONSOR_ADVERTISEMENT_ADDED        = 'SPONSOR_ADVERTISEMENT_ADDED';
export const RESET_SPONSOR_ADVERTISEMENT_FORM   = 'RESET_SPONSOR_ADVERTISEMENT_FORM';
export const SPONSOR_ADVERTISEMENT_DELETED      = 'SPONSOR_ADVERTISEMENT_DELETED';
export const SPONSOR_ADVERTISEMENT_IMAGE_ATTACHED = 'SPONSOR_ADVERTISEMENT_IMAGE_ATTACHED';
export const SPONSOR_ADVERTISEMENT_IMAGE_DELETED = 'SPONSOR_ADVERTISEMENT_IMAGE_DELETED';
export const SPONSOR_ADS_ORDER_UPDATED           = 'SPONSOR_ADS_ORDER_UPDATED';

export const RECEIVE_SPONSOR_MATERIALS     = 'RECEIVE_SPONSOR_MATERIALS';
export const RECEIVE_SPONSOR_MATERIAL      = 'RECEIVE_SPONSOR_MATERIAL';
export const UPDATE_SPONSOR_MATERIAL       = 'UPDATE_SPONSOR_MATERIAL';
export const SPONSOR_MATERIAL_UPDATED      = 'SPONSOR_MATERIAL_UPDATED';
export const SPONSOR_MATERIAL_ADDED        = 'SPONSOR_MATERIAL_ADDED';
export const RESET_SPONSOR_MATERIAL_FORM   = 'RESET_SPONSOR_MATERIAL_FORM';
export const SPONSOR_MATERIAL_DELETED      = 'SPONSOR_MATERIAL_DELETED';
export const SPONSOR_MATERIAL_ORDER_UPDATED= 'SPONSOR_MATERIAL_ORDER_UPDATED';

export const RECEIVE_SPONSOR_SOCIAL_NETWORKS     = 'RECEIVE_SPONSOR_SOCIAL_NETWORKS';
export const RECEIVE_SPONSOR_SOCIAL_NETWORK      = 'RECEIVE_SPONSOR_SOCIAL_NETWORK';
export const UPDATE_SPONSOR_SOCIAL_NETWORK       = 'UPDATE_SPONSOR_SOCIAL_NETWORK';
export const SPONSOR_SOCIAL_NETWORK_UPDATED      = 'SPONSOR_SOCIAL_NETWORK_UPDATED';
export const SPONSOR_SOCIAL_NETWORK_ADDED        = 'SPONSOR_SOCIAL_NETWORK_ADDED';
export const RESET_SPONSOR_SOCIAL_NETWORK_FORM   = 'RESET_SPONSOR_SOCIAL_NETWORK_FORM';
export const SPONSOR_SOCIAL_NETWORK_DELETED      = 'SPONSOR_SOCIAL_NETWORK_DELETED';

export const REQUEST_SPONSOR_PROMOCODES= 'REQUEST_SPONSOR_PROMOCODES';
export const RECEIVE_SPONSOR_PROMOCODES= 'RECEIVE_SPONSOR_PROMOCODES';
export const CLEAR_ALL_SELECTED_SPONSOR_PROMOCODES= 'CLEAR_ALL_SELECTED_SPONSOR_PROMOCODES';
export const SELECT_SPONSOR_PROMOCODE= 'SELECT_SPONSOR_PROMOCODE';
export const SEND_SPONSOR_PROMOCODES_EMAILS= 'SEND_SPONSOR_PROMOCODES_EMAILS';
export const SET_SPONSOR_PROMOCODES_CURRENT_FLOW_EVENT= 'SET_SPONSOR_PROMOCODES_CURRENT_FLOW_EVENT';
export const SET_SELECTED_ALL_SPONSOR_PROMOCODES= 'SET_SELECTED_ALL_SPONSOR_PROMOCODES';
export const UNSELECT_SPONSOR_PROMOCODE= 'UNSELECT_SPONSOR_PROMOCODE';
export const CHANGE_SPONSOR_PROMOCODES_SEARCH_TERM= 'CHANGE_SPONSOR_PROMOCODES_SEARCH_TERM';



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
        page         : page,
        per_page     : perPage,
        expand       : 'company,sponsorship,sponsorship.type',
        access_token : accessToken,
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
        access_token : accessToken,
        expand       : 'company, members, sponsorship, sponsorship.type, featured_event, extra_questions',
        fields       : 'featured_event.id, featured_event.title'
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
        access_token : accessToken,
        expand       : 'company,sponsorship,sponsorship.type',
    };

    putRequest(
        null,
        createAction(SPONSOR_ORDER_UPDATED)(sponsors),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}`,
        {order: newOrder},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}


const normalizeSponsor = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.company_id = normalizedEntity.company?.id || 0;
    normalizedEntity.sponsorship_id = normalizedEntity.sponsorship?.id || 0;
    normalizedEntity.featured_event_id = (normalizedEntity.featured_event && normalizedEntity.featured_event.id) ? normalizedEntity.featured_event.id : 0;

    delete(normalizedEntity.featured_event);
    delete(normalizedEntity.company);
    delete(normalizedEntity.sponsorship);


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


/******************  EXTRA QUESTIONS  ****************************************/

export const getExtraQuestionMeta = () => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken,
    };

    return getRequest(
      null,
      createAction(RECEIVE_SPONSOR_EXTRA_QUESTION_META),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/all/extra-questions/metadata`,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

export const updateExtraQuestionOrder = (extraQuestions, sponsorId, questionId, newOrder) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    putRequest(
      null,
      createAction(SPONSOR_EXTRA_QUESTION_ORDER_UPDATED)(extraQuestions),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${questionId}`,
      {order: newOrder},
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );

}


export const deleteExtraQuestion = (sponsorId, questionId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
      null,
      createAction(SPONSOR_EXTRA_QUESTION_DELETED)({questionId}),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${questionId}`,
      null,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};


export const saveSponsorExtraQuestion = (entity) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : sponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeSocialNetwork(entity);

    if (entity.id) {

        return putRequest(
          createAction(UPDATE_SPONSOR_EXTRA_QUESTION),
          createAction(SPONSOR_EXTRA_QUESTION_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${entity.id}`,
          normalizedEntity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then((payload) => {
              dispatch(showSuccessMessage(T.translate("edit_sponsor.extra_question_saved")));
          });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsor.extra_question_created"),
            type: 'success'
        };

        return postRequest(
          createAction(UPDATE_SPONSOR_EXTRA_QUESTION),
          createAction(SPONSOR_EXTRA_QUESTION_ADDED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions`,
          normalizedEntity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then((payload) => {
              dispatch(showMessage(
                success_message,
                () => { history.push(`/app/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${payload.response.id}`) }
              ));
          });
    }
}

export const getSponsorExtraQuestion = (extraQuestionId) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : sponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
        expand: "values"
    };

    dispatch(startLoading());

    return getRequest(
      null,
      createAction(RECEIVE_SPONSOR_EXTRA_QUESTION),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${extraQuestionId}`,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
}

export const resetSponsorExtraQuestionForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSOR_EXTRA_QUESTION_FORM)({}));
};


export const saveSponsorExtraQuestionValue = (questionId, entity) => async (dispatch, getState) => {
    const {currentSummitState, currentSponsorState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const { entity: { id : sponsorId } } = currentSponsorState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    if (entity.id) {

        return putRequest(
          null,
          createAction(SPONSOR_EXTRA_QUESTION_VALUE_UPDATED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${questionId}/values/${entity.id}`,
          entity,
          authErrorHandler,
          entity
        )(params)(dispatch)
          .then((payload) => {
              dispatch(stopLoading());
          });

    }

    return postRequest(
      null,
      createAction(SPONSOR_EXTRA_QUESTION_VALUE_ADDED),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${questionId}/values`,
      entity,
      authErrorHandler,
      entity
    )(params)(dispatch)
      .then((payload) => {
          dispatch(stopLoading());
      });

}

/**
 * @param values
 * @param valueId
 * @param newOrder
 * @returns {function(*=, *): *}
 */
export const updateSponsorExtraQuestionValueOrder = (values, valueId, newOrder) => async (dispatch, getState) => {

    const {currentSponsorState, currentSummitState, currentSponsorExtraQuestionState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const { entity: { id : sponsorId } } = currentSponsorState;
    const { entity: { id: questionId } } = currentSponsorExtraQuestionState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    return putRequest(
      null,
      createAction(SPONSOR_EXTRA_QUESTION_VALUE_UPDATED),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${questionId}/values/${valueId}`,
      {order: newOrder},
      authErrorHandler,
      {order: newOrder, id: valueId},
    )(params)(dispatch)
      .then((payload) => {
          dispatch(stopLoading());
      });

}

export const deleteSponsorExtraQuestionValue = (questionId, valueId) => async (dispatch, getState) => {

    const {currentSummitState, currentSponsorState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const { entity: { id : sponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
      null,
      createAction(SPONSOR_EXTRA_QUESTION_VALUE_DELETED)({valueId}),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/extra-questions/${questionId}/values/${valueId}`,
      null,
      authErrorHandler
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

/******************  SPONSORSHIPS ****************************************/

export const getSummitSponsorships = ( order = 'name', orderDir = 1 ) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
        expand       : 'type'
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
        {order, orderDir}
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
                    () => { history.push(`/app/summits/${currentSummit.id}/sponsorships/${payload.response.id}`) }
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

const normalizeCollection = (entity) => {
    const normalizedEntity = {...entity};

    delete normalizedEntity['order'];

    return normalizedEntity;
}

const normalizeSocialNetwork = (entity) => {
    const normalizedEntity = {...entity};

    normalizeCollection(normalizedEntity);

    normalizedEntity['icon_css_class'] = entity.icon_css_class?.value ? entity.icon_css_class.value : entity.icon_css_class;

    return normalizedEntity;
}

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    return normalizedEntity;
}

/******************  BADGE SCANS  ****************************************/


export const getBadgeScans = (sponsorId = null, page = 1, perPage = 10, order = 'attendee_last_name', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    const summitTZ = currentSummit.time_zone.name;

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
        { page, perPage, order, orderDir, sponsorId, summitTZ }
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

export const getBadgeScan = (scanId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
        expand: 'badge,badge.ticket,badge.ticket.owner,badge.ticket.owner.member,sponsor,sponsor.extra_questions,sponsor.extra_questions.values,extra_questions'
    };

    return getRequest(
        null,
        createAction(RECEIVE_BADGE_SCAN),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/badge-scans/${scanId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const saveBadgeScan = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    const normalizedEntity = normalizeBadgeScan(entity);

    return putRequest(
        null,
        createAction(BADGE_SCAN_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/badge-scans/${entity.id}`,
        normalizedEntity,
        authErrorHandler,
        entity
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showSuccessMessage(T.translate("edit_badge_scan.badge_scan_saved")));
        });
}

export const resetBadgeScanForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_BADGE_SCAN_FORM)({}));
};

const normalizeBadgeScan = (entity) => {
    const normalizedEntity = {...entity};

    delete normalizedEntity['sponsor_extra_questions']
    delete normalizedEntity['attendee_company']
    delete normalizedEntity['attendee_full_name']

    return normalizedEntity;
}

/******************  SPONSOR PAGES  ****************************************/

export const attachSponsorImage = (entity, file, picAttr) => async (dispatch, getState) => {
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    const uploadFile = picAttr === 'header_image' ? uploadHeaderImage :
                       picAttr === 'side_image' ? uploadSideImage :
                       picAttr === 'header_mobile_image' ? uploadHeaderMobileImage : uploadCarouselImage;

    if (entity.id) {
        dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_SPONSOR),
            createAction(SPONSOR_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors`,
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

const uploadHeaderImage = (entity, file) => async (dispatch, getState) => {

    const { currentSummitState: { currentSummit } } = getState();

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(HEADER_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/header-image`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

const uploadHeaderMobileImage = (entity, file) => async (dispatch, getState) => {

    const { currentSummitState: { currentSummit } } = getState();

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(HEADER_MOBILE_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/header-image/mobile`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

const uploadSideImage = (entity, file) => async (dispatch, getState) => {

    const { currentSummitState: { currentSummit } } = getState();

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(SIDE_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/side-image`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

const uploadCarouselImage = (entity, file) => async (dispatch, getState) => {

    const { currentSummitState: { currentSummit } } = getState();

    const accessToken = await getAccessTokenSafely();

    const params = {
        access_token : accessToken,
    };

    postRequest(
        null,
        createAction(CAROUSEL_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/carousel-advertise-image`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const removeSponsorImage = (entity, picAttr) => async (dispatch, getState) => {

    dispatch(startLoading());

    const removeFile = picAttr === 'header_image' ? removeHeaderImage :
                       picAttr === 'side_image' ? removeSideImage :
                       picAttr === 'header_mobile_image' ? removeHeaderMobileImage : removeCarouselImage;

    return dispatch(removeFile(entity));
};

export const removeHeaderImage = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(HEADER_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/header-image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeHeaderMobileImage = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(HEADER_MOBILE_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/header-image/mobile`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeSideImage = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SIDE_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/side-image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeCarouselImage = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(CAROUSEL_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${entity.id}/carousel-advertise-image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}



export const getSponsorAdvertisements = (sponsorId, order = 'order', orderDir = 1) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR_ADVERTISEMENTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/ads`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const saveSponsorAdvertisement = (entity) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeCollection(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPONSOR_ADVERTISEMENT),
            createAction(SPONSOR_ADVERTISEMENT_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_sponsor.advertisement_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsor.advertisement_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPONSOR_ADVERTISEMENT),
            createAction(SPONSOR_ADVERTISEMENT_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${payload.response.id}`) }
                ));
            });
    }
}

export const getSponsorAdvertisement = (advertisementId) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR_ADVERTISEMENT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${advertisementId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}


export const updateSponsorAdsOrder = (ads, advertiseId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState} = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity : { id: currentSponsorId }} = currentSponsorState;

    const params = {
        access_token : accessToken,
        per_page     : 100,
    };

    putRequest(
        null,
        createAction(SPONSOR_ADS_ORDER_UPDATED)(ads),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${advertiseId}`,
        {order: newOrder},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const resetSponsorAdvertisementForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSOR_ADVERTISEMENT_FORM)({}));
};

export const deleteSponsorAdvertisement = (advertisementId) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSOR_ADVERTISEMENT_DELETED)({advertisementId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${advertisementId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const submitSponsorAdvertisementImage = (entity, file) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    dispatch(startLoading());

    if (entity.id) {
        dispatch(uploadAdvertiseImage(entity, file));
    } else {
        const normalizedEntity = normalizeSponsorship(entity);
        postRequest(
            createAction(UPDATE_SPONSOR_ADVERTISEMENT),
            createAction(SPONSOR_ADVERTISEMENT_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(uploadAdvertiseImage(payload.response, file));
            });
    }
}

const uploadAdvertiseImage = (entity, file) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    postRequest(
        null,
        createAction(SPONSOR_ADVERTISEMENT_IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${entity.id}/image`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const removeSponsorAdvertisementImage = (entity) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSOR_ADVERTISEMENT_IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/ads/${entity.id}/image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

// Materials

export const getSponsorMaterials = (sponsorId, order = 'order', orderDir = 1) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR_MATERIALS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/materials`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const saveSponsorMaterial = (entity) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeCollection(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPONSOR_MATERIAL),
            createAction(SPONSOR_MATERIAL_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/materials/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_sponsor.material_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsor.material_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPONSOR_MATERIAL),
            createAction(SPONSOR_MATERIAL_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/materials`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/sponsors/${currentSponsorId}/materials/${payload.response.id}`) }
                ));
            });
    }
}

export const getSponsorMaterial = (materialId) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR_MATERIAL),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/materials/${materialId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const updateSponsorMaterialOrder = (materials, materialId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState} = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity : { id: currentSponsorId }} = currentSponsorState;

    const params = {
        access_token : accessToken,
        per_page     : 100,
    };

    putRequest(
        null,
        createAction(SPONSOR_MATERIAL_ORDER_UPDATED)(materials),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/materials/${materialId}`,
        {order: newOrder},
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const resetSponsorMaterialForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSOR_MATERIAL_FORM)({}));
};

export const deleteSponsorMaterial = (materialId) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSOR_MATERIAL_DELETED)({materialId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/materials/${materialId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}


// Social Networks

export const getSponsorSocialNetworks = (sponsorId, page, perPage) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        page: page,
        per_page: perPage,
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR_SOCIAL_NETWORKS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${sponsorId}/social-networks`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const saveSponsorSocialNetwork = (entity) => async (dispatch, getState) => {

    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeSocialNetwork(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPONSOR_SOCIAL_NETWORK),
            createAction(SPONSOR_SOCIAL_NETWORK_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/social-networks/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_sponsor.social_network_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_sponsor.social_network_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPONSOR_SOCIAL_NETWORK),
            createAction(SPONSOR_SOCIAL_NETWORK_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/social-networks`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/sponsors/${currentSponsorId}/social-networks/${payload.response.id}`) }
                ));
            });
    }
}

export const getSponsorSocialNetwork = (socialNetWorkId) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    return getRequest(
        null,
        createAction(RECEIVE_SPONSOR_SOCIAL_NETWORK),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/social-networks/${socialNetWorkId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const resetSponsorSocialNetworkForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPONSOR_SOCIAL_NETWORK_FORM)({}));
};

export const deleteSponsorSocialNetwork = (socialNetWorkId) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const { entity: { id : currentSponsorId } } = currentSponsorState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(SPONSOR_SOCIAL_NETWORK_DELETED)({socialNetWorkId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/${currentSponsorId}/social-networks/${socialNetWorkId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}



export const querySummitSponsorships = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessTokenSafely();

    input = escapeFilterValue(input);

    fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/sponsorships-types?filter=name=@${input}&access_token=${accessToken}&expand=type`)
        .then(fetchResponseHandler)
        .then((json) => {
            const options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, 500);



/******************  SPONSOR PROMOCODES  ****************************************/


export const selectPromocode = (promocodeId) => (dispatch) => {
    dispatch(createAction(SELECT_SPONSOR_PROMOCODE)(promocodeId));
};

export const unSelectPromocode = (promocodeId) => (dispatch) => {
    dispatch(createAction(UNSELECT_SPONSOR_PROMOCODE)(promocodeId));
};

export const clearAllSelectedPromocodes = () => (dispatch) => {
    dispatch(createAction(CLEAR_ALL_SELECTED_SPONSOR_PROMOCODES)());
}

export const setCurrentFlowEvent = (value) => (dispatch) => {
    dispatch(createAction(SET_SPONSOR_PROMOCODES_CURRENT_FLOW_EVENT)(value));
};

export const setSelectedAll = (value) => (dispatch) => {
    dispatch(createAction(SET_SELECTED_ALL_SPONSOR_PROMOCODES)(value));
};

export const changeSearchTerm = (term) => (dispatch, getState) => {
    dispatch(createAction(CHANGE_SPONSOR_PROMOCODES_SEARCH_TERM)({term}));
}

export const getSponsorPromocodes = (term = null, page = 1, perPage = 100, order = 'order', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`sponsor_company_name@@${escapedTerm},tier_name@@${escapedTerm},code@@${escapedTerm}`);
    }

    const params = {
        page         : page,
        per_page     : perPage,
        expand       : 'sponsor,owner,sponsor.company,sponsor.sponsorship,sponsor.sponsorship.type,badge_features,allowed_ticket_types,ticket_types_rules,ticket_types_rules.ticket_type',
        access_token : accessToken,
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
      createAction(REQUEST_SPONSOR_PROMOCODES),
      createAction(RECEIVE_SPONSOR_PROMOCODES),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsor-promo-codes`,
      authErrorHandler,
      {page, perPage, order, orderDir, term}
    )(params)(dispatch).then(() => {
          dispatch(stopLoading());
      }
    );
};

export const exportSponsorPromocodes = (term = null, order = 'order', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    const filename = `${currentSummit.name}-SponsorPromocodes.csv`;

    dispatch(startLoading());

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`sponsor_company_name@@${escapedTerm},tier_name@@${escapedTerm},code@@${escapedTerm}`);
    }

    const params = {
        expand       : '',
        access_token : accessToken,
    };

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order}`;
    }


    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsor-promo-codes/csv`, params, filename));
};

export const sendEmails = (recipientEmail = null) => async (dispatch, getState) => {
    const { currentSummitState, currentSponsorPromocodeListState } = getState();
    const {term, currentFlowEvent, selectedAll, selectedIds, excludedIds} = currentSponsorPromocodeListState;
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    let filter = [];

    const params = {
        access_token : accessToken,
    };

    if (!selectedAll && selectedIds.length > 0) {
        // we don't need the filter criteria, we have the ids
        filter.push(`id==${selectedIds.join('||')}`);
    } else {
        if (term) {
            const escapedTerm = escapeFilterValue(term);
            filter.push(`sponsor_company_name@@${escapedTerm},tier_name@@${escapedTerm},code@@${escapedTerm}`);
        }

        if (selectedAll && excludedIds.length > 0){
            filter.push(`not_id==${excludedIds.join('||')}`);
        }
    }

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    const payload =  {
        email_flow_event : currentFlowEvent
    };

    if(recipientEmail) {
        payload['test_email_recipient'] = recipientEmail;
    }

    dispatch(startLoading());

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("registration_invitation_list.resend_done"),
        type: 'success'
    };

    return putRequest(
      null,
      createAction(SEND_SPONSOR_PROMOCODES_EMAILS),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/sponsors/all/promo-codes/all/send`,
      payload,
      authErrorHandler
    )(params)(dispatch)
      .then((payload) => {
          dispatch(showMessage(
            success_message,
          ));
          dispatch(stopLoading());
          return payload;
      });
};
