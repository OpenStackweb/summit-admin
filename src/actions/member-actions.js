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
    getCSV,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler
} from "openstack-uicore-foundation/lib/methods";
import moment from "moment-timezone";


export const REQUEST_MEMBERS          = 'REQUEST_MEMBERS';
export const RECEIVE_MEMBERS          = 'RECEIVE_MEMBERS';
export const AFFILIATION_SAVED        = 'AFFILIATION_SAVED';
export const AFFILIATION_DELETED      = 'AFFILIATION_DELETED';
export const AFFILIATION_ADDED        = 'AFFILIATION_ADDED';
export const ORGANIZATION_ADDED       = 'ORGANIZATION_ADDED';


export const getMembers = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term){
        filter.push(`schedule_event_id==${term}`);
    }

    let params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }


    return getRequest(
        createAction(REQUEST_MEMBERS),
        createAction(RECEIVE_MEMBERS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/members`,
        authErrorHandler,
        {page, perPage, order, orderDir, term}
        )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getMembersForEventCSV = ( event ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let momentStartDate = moment(event.startDate).tz(currentSummit.time_zone_id);
    let momentEndDate = moment(event.endDate).tz(currentSummit.time_zone_id);

    let date = momentStartDate.format('dddd Do');
    let time = momentStartDate.format('h:mm a') + ' - ' + momentEndDate.format('h:mm a');
    let roomName = (event.location && event.location.venueroom) ? event.location.venueroom.name : 'N/A';

    let filename = `Room ${roomName}-Event ${event.id}-Attendees.csv`;
    let header = `Room "${roomName}",${date},${time},"${event.title}"`;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        columns: 'id,first_name,last_name,email,affiliations',
        'filter[]': [`schedule_event_id==${event.id}`]
    };


    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/members/csv`, params, filename, header));
};




/******************************  AFFILIATIONS **************************************************/


export const addOrganization = (organization, callback) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    dispatch(startLoading());

    postRequest(
        null,
        createAction(ORGANIZATION_ADDED),
        `${window.API_BASE_URL}/api/v1/organizations`,
        {name: organization},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
        callback(payload.response);
    });

}


export const addAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'organization'
    };

    let normalizedEntity = normalizeEntity(affiliation);

    postRequest(
        null,
        createAction(AFFILIATION_ADDED),
        `${window.API_BASE_URL}/api/v1/members/${affiliation.owner_id}/affiliations`,
        normalizedEntity,
        authErrorHandler,
        affiliation
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
    });

}

export const saveAffiliation = (affiliation) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());


    let params = {
        access_token : accessToken,
    };

    let normalizedEntity = normalizeEntity(affiliation);

    putRequest(
        null,
        createAction(AFFILIATION_SAVED),
        `${window.API_BASE_URL}/api/v1/members/${affiliation.owner_id}/affiliations/${affiliation.id}`,
        normalizedEntity,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
    });

}

export const deleteAffiliation = (ownerId, affiliationId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(AFFILIATION_DELETED)({affiliationId}),
        `${window.API_BASE_URL}/api/v1/members/${ownerId}/affiliations/${affiliationId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (!normalizedEntity.end_date) delete(normalizedEntity['end_date']);

    normalizedEntity.organization_id = (normalizedEntity.organization != null) ? normalizedEntity.organization.id : 0;
    delete(normalizedEntity['organization']);

    return normalizedEntity;

}
