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

import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const REQUEST_EVENTS                 = 'REQUEST_EVENTS';
export const RECEIVE_EVENTS                 = 'RECEIVE_EVENTS';
export const RECEIVE_EVENT                  = 'RECEIVE_EVENT';
export const RESET_EVENT_FORM               = 'RESET_EVENT_FORM';
export const UPDATE_EVENT                   = 'UPDATE_EVENT';
export const EVENT_UPDATED                  = 'EVENT_UPDATED';
export const EVENT_ADDED                    = 'EVENT_ADDED';
export const EVENT_PUBLISHED                = 'EVENT_PUBLISHED';
export const EVENT_DELETED                  = 'EVENT_DELETED';
export const FILE_ATTACHED                  = 'FILE_ATTACHED';


export const getEvents = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];
    let summitTZ = currentSummit.time_zone.name;

    dispatch(startLoading());

    if(term != null){
        filter.push(`title=@${term},abstract=@${term},tags=@${term},speaker=@${term},speaker_email=@${term},id==${term}`);
    }

    let params = {
        expand       : 'speakers, type',
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
        createAction(REQUEST_EVENTS),
        createAction(RECEIVE_EVENTS),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events`,
        authErrorHandler,
        {order, orderDir, term, summitTZ}
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getEvent = (eventId) => (dispatch, getState) => {
        let { loggedUserState, currentSummitState } = getState();
        let { accessToken }     = loggedUserState;
        let { currentSummit }   = currentSummitState;

        dispatch(startLoading());
        return getRequest(
            null,
            createAction(RECEIVE_EVENT),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}?access_token=${accessToken}&expand=speakers,sponsors,groups`,
            authErrorHandler
        )({})(dispatch).then(dispatch(stopLoading()));
};

export const resetEventForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_FORM)({}));
};

export const saveEvent = (entity, publish, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event.event_saved"),
            'success'
        ];

        if (publish) success_message[1] = T.translate("edit_event.saved_and_published");

        putRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
        .then((payload) => {
            if (publish)
                dispatch(publishEvent(normalizedEntity));
            else
                dispatch(showMessage(...success_message));
        });

    } else {
        let success_message = [
            T.translate("general.done"),
            T.translate("edit_event.event_created"),
            'success'
        ];

        postRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
        .then((payload) => {
            if (publish) {
                normalizedEntity.id = payload.response.id;
                dispatch(publishEvent(normalizedEntity));
            }
            else
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/events/${payload.response.id}`) }
                ));
        });
    }
}

const publishEvent = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let success_message = [
        T.translate("general.done"),
        T.translate("edit_event.saved_and_published"),
        'success'
    ];

    putRequest(
        null,
        createAction(EVENT_PUBLISHED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}/publish?access_token=${accessToken}`,
        {
            location_id : entity.location_id,
            start_date  : entity.start_date,
            end_date    : entity.end_date,
        },
        authErrorHandler
    )({})(dispatch)
    .then((payload) => {
        dispatch(showMessage(...success_message))
    });
}

export const attachFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    //dispatch(startLoading());

    if (entity.id) {
        return dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            null,
            createAction(EVENT_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}?access_token=${accessToken}`,
            entity,
            authErrorHandler
        )({})(dispatch).then(dispatch(uploadFile(entity, file))).then(dispatch(stopLoading()));
    }
}

const uploadFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    postRequest(
        null,
        createAction(FILE_ATTACHED),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${entity.id}/attachment?access_token=${accessToken}`,
        file,
        authErrorHandler
    )({})(dispatch)
}

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};
    if (!normalizedEntity.start_date) delete normalizedEntity['start_date'];
    if (!normalizedEntity.end_date) delete normalizedEntity['end_date'];

    normalizedEntity.tags = normalizedEntity.tags.map((t) => {
        if (typeof t == 'string') return t;
        else return t.tag;
    });
    normalizedEntity.sponsors = normalizedEntity.sponsors.map(s => s.id);
    normalizedEntity.speakers = normalizedEntity.speakers.map(s => s.id);

    if (Object.keys(normalizedEntity.moderator).length > 0)
        normalizedEntity.moderator_speaker_id = normalizedEntity.moderator.id;

    return normalizedEntity;

}

export const deleteEvent = (eventId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_DELETED)({eventId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/${eventId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const exportEvents = ( term = null, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];
    let filename = currentSummit.name + '-Events.csv';
    let params = {
        access_token : accessToken
    };

    if(term != null){
        filter.push(`title=@${term},abstract=@${term},tags=@${term},speaker=@${term},speaker_email=@${term},id==${term}`);
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${apiBaseUrl}/api/v1/summits/${currentSummit.id}/events/csv`, params, filename));

};