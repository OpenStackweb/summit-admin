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
    authErrorHandler,
    getCSV,
    escapeFilterValue,
    postFile,
    fetchResponseHandler,
    fetchErrorHandler
} from "openstack-uicore-foundation/lib/utils/actions";
import {epochToMomentTimeZone} from "openstack-uicore-foundation/lib/utils/methods";
import {checkOrFilter, getAccessTokenSafely, isNumericString} from '../utils/methods';
import {getQAUsersBySummitEvent} from "./user-chat-roles-actions";
import {getAuditLog} from "./audit-log-actions";

export const REQUEST_EVENTS = 'REQUEST_EVENTS';
export const RECEIVE_EVENTS = 'RECEIVE_EVENTS';
export const REQUEST_EVENTS_FOR_OCCUPANCY = 'REQUEST_EVENTS_FOR_OCCUPANCY';
export const RECEIVE_EVENTS_FOR_OCCUPANCY = 'RECEIVE_EVENTS_FOR_OCCUPANCY';
export const REQUEST_CURRENT_EVENT_FOR_OCCUPANCY = 'REQUEST_CURRENT_EVENT_FOR_OCCUPANCY';
export const RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY = 'RECEIVE_CURRENT_EVENT_FOR_OCCUPANCY';
export const RECEIVE_EVENT = 'RECEIVE_EVENT';
export const RESET_EVENT_FORM = 'RESET_EVENT_FORM';
export const UPDATE_EVENT = 'UPDATE_EVENT';
export const EVENT_UPDATED = 'EVENT_UPDATED';
export const EVENT_ADDED = 'EVENT_ADDED';
export const EVENT_PUBLISHED = 'EVENT_PUBLISHED';
export const EVENT_DELETED = 'EVENT_DELETED';
export const EVENT_CLONED = 'EVENT_CLONED';
export const FILE_ATTACHED = 'FILE_ATTACHED';
export const IMAGE_ATTACHED = 'IMAGE_ATTACHED';
export const IMAGE_DELETED = 'IMAGE_DELETED';
export const RECEIVE_PROXIMITY_EVENTS = 'RECEIVE_PROXIMITY_EVENTS';
export const EVENTS_IMPORTED = 'EVENTS_IMPORTED';
export const IMPORT_FROM_MUX = 'IMPORT_FROM_MUX';
export const REQUEST_EVENT_FEEDBACK = 'REQUEST_EVENT_FEEDBACK';
export const RECEIVE_EVENT_FEEDBACK = 'RECEIVE_EVENT_FEEDBACK';
export const EVENT_FEEDBACK_DELETED = 'EVENT_FEEDBACK_DELETED';
export const RECEIVE_ACTION_TYPES = 'RECEIVE_ACTION_TYPES';
export const RECEIVE_EXTRA_QUESTIONS = 'RECEIVE_EXTRA_QUESTIONS';
export const FLAG_CHANGED = 'FLAG_CHANGED';
export const REQUEST_EVENT_COMMENTS = 'REQUEST_EVENT_COMMENTS';
export const RECEIVE_EVENT_COMMENTS = 'RECEIVE_EVENT_COMMENTS';
export const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM';

export const ATTENDEES_EXPECTED_LEARNT = 'attendees_expected_learnt';
export const ATTENDING_MEDIA = 'attending_media';
export const LEVEL = 'level';
export const SOCIAL_DESCRIPTION = 'social_description';

const fieldsBoundToQuestions = [ATTENDEES_EXPECTED_LEARNT, ATTENDING_MEDIA, LEVEL, SOCIAL_DESCRIPTION];

export const getEvents = (term = null, page = 1, perPage = 10, order = 'id', orderDir = 1, filters = {}, extraColumns = []) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const summitTZ = currentSummit.time_zone.name;

    dispatch(startLoading());

    const filter = parseFilters(filters, term);

    const params = {
        expand: 'speakers,type,created_by,track,sponsors,selection_plan,location,tags,media_uploads,media_uploads.media_upload_type',
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
        params['order'] = (order === 'created_by_fullname') ? `${orderDirSign}${order},${orderDirSign}created_by_email` : `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_EVENTS),
        createAction(RECEIVE_EVENTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events`,
        authErrorHandler,
        {order, orderDir, term, summitTZ, filters, extraColumns}
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
};

export const getEventsForOccupancy = (term = null, roomId = null, currentEvents = false, page = 1, perPage = 10, order = 'start_date', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    const summitTZ = currentSummit.time_zone.name;
    let endPoint = 'events/published';

    dispatch(startLoading());

    // search
    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm},speaker=@${escapedTerm}`);
    }

    // room filter
    if (roomId != null) {
        endPoint = `locations/${roomId}/${endPoint}`;
    }

    // only current events
    if (currentEvents) {
        const now = moment().tz(summitTZ).unix(); // now in summit timezone converted to epoch
        const from_date = now - 900; // minus 15min
        const to_date = now + 900; // plus 15min
        filter.push(`start_date<=${to_date}`);
        filter.push(`end_date>=${from_date}`);
    }

    const params = {
        expand: 'speakers, location',
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

export const getEventsForOccupancyCSV = (term = null, roomId = null, currentEvents = false, order = 'start_date', orderDir = 1) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    const summitTZ = currentSummit.time_zone.name;

    dispatch(startLoading());

    filter.push(`published==1`);

    // search
    if (term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(`title=@${escapedTerm},speaker=@${escapedTerm}`);
    }

    // room filter
    if (roomId != null) {
        filter.push(`location_id==${roomId}`);
    }

    // only current events
    if (currentEvents) {
        const now = moment().tz(summitTZ).unix(); // now in summit timezone converted to epoch
        const from_date = now - 900; // minus 15min
        const to_date = now + 900; // plus 15min
        filter.push(`start_date<=${to_date}`);
        filter.push(`end_date>=${from_date}`);
    }

    const params = {
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

    params['fields'] = 'start_date,title,occupancy,location_name,speaker_fullnames'

    const filename = `summit-${currentSummit.slug}-rooms-occupancy.csv`;

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/csv`, params, filename));
};


export const getCurrentEventForOccupancy = (roomId, eventId = null) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filter = [];
    const summitTZ = currentSummit.time_zone.name;
    let endPoint = `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}`;

    dispatch(startLoading());

    const params = {
        expand: 'speakers, location',
        page: 1,
        per_page: 100,
        access_token: accessToken,
    };

    if (eventId) {
        endPoint = endPoint + `/events/${eventId}`;
    } else {
        endPoint = endPoint + `/locations/${roomId}/events/published`;

        // only current events
        const now = moment().tz(summitTZ).unix(); // now in summit timezone converted to epoch
        filter.push(`start_date<=${now}`);
        filter.push(`end_date>=${now}`);
        params['filter[]'] = filter;
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

export const getActionTypes = (selectionPlanId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const {currentSummit} = currentSummitState;
    const accessToken = await getAccessTokenSafely();

    const params = {
        per_page: 100,
        page: 1,
        order: '+order',
        access_token: accessToken,
    };

    return getRequest(
      null,
      createAction(RECEIVE_ACTION_TYPES),
      `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/allowed-presentation-action-types`,
      authErrorHandler
    )(params)(dispatch);
};

export const changeFlag = (isCompleted, eventId, typeId, selectionPlanId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const {currentSummit} = currentSummitState;
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    if (isCompleted) {
        putRequest(
          null,
          createAction(FLAG_CHANGED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/presentations/${eventId}/actions/${typeId}/complete`,
          {},
          authErrorHandler
        )(params)(dispatch).then((res) => {
            dispatch(stopLoading());
        });
    } else {
        deleteRequest(
          null,
          createAction(FLAG_CHANGED),
          `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/selection-plans/${selectionPlanId}/presentations/${eventId}/actions/${typeId}/incomplete`,
          {},
          authErrorHandler
        )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        });
    }
};

export const getEvent = (eventId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    if (!currentSummit.id) return;

    const params = {
        access_token: accessToken,
        expand: 'creator,speakers,moderator,sponsors,groups,type,type.allowed_media_upload_types,type.allowed_media_upload_types.type, slides, links, videos, media_uploads, tags, media_uploads.media_upload_type, media_uploads.media_upload_type.type,extra_questions,selection_plan,selection_plan.extra_questions, selection_plan.extra_questions.values,selection_plan.track_chair_rating_types,selection_plan.track_chair_rating_types.score_types,created_by,track_chair_scores_avg.ranking_type,actions'
    };

    dispatch(startLoading());
    return getRequest(
        null,
        createAction(RECEIVE_EVENT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}`,
        authErrorHandler
    )(params)(dispatch).then(({response}) => {
            getQAUsersBySummitEvent(currentSummit.id, eventId)(dispatch, getState)
            dispatch(stopLoading());
        }
    );
};

export const fetchExtraQuestions = async (summitId, selectionPlanId) => {
    const accessToken = await getAccessTokenSafely();

    return fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/selection-plans/${selectionPlanId}/extra-questions?access_token=${accessToken}&expand=values`)
        .then(fetchResponseHandler)
        .then((json) => json.data)
        .catch(fetchErrorHandler);
};

export const fetchExtraQuestionsAnswers = async (summitId, selectionPlanId, eventId) => {
    const accessToken = await getAccessTokenSafely();

    return fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/presentations/${eventId}/extra-questions?access_token=${accessToken}&filter=selection_plan_id==${selectionPlanId}`)
        .then(fetchResponseHandler)
        .then((json) => json.data)
        .catch(fetchErrorHandler);
};


export const resetEventForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_EVENT_FORM)({}));
};

export const saveEvent = (entity, publish) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const {type_id} = entity;
    const type = currentSummit.event_types.find((e) => e.id == type_id);

    dispatch(startLoading());

    const normalizedEntity = normalizeEvent(entity, type, currentSummit);

    const params = {
        access_token: accessToken,
        expand: 'creator,speakers,moderator,sponsors,groups,type,type.allowed_media_upload_types,type.allowed_media_upload_types.type, slides, links, videos, media_uploads, tags, media_uploads.media_upload_type, media_uploads.media_upload_type.type,extra_questions,selection_plan,selection_plan.track_chair_rating_types,selection_plan.track_chair_rating_types.score_types,selection_plan.extra_questions,selection_plan.extra_questions.values,created_by,track_chair_scores_avg.ranking_type,actions'
    };

    if (entity.id) {
        return putRequest(
            createAction(UPDATE_EVENT),
            createAction(EVENT_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                if (publish) {
                    dispatch(publishEvent(normalizedEntity));
                } else {
                    dispatch(showSuccessMessage(T.translate("edit_event.event_saved")));
                }
                dispatch(getAuditLog([`event_id==${entity.id}`, `class_name==SummitEventAuditLog`], null, 1, 10));
            });

    }

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_event.event_created"),
        type: 'success'
    };

    return postRequest(
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
                dispatch(publishEvent(normalizedEntity, () => {
                    history.push(`/app/summits/${currentSummit.id}/events/${payload.response.id}`)
                }));
            } else
                dispatch(showMessage(
                    success_message,
                    () => {
                        history.push(`/app/summits/${currentSummit.id}/events/${payload.response.id}`)
                    }
                ));
        });

}

export const cloneEvent = (entity, publish) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_event.event_cloned"),
        type: 'success'
    };

    return postRequest(
        null,
        createAction(EVENT_CLONED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}/clone`,
        null,
        authErrorHandler,
    )(params)(dispatch)
        .then((payload) => {
            dispatch(showMessage(
                success_message,
                () => {
                    history.push(`/app/summits/${currentSummit.id}/events/${payload.response.id}`)
                }
            ));
        });

}

export const saveOccupancy = (entity) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
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

const publishEvent = (entity, cb = null) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const {type_id} = entity;
    const type = currentSummit.event_types.find((e) => e.id == type_id);

    const params = {
        access_token: accessToken
    };

    putRequest(
        null,
        createAction(EVENT_PUBLISHED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${entity.id}/publish`,
        {
            location_id: entity.location_id,
            start_date: entity.start_date,
            end_date: entity.end_date,
        },
        authErrorHandler
    )(params)(dispatch)
        .then((payload) => {
            if (type.hasOwnProperty("allows_publishing_dates") &&
                type.allows_publishing_dates) {
                dispatch(checkProximityEvents(entity, true, cb));
            } else {
                const success_message = {
                    title: T.translate("general.done"),
                    html: T.translate("edit_event.saved_and_published"),
                    type: 'success'
                };
                dispatch(showMessage(success_message, cb));
            }
        });
}

export const checkProximityEvents = (event, showSuccessMessage = true, cb = null) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("edit_event.saved_and_published"),
        type: 'success'
    };

    if (!event.hasOwnProperty('speakers') || (event.speakers.length === 0 && (!event.moderator_speaker_id))) {
        if (showSuccessMessage) {
            dispatch(showMessage(success_message, cb));
        } else {
            dispatch(stopLoading());
        }
        return;
    }

    let speaker_ids = event.speakers.map(s => `speaker_id==${s}`);
    if (event.moderator_speaker_id) {
        speaker_ids.push(`speaker_id==${event.moderator_speaker_id}`)
    }

    const from_date = event.start_date - 5400; // minus 1.5hrs
    const to_date = event.end_date + 5400; // plus 1.5hrs

    const params = {
        page: 1,
        per_page: 100,
        access_token: accessToken,
        expand: 'location',
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

                const proximity_events = payload.response.data.filter(e => e.id !== event.id);

                if (proximity_events.length > 0) {
                    success_message.width = null;
                    success_message.type = 'warning';
                    success_message.html += `<br/><br/><strong>${T.translate("edit_event.proximity_alert")}</strong><br/>`;

                    for (var i in proximity_events) {
                        const prox_event = proximity_events[i];
                        const event_date = epochToMomentTimeZone(prox_event.start_date, currentSummit.time_zone_id).format('M/D h:mm a');
                        const locationName = prox_event.location ? prox_event.location.name : 'TBD';
                        success_message.html += `<small><i>"${prox_event.title}"</i> at ${event_date} in ${locationName}</small><br/>`;
                    }
                    dispatch(showMessage(success_message, cb));

                } else if (showSuccessMessage) {
                    dispatch(showMessage(success_message, cb));
                } else {
                    dispatch(stopLoading());
                }
            }
        );
}

export const attachFile = (entity, file, attr) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const normalizedEntity = normalizeEvent(entity);

    const params = {
        access_token: accessToken
    };

    const uploadFile = attr === 'file' ? uploadFile : uploadImage;

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

const uploadFile = (entity, file) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
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

const uploadImage = (entity, file) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
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
};

export const removeImage = (eventId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(IMAGE_DELETED)({}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}/image`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const normalizePresentationAllowedQuestionFields = (entity, summit) => {
    if (!entity.selection_plan_id) return;

    const selectionPlan = summit.selection_plans.find(sp => sp.id === entity.selection_plan_id);

    fieldsBoundToQuestions.forEach(item => {
        if (!selectionPlan.allowed_presentation_questions.includes(item)) {
            delete entity[item];
        }
    });
}

export const normalizeEvent = (entity, eventTypeConfig, summit) => {
    const normalizedEntity = {...entity};
    if (!normalizedEntity.start_date) delete normalizedEntity['start_date'];
    if (!normalizedEntity.end_date) delete normalizedEntity['end_date'];
    if (!normalizedEntity.rsvp_link) delete normalizedEntity['rsvp_link'];
    if (!normalizedEntity.rsvp_template_id) delete normalizedEntity['rsvp_template_id'];

    if (normalizedEntity.hasOwnProperty("links")) delete normalizedEntity['links'];

    if(normalizedEntity.hasOwnProperty("tags"))
        normalizedEntity.tags = normalizedEntity.tags.map((t) => {
            if (typeof t === 'string') return t;
            else return t.tag;
        });

    if(normalizedEntity.hasOwnProperty("sponsors"))
        normalizedEntity.sponsors = normalizedEntity.sponsors.map(s => s.id);

    if(normalizedEntity.hasOwnProperty("speakers"))
        normalizedEntity.speakers = normalizedEntity.speakers.map(s => s.id);

    if (normalizedEntity.hasOwnProperty("moderator") && normalizedEntity.moderator)
        normalizedEntity.moderator_speaker_id = normalizedEntity.moderator.id;
    else
        delete (normalizedEntity.moderator);

    if (normalizedEntity.hasOwnProperty("created_by")) {
        normalizedEntity.created_by_id = normalizedEntity.created_by?.id;
    }

    // if selection plan is null set is as 0 and remove the current selection plan
    if (normalizedEntity.hasOwnProperty("selection_plan_id") && normalizedEntity.selection_plan_id == null) {
        normalizedEntity.selection_plan_id = 0;
        delete (normalizedEntity.selection_plan)
    }

    if (eventTypeConfig) {

        if(!eventTypeConfig.use_speakers){
            delete (normalizedEntity.speakers);
        }
        if(!eventTypeConfig.use_sponsors){
            delete (normalizedEntity.sponsors);
        }
        if(!eventTypeConfig.use_moderator){
            delete (normalizedEntity.moderator);
            delete (normalizedEntity.moderator_speaker_id);
        }
        // if allows custom ordering in event type is false then remove custom_order
        if (!eventTypeConfig.allow_custom_ordering) {
            delete (normalizedEntity.custom_order)
        }
        // if allows location in event type is false then remove location_id
        if (!eventTypeConfig.allows_location) {
            delete (normalizedEntity.location_id)
        }
        // if allows publishing dates in event type is false then remove those dates
        if (!eventTypeConfig.allows_publishing_dates) {
            delete (normalizedEntity.start_date)
            delete (normalizedEntity.end_date)
            delete (normalizedEntity.duration)
        }
    }

    if (summit) normalizePresentationAllowedQuestionFields(normalizedEntity, summit);

    if(normalizedEntity.hasOwnProperty('extra_questions')){
        normalizedEntity.extra_questions = normalizedEntity.extra_questions.map((q) => ({ question_id : q.question_id, answer : q.value}))
    }

    return normalizedEntity;
}

export const deleteEvent = (eventId) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
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

export const exportEvents = (term = null, order = 'id', orderDir = 1, extraFilters = {}, extraColumns = []) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const filename = currentSummit.name + '-Activities.csv';
    const params = {
        access_token: accessToken
    };

    const filter = parseFilters(extraFilters, term);

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = (order === 'created_by_fullname') ? `${orderDirSign}${order},${orderDirSign}created_by_email` : `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/csv`, params, filename));

};

export const importMP4AssetsFromMUX = (MUXTokenId, MUXTokenSecret, emailTo) => async (dispatch, getState) => {

    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;
    const params = {
        access_token: accessToken
    };

    dispatch(startLoading());
    return postRequest(
        null,
        createAction(IMPORT_FROM_MUX),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/all/import/mux`,
        {
            mux_token_id: MUXTokenId,
            mux_token_secret: MUXTokenSecret,
            email_to: emailTo
        },
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            const success_message = {
                title: T.translate("general.done"),
                html: T.translate("event_list.mux_import_done"),
                type: 'success'
            };

            dispatch(stopLoading());
            dispatch(showMessage(
                success_message,
                () => {
                    window.location.reload();
                }
            ));
        });
}

export const importEventsCSV = (file, send_speaker_email) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    const params = {
        access_token: accessToken
    };

    postFile(
        null,
        createAction(EVENTS_IMPORTED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/csv`,
        file,
        {send_speaker_email: send_speaker_email},
        authErrorHandler,
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            window.location.reload();
        });
};

const parseFilters = (filters, term = null) => {
    const filter = [];

    if (filters.hasOwnProperty('event_type_capacity_filter') && Array.isArray(filters.event_type_capacity_filter)
        && filters.event_type_capacity_filter.length > 0) {
        if (filters.event_type_capacity_filter.includes('allows_attendee_vote_filter')) {
            filter.push('type_allows_attendee_vote==1');
        }
        if (filters.event_type_capacity_filter.includes('allows_location_filter')) {
            filter.push('type_allows_location==1');
        }
        if (filters.event_type_capacity_filter.includes('allows_publishing_dates_filter')) {
            filter.push('type_allows_publishing_dates==1');
        }
    }

    if (filters.hasOwnProperty('selection_plan_id_filter') && Array.isArray(filters.selection_plan_id_filter)
        && filters.selection_plan_id_filter.length > 0) {
        filter.push(`selection_plan_id==${filters.selection_plan_id_filter.join('||')}`);
    }

    if (filters.hasOwnProperty('location_id_filter') && Array.isArray(filters.location_id_filter)
        && filters.location_id_filter.length > 0) {
        filter.push(`location_id==${filters.location_id_filter.join('||')}`);
    }

    if (filters.hasOwnProperty('selection_status_filter') && Array.isArray(filters.selection_status_filter)
        && filters.selection_status_filter.length > 0) {
        filter.push(`selection_status==${filters.selection_status_filter.join('||')}`);
    }

    if (filters?.progress_flag?.length > 0) {
        filter.push(
          filters.progress_flag
            .map(pf => `actions==type_id==${pf}&&is_completed==1`)
            .join(','));
    }

    if (filters.hasOwnProperty('track_id_filter') && Array.isArray(filters.track_id_filter)
        && filters.track_id_filter.length > 0) {
        filter.push(`track_id==${filters.track_id_filter.join('||')}`);
    }

    if (filters.hasOwnProperty('event_type_id_filter') && Array.isArray(filters.event_type_id_filter)
        && filters.event_type_id_filter.length > 0) {
        filter.push(`event_type_id==${filters.event_type_id_filter.join('||')}`);
    }

    if (filters.hasOwnProperty('speaker_id_filter') && Array.isArray(filters.speaker_id_filter)
        && filters.speaker_id_filter.length > 0) {
        filter.push(`speaker_id==${filters.speaker_id_filter.map(speaker => speaker.id).join('||')}`);
    }

    if (filters.hasOwnProperty('level_filter') && Array.isArray(filters.level_filter)
        && filters.level_filter.length > 0) {
        filter.push(`level==${filters.level_filter.join('||')}`);
    }

    if (filters.hasOwnProperty('tags_filter') && Array.isArray(filters.tags_filter)
        && filters.tags_filter.length > 0) {
        filter.push(`tags==${filters.tags_filter.map(t => t.tag).join('||')}`);
    }

    if (filters.published_filter) {
        filter.push(`published==${filters.published_filter === 'published' ? '1' : '0'}`);
    }

    if (filters.start_date_filter && filters.start_date_filter.some(e => e !== null)) {
        if(filters.start_date_filter.every(e => e !== null )) {
            filter.push(`start_date[]${filters.start_date_filter[0]}&&${filters.start_date_filter[1]}`);
        } else {
            filter.push(`
            ${filters.start_date_filter[0] !== null ? 
                `start_date>=${filters.start_date_filter[0]}` : ``}
            ${filters.start_date_filter[1] !== null ? 
                `start_date<=${filters.start_date_filter[1]}` : ``}`);
        }
    }

    if (filters.end_date_filter && filters.end_date_filter.some(e => e !== null)) {
        if(filters.end_date_filter.every(e => e !== null )) {
            // between
            filter.push(`end_date[]${filters.end_date_filter[0]}&&${filters.end_date_filter[1]}`);
        } else {
            filter.push(`
            ${filters.end_date_filter[0] !== null ? 
                `end_date>=${filters.end_date_filter[0]}` : ``}
            ${filters.end_date_filter[1] !== null ? 
                `end_date<=${filters.end_date_filter[1]}` : ``}`);
        }
    }

    if (filters.duration_filter) {
        // multiply values to send the minutes in seconds
        if (Array.isArray(filters.duration_filter)) {
            // between
            filter.push(`duration[]${filters.duration_filter[0] * 60}&&${filters.duration_filter[1] * 60}`);
        } else {
            filter.push(`duration${filters.duration_filter.replace(/\d/g, '')}${filters.duration_filter.replace(/\D/g, '') * 60}`);
        }
    }

    if (filters.speakers_count_filter) {
        if (Array.isArray(filters.speakers_count_filter)) {
            // between
            filter.push(`speakers_count[]]${filters.speakers_count_filter[0]}&&${filters.speakers_count_filter[1]}`);
        } else {
            filter.push(`speakers_count${filters.speakers_count_filter}`)
        }
    }

    if (filters.hasOwnProperty('submitters') && Array.isArray(filters.submitters)
        && filters.submitters.length > 0) {
        // created by fullname | created_by_email
        filter.push(filters.submitters.map(
            (tt) => {
                const escapedFullName = escapeFilterValue(`${tt.first_name} ${tt.last_name}`);
                const escapedEmail = escapeFilterValue(tt.email);
                const fullNameFilter = `created_by_fullname==${escapedFullName}`;
                const emailFilter = `created_by_email==${escapedEmail}`;
                return [fullNameFilter, emailFilter];
            },
            ''
        ));
    }

    if(filters.hasOwnProperty('streaming_url') && filters.streaming_url) {
        const searchString = escapeFilterValue(filters.streaming_url);
        filter.push(`streaming_url@@${searchString}` )
    }
    if(filters.hasOwnProperty('meeting_url') && filters.meeting_url) {
        const searchString = escapeFilterValue(filters.meeting_url);
        filter.push(`meeting_url@@${searchString}` )
    }
    if(filters.hasOwnProperty('etherpad_link') && filters.etherpad_link) {
        const searchString = escapeFilterValue(filters.etherpad_link);
        filter.push(`etherpad_link@@${searchString}`)
    }

    if(filters.hasOwnProperty('streaming_type') && filters.streaming_type) {
        filter.push(`streaming_type==${filters.streaming_type}`)
    }

    if (filters.hasOwnProperty('speaker_company') && Array.isArray(filters.speaker_company)
        && filters.speaker_company.length > 0) {
        console.log('parse filter', filters.speaker_company)
        filter.push(
            `speaker_company==${filters.speaker_company.map(company => escapeFilterValue(company.name)).join('||')}`);
    }

    if (filters.hasOwnProperty('submitter_company') && Array.isArray(filters.submitter_company)
        && filters.submitter_company.length > 0) {
        filter.push(
            `created_by_company==${filters.submitter_company.map(company => escapeFilterValue(company.name)).join('||')}`);
    }

    if (filters.hasOwnProperty('sponsor') && Array.isArray(filters.sponsor)
        && filters.sponsor.length > 0) {
        filter.push(
            `sponsor==${filters.sponsor.map(sponsor => sponsor.name).join('||')}`);
    }

    if (filters.hasOwnProperty('all_companies') && Array.isArray(filters.all_companies)
        && filters.all_companies.length > 0) {
        const companies = filters.all_companies.map(company => escapeFilterValue(tt.name).join('||'));
        filter.push(`speaker_company==${companies},created_by_company==${companies},sponsor==${companies}`);
    }

    if(filters.is_public) {
        filter.push(`is_public==1`);
    }

    if(filters.is_activity) {
        filter.push(`is_activity==1`);
    }

    if (filters.hasOwnProperty('submission_status_filter') && Array.isArray(filters.submission_status_filter)
        && filters.submission_status_filter.length > 0) {
        filter.push(`submission_status==${filters.submission_status_filter.join('||')}`);
    }

    if (filters.hasOwnProperty('media_upload_with_type') && filters.media_upload_with_type.operator !== null &&
        Array.isArray(filters.media_upload_with_type.value) && filters.media_upload_with_type.value.length > 0) {
        const concatOperator = filters.media_upload_with_type.operator === 'has_media_upload_with_type==' ? '||' : '&&';
        filter.push(`${filters.media_upload_with_type.operator}` + filters.media_upload_with_type.value.map((v) => v.id).join(concatOperator));
    }

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        let searchString = `title=@${escapedTerm},` +
            `abstract=@${escapedTerm},` +
            `speaker_title=@${escapedTerm}`;

        if (isNumericString(term)) {
            searchString += `,id==${term}`;
        }

        filter.push(searchString);
    }

    return checkOrFilter(filters, filter);
}


export const getEventFeedback =
    (
        eventId,
        term = null,
        page = 1,
        perPage = 10,
        order = 'created',
        orderDir = 1) => async (dispatch, getState) => {
        const {currentSummitState} = getState();
        const accessToken = await getAccessTokenSafely();
        const {currentSummit} = currentSummitState;
        const summitTZ = currentSummit.time_zone_id;

        dispatch(startLoading());

        const filter = [];

        if (term) {
            const escapedTerm = escapeFilterValue(term);
            let searchString =
                `note=@${escapedTerm},` +
                `owner_full_name=@${escapedTerm},`;

            filter.push(searchString);
        }

        const params = {
            page: page,
            per_page: perPage,
            access_token: accessToken,
            expand: 'owner',
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
            createAction(REQUEST_EVENT_FEEDBACK),
            createAction(RECEIVE_EVENT_FEEDBACK),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}/feedback`,
            authErrorHandler,
            {order, orderDir, term, summitTZ}
        )(params)(dispatch).then((data) => {
                dispatch(stopLoading());
                return data.response;
            }
        );
    }

export const getEventFeedbackCSV =
    (
        eventId,
        term = null,
        order = 'created',
        orderDir = 1) => async (dispatch, getState) => {

        const {currentSummitState} = getState();
        const accessToken = await getAccessTokenSafely();
        const {currentSummit} = currentSummitState;

        dispatch(startLoading());

        const filter = [];

        if (term) {
            const escapedTerm = escapeFilterValue(term);
            let searchString =
                `note=@${escapedTerm},` +
                `owner_full_name=@${escapedTerm},`;

            filter.push(searchString);
        }

        const params = {
            access_token: accessToken,
            expand: 'owner',
        };

        if (filter.length > 0) {
            params['filter[]'] = filter;
        }

        // order
        if (order != null && orderDir != null) {
            if(order === 'created_date') order = 'created';
            const orderDirSign = (orderDir === 1) ? '+' : '-';
            params['order'] = `${orderDirSign}${order}`;
        }

        const filename = currentSummit.name + '-event-feedback.csv';

        dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}/feedback/csv`, params, filename));
}

export const deleteEventFeedback = (eventId, feedbackId) => async (dispatch, getState) => {
    const {currentSummitState} = getState();
    const accessToken = await getAccessTokenSafely();
    const {currentSummit} = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(EVENT_FEEDBACK_DELETED)({feedbackId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/events/${eventId}/feedback/${feedbackId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );

}

export const getEventComments = (
    eventId,
    term = null,
    page = 1,
    perPage = 10,
    order = 'id',
    orderDir = 1,
    filters = {}
    ) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely();
    const {currentSummitState} = getState();
    const {currentSummit} = currentSummitState;
    const summitTZ = currentSummit.time_zone_id;

    dispatch(startLoading());

    const filter = parseFilters(filters);

    if (term) {
        const escapedTerm = escapeFilterValue(term);
        let searchString =
            `body=@${escapedTerm},` +
            `creator_id==${escapedTerm},`;
        filter.push(searchString);
    }

    // `is_public==${escapedTerm},`;
    // `is_activity==${escapedTerm},`;

    const params = {
        page: page,
        per_page: perPage,
        access_token: accessToken,
        expand: 'creator',
    };

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    // order
    if (order != null && orderDir != null) {
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order'] = `${orderDirSign}${order === 'owner_full_name' ? 'creator_id' : order}`;
    }

    return getRequest(
        createAction(REQUEST_EVENT_COMMENTS),
        createAction(RECEIVE_EVENT_COMMENTS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/presentations/${eventId}/comments`,
        authErrorHandler,
        {order, orderDir, page, summitTZ}
    )(params)(dispatch).then((data) => {
            dispatch(stopLoading());
            return data.response;
        }
    );
}

export const queryEvents = _.debounce(async (summitId, input, callback) => {

    const accessToken = await getAccessTokenSafely();

    input = escapeFilterValue(input);

    fetch(`${window.API_BASE_URL}/api/v1/summits/${summitId}/events?filter=title=@${input}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            const options = [...json.data];

            callback(options);
        })
        .catch(fetchErrorHandler);
}, 500);

export const changeEventListSearchTerm = (term) => (dispatch, getState) => {
    dispatch(createAction(CHANGE_SEARCH_TERM)({term}));
}
