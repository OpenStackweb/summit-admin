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

import moment from 'moment-timezone';
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
    epochToMomentTimeZone,
    authErrorHandler,
    getCSV,
    escapeFilterValue
} from "openstack-uicore-foundation/lib/methods";

export const REQUEST_EVENTS                         = 'REQUEST_EVENTS';
export const RECEIVE_EVENTS                         = 'RECEIVE_EVENTS';
export const REQUEST_EVENTS_FOR_OCCUPANCY           = 'REQUEST_EVENTS_FOR_OCCUPANCY';
export const RECEIVE_EVENTS_FOR_OCCUPANCY           = 'RECEIVE_EVENTS_FOR_OCCUPANCY';
export const REQUEST_CURRENT_EVENT_FOR_OCCUPANCY    = 'REQUEST_CURRENT_EVENT_FOR_OCCUPANCY';
export const RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY    = 'RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY';
export const RECEIVE_EVENT                          = 'RECEIVE_EVENT';
export const RESET_EVENT_FORM                       = 'RESET_EVENT_FORM';
export const UPDATE_EVENT                           = 'UPDATE_EVENT';
export const EVENT_UPDATED                          = 'EVENT_UPDATED';
export const EVENT_ADDED                            = 'EVENT_ADDED';
export const EVENT_PUBLISHED                        = 'EVENT_PUBLISHED';
export const EVENT_DELETED                          = 'EVENT_DELETED';
export const FILE_ATTACHED                          = 'FILE_ATTACHED';
export const IMAGE_ATTACHED                         = 'IMAGE_ATTACHED';
export const RECEIVE_PROXIMITY_EVENTS               = 'RECEIVE_PROXIMITY_EVENTS';



export const getEvents = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];
    let summitTZ = currentSummit.time_zone.name;

    dispatch(startLoading());

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm},abstract=@${escapedTerm},tags=@${escapedTerm},speaker=@${escapedTerm},speaker_email=@${escapedTerm},id==${escapedTerm}`);
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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events`,
        authErrorHandler,
        {order, orderDir, term, summitTZ}
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
};

export const getEventsForOccupancy = ( term = null, roomId = null, currentEvents = false, page = 1, perPage = 10, order = 'start_date', orderDir = 1 ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];
    let summitTZ = currentSummit.time_zone.name;
    let endPoint = 'events/published';

    dispatch(startLoading());

    // search
    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm},speaker=@${escapedTerm}`);
    }

    // room filter
    if(roomId != null){
        endPoint = `locations/${roomId}/${endPoint}`;
    }

    // only current events
    if (currentEvents) {
        let now = moment().tz(summitTZ).unix(); // now in summit timezone converted to epoch
        let from_date = now - 900; // minus 15min
        let to_date = now + 900; // plus 15min
        filter.push(`start_date<=${to_date}`);
        filter.push(`end_date>=${from_date}`);
    }

    let params = {
        expand       : 'speakers, location',
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
        createAction(REQUEST_EVENTS_FOR_OCCUPANCY),
        createAction(RECEIVE_EVENTS_FOR_OCCUPANCY),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/${endPoint}`,
        authErrorHandler,
        {order, orderDir, term, roomId, currentEvents, summitTZ}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getCurrentEventForOccupancy = ( roomId, eventId = null ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];
    let summitTZ = currentSummit.time_zone.name;
    let endPoint = `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}`;

    dispatch(startLoading());

    let params = {
        expand       : 'speakers, location',
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
    };

    if (eventId) {
        endPoint = endPoint + `/events/${eventId}`;
    } else {
        endPoint = endPoint + `/locations/${roomId}/events/published`;

        // only current events
        let now = moment().tz(summitTZ).unix(); // now in summit timezone converted to epoch
        filter.push(`start_date<=${now}`);
        filter.push(`end_date>=${now}`);
        params['filter[]']= filter;
    }

    return getRequest(
        createAction(REQUEST_CURRENT_EVENT_FOR_OCCUPANCY),
        createAction(RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY),
        endPoint,
        authErrorHandler,
        {summitTZ}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getEvent = (eventId) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    if (!currentSummit.id) return;

    let params = {
        access_token: accessToken,
        expand: 'speakers, sponsors, groups, type, type.allowed_media_upload_types'
    };

    dispatch(startLoading());
    return getRequest(
        null,
        createAction(RECEIVE_EVENT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetEventForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_FORM)({}));
};

export const saveEvent = (entity, publish) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
        .then((payload) => {
            if (publish)
                dispatch(publishEvent(normalizedEntity));
            else
                dispatch(showSuccessMessage(T.translate("edit_event.event_saved")));
        });

    } else {

        let success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_event.event_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
        .then((payload) => {
            if (publish) {
                normalizedEntity.id = payload.response.id;
                dispatch(publishEvent(normalizedEntity));
            }
            else
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/events/${payload.response.id}`) }
                ));
        });
    }
}

export const saveOccupancy = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    putRequest(
        createAction(UPDATE_EVENT),
        createAction(EVENT_UPDATED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}`,
        {id: entity.id, occupancy: entity.occupancy},
        authErrorHandler,
        entity
    )(params)(dispatch);

}

const publishEvent = (entity) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    putRequest(
        null,
        createAction(EVENT_PUBLISHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}/publish`,
        {
            location_id : entity.location_id,
            start_date  : entity.start_date,
            end_date    : entity.end_date,
        },
        authErrorHandler
    )(params)(dispatch)
    .then((payload) => {
        dispatch(checkProximityEvents(entity));
    });
}

export const checkProximityEvents = (event) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_event.saved_and_published"),
        type: 'success'
    };

    if (!event.hasOwnProperty('speakers') || ( event.speakers.length === 0 && (!event.moderator_speaker_id))) {
        dispatch(showMessage(success_message));
        return;
    }

    let speaker_ids = event.speakers.map(s => `speaker_id==${s}`);
    if (event.moderator_speaker_id) {
        speaker_ids.push(`speaker_id==${event.moderator_speaker_id}`)
    }

    let from_date = event.start_date - 5400; // minus 1.5hrs
    let to_date = event.end_date + 5400; // plus 1.5hrs

    let params = {
        page         : 1,
        per_page     : 100,
        access_token : accessToken,
        expand       : 'location',
        'filter[]': [
            speaker_ids.join(','),
            `end_date>=${from_date}`,
            `start_date<=${to_date}`,
        ]
    };

    return getRequest(
        null,
        createAction(RECEIVE_PROXIMITY_EVENTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/published`,
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {

            let proximity_events = payload.response.data.filter( e => e.id != event.id );

            if (proximity_events.length > 0) {
                success_message.width = null;
                success_message.type = 'warning';
                success_message.html += `<br/><br/><strong>${T.translate("edit_event.proximity_alert")}</strong><br/>`;

                for(var i in proximity_events) {
                    let prox_event = proximity_events[i];
                    let event_date = epochToMomentTimeZone(prox_event.start_date, currentSummit.time_zone_id).format('M/D h:mm a');
                    success_message.html += `<small><i>"${prox_event.title}"</i> at ${event_date} in ${prox_event.location.name}</small><br/>`;
                }
            }


            dispatch(showMessage(success_message));
        }
    );
}

export const attachFile = (entity, file, attr) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let normalizedEntity = normalizeEntity(entity);

    let params = {
        access_token : accessToken
    };

    let uploadFile = attr === 'file' ? uploadFile : uploadImage;

    if (entity.id) {
        return dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(uploadFile(payload.response, file));
            });
    }
}

const uploadFile = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(FILE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}/attachment`,
        file,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
           history.push(`/app/summits/${currentSummit.id}/events/${entity.id}`);
           dispatch(stopLoading());
        });
}

const uploadImage = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(IMAGE_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}/image`,
        file,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            history.push(`/app/summits/${currentSummit.id}/events/${entity.id}`);
            dispatch(stopLoading());
        });
}

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};
    if (!normalizedEntity.start_date) delete normalizedEntity['start_date'];
    if (!normalizedEntity.end_date) delete normalizedEntity['end_date'];
    if (!normalizedEntity.rsvp_link) delete normalizedEntity['rsvp_link'];
    if (!normalizedEntity.rsvp_template_id) delete normalizedEntity['rsvp_template_id'];

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
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
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

    if(term){
        let escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm},abstract=@${escapedTerm},tags=@${escapedTerm},speaker=@${escapedTerm},speaker_email=@${escapedTerm},id==${escapedTerm}`);
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        let orderDirSign = (orderDir == 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/csv`, params, filename));

};

