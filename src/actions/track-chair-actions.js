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
import {
    getRequest,
    deleteRequest,
    postRequest,
    putRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler,
    escapeFilterValue,
    getCSV
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely, fetchResponseHandler, fetchErrorHandler} from '../utils/methods';

export const REQUEST_TRACK_CHAIRS       = 'REQUEST_TRACK_CHAIRS';
export const RECEIVE_TRACK_CHAIRS       = 'RECEIVE_TRACK_CHAIRS';
export const TRACK_CHAIR_UPDATED        = 'TRACK_CHAIR_UPDATED';
export const TRACK_CHAIR_ADDED          = 'TRACK_CHAIR_ADDED';
export const TRACK_CHAIR_DELETED        = 'TRACK_CHAIR_DELETED';

export const RECEIVE_PROGRESS_FLAGS       = 'RECEIVE_PROGRESS_FLAGS';
export const PROGRESS_FLAG_UPDATED        = 'PROGRESS_FLAG_UPDATED';
export const PROGRESS_FLAG_ADDED          = 'PROGRESS_FLAG_ADDED';
export const PROGRESS_FLAG_DELETED        = 'PROGRESS_FLAG_DELETED';
export const PROGRESS_FLAG_REORDERED      = 'PROGRESS_FLAG_REORDERED';

const callDelay = 500; //miliseconds

export const getTrackChairs = (trackId = null, term = '', page = 1, perPage = 10, order = 'id', orderDir = 1 ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filter = [];

    dispatch(startLoading());

    if (term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`member_full_name=@${escapedTerm},member_last_name=@${escapedTerm},member_email=@${escapedTerm}`);
    }

    if (trackId){
        filter.push(`track_id==${trackId}`);
    }

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand       : 'member,categories'
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null) {
        let orderCol = '';

        switch (order) {
            case 'name':
                orderCol = 'member_first_name';
                break;
            case 'trackName':
                orderCol = 'track';
                break;
            default:
                orderCol = order;
        }

        const orderDirSign = (orderDir === 1) ? '' : '-';
        params['order']= `${orderDirSign}${orderCol}`;
    }

    return getRequest(
        createAction(REQUEST_TRACK_CHAIRS),
        createAction(RECEIVE_TRACK_CHAIRS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-chairs`,
        authErrorHandler,
        {trackId, term, order, orderDir}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addTrackChair = (member, trackIds) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand       : 'member,categories'
    };

    return postRequest(
        null,
        createAction(TRACK_CHAIR_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-chairs`,
        {member_id: member.id, categories: trackIds},
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
           dispatch(stopLoading());
        });
};

export const saveTrackChair = (trackChairId, trackIds) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand       : 'member,categories'
    };

    return putRequest(
        null,
        createAction(TRACK_CHAIR_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-chairs/${trackChairId}`,
        {categories: trackIds},
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const deleteTrackChair = (trackChairId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(TRACK_CHAIR_DELETED)({trackChairId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-chairs/${trackChairId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const exportTrackChairs = ( ) => async (dispatch, getState) => {

    const { currentSummitState, trackChairListState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const {trackId, term, order, orderDir} = trackChairListState;

    const filename = currentSummit.name + '-TrackChairs.csv';
    const filter = [];


    if (term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`member_full_name=@${escapedTerm},member_last_name=@${escapedTerm},member_email=@${escapedTerm}`);
    }

    if (trackId){
        filter.push(`track_id==${trackId}`);
    }

    const params = {
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null) {
        let orderCol = '';

        switch (order) {
            case 'name':
                orderCol = 'member_first_name';
                break;
            case 'trackName':
                orderCol = 'track';
                break;
            default:
                orderCol = order;
        }

        const orderDirSign = (orderDir === 1) ? '' : '-';
        params['order']= `${orderDirSign}${orderCol}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/track-chairs/csv`, params, filename));

};



/************************************************************************************************************/
/*                          PROGRESS FLAGS                                                                  */
/************************************************************************************************************/


export const getProgressFlags = () => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_PROGRESS_FLAGS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentation-action-types`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const querySummitProgressFlags = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessTokenSafely();
    input = escapeFilterValue(input);
    let filters = encodeURIComponent(`label=@${input}`);

    fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/presentation-action-types?filter=${filters}&&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data.map(d => ({...d, name: d.label}))];

            callback(options);
        })
        .catch(fetchErrorHandler);

}, callDelay);

export const addProgressFlag = (flagName) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return postRequest(
        null,
        createAction(PROGRESS_FLAG_ADDED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentation-action-types`,
        {label: flagName},
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const saveProgressFlag = (progressFlagId, flag) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return putRequest(
        null,
        createAction(PROGRESS_FLAG_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentation-action-types/${progressFlagId}`,
        flag,
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const deleteProgressFlag = (progressFlagId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(PROGRESS_FLAG_DELETED)({progressFlagId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentation-action-types/${progressFlagId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const reorderProgressFlags = (flags, progressFlagId, newOrder) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return putRequest(
        null,
        createAction(PROGRESS_FLAG_REORDERED)(flags),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentation-action-types/${progressFlagId}`,
        {order: newOrder},
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};