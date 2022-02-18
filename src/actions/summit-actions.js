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
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_SUMMIT           = 'REQUEST_SUMMIT';
export const RECEIVE_SUMMIT           = 'RECEIVE_SUMMIT';
export const REQUEST_SUMMITS          = 'REQUEST_SUMMITS';
export const RECEIVE_SUMMITS          = 'RECEIVE_SUMMITS';
export const REQUEST_ALL_SUMMITS      = 'REQUEST_ALL_SUMMITS';
export const RECEIVE_ALL_SUMMITS      = 'RECEIVE_ALL_SUMMITS';
export const SET_CURRENT_SUMMIT       = 'SET_CURRENT_SUMMIT';
export const RESET_SUMMIT_FORM        = 'RESET_SUMMIT_FORM';
export const UPDATE_SUMMIT            = 'UPDATE_SUMMIT';
export const SUMMIT_UPDATED           = 'SUMMIT_UPDATED';
export const SUMMIT_ADDED             = 'SUMMIT_ADDED';
export const SUMMIT_DELETED           = 'SUMMIT_DELETED';
export const SUMMIT_LOGO_ATTACHED     = 'SUMMIT_LOGO_ATTACHED';
export const SUMMIT_LOGO_DELETED      = 'SUMMIT_LOGO_DELETED';

export const getSummitById = (summitId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;
    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'event_types,tracks,track_groups,values,locations,locations.rooms,registration_stats'
    };

    return getRequest(
        createAction(REQUEST_SUMMIT),
        createAction(RECEIVE_SUMMIT),
        `${window.API_BASE_URL}/api/v2/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const setCurrentSummit = (summit) => (dispatch, getState) =>
{
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    if (summit) {
        dispatch(startLoading());

        const params = {
            access_token : accessToken,
            expand: 'event_types,tracks,locations,locations.rooms,registration_stats'
        };

        return getRequest(
            null,
            createAction(SET_CURRENT_SUMMIT),
            `${window.API_BASE_URL}/api/v1/summits/${summit.id}`,
            authErrorHandler
        )(params)(dispatch).then(() => {
                dispatch(stopLoading());

                if(summit)
                    history.push(`/app/summits/${summit.id}/dashboard`);
            }
        );
    } else {
        dispatch(createAction(RESET_SUMMIT_FORM)({}));
    }

}

export const loadSummits = (page = 1, perPage = 10) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'none',
        relations: 'none',
        page: page,
        per_page: perPage,
        order: '-start_date',
    };

    getRequest(
        createAction(REQUEST_SUMMITS),
        createAction(RECEIVE_SUMMITS),
        `${window.API_BASE_URL}/api/v1/summits/all`,
        authErrorHandler
    )(params)(dispatch, getState).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const getAllSummits = () => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken,
        expand: 'none',
        relations: 'none',
        page: 1,
        per_page: 100,
        order: '-start_date',
    };

    getRequest(
        createAction(REQUEST_ALL_SUMMITS),
        createAction(RECEIVE_ALL_SUMMITS),
        `${window.API_BASE_URL}/api/v1/summits/all`,
        authErrorHandler
    )(params)(dispatch, getState);
}

export const resetSummitForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SUMMIT_FORM)({}));
};

export const saveSummit = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    const params = {
        access_token : accessToken
    };

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SUMMIT),
            createAction(SUMMIT_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_summit.summit_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_summit.summit_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SUMMIT),
            createAction(SUMMIT_ADDED),
            `${window.API_BASE_URL}/api/v1/summits`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${payload.response.id}`) }
                ));
            });
    }
}

export const deleteSummit = (summitId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SUMMIT_DELETED)({summitId}),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


export const attachLogo = (entity, file) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {
        dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_SUMMIT),
            createAction(SUMMIT_ADDED),
            `${window.API_BASE_URL}/api/v1/summits`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                    dispatch(uploadFile(payload.response, file));
                }
            );
    }
}

const uploadFile = (entity, file) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    const params = {
        access_token : accessToken
    };

    postRequest(
        null,
        createAction(SUMMIT_LOGO_ATTACHED),
        `${window.API_BASE_URL}/api/v1/summits/${entity.id}/logo`,
        file,
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
        });
};

export const deleteLogo = () => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(SUMMIT_LOGO_DELETED),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/logo`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};


const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    delete(normalizedEntity['id']);
    delete(normalizedEntity['created']);
    delete(normalizedEntity['last_edited']);
    delete(normalizedEntity['logo']);
    delete(normalizedEntity['attendees_count']);
    delete(normalizedEntity['event_types']);
    delete(normalizedEntity['locations']);
    delete(normalizedEntity['max_submission_allowed_per_user']);
    delete(normalizedEntity['page_url']);
    delete(normalizedEntity['presentation_voters_count']);
    delete(normalizedEntity['presentation_votes_count']);
    delete(normalizedEntity['presentations_submitted_count']);
    delete(normalizedEntity['published_events_count']);
    delete(normalizedEntity['schedule_event_detail_url']);
    delete(normalizedEntity['schedule_page_url']);
    delete(normalizedEntity['speaker_announcement_email_accepted_alternate_count']);
    delete(normalizedEntity['speaker_announcement_email_accepted_count']);
    delete(normalizedEntity['speaker_announcement_email_accepted_rejected_count']);
    delete(normalizedEntity['speaker_announcement_email_alternate_count']);
    delete(normalizedEntity['speaker_announcement_email_alternate_rejected_count']);
    delete(normalizedEntity['speaker_announcement_email_rejected_count']);
    delete(normalizedEntity['speakers_count']);
    delete(normalizedEntity['ticket_types']);
    delete(normalizedEntity['time_zone']);
    delete(normalizedEntity['timestamp']);
    delete(normalizedEntity['tracks']);
    delete(normalizedEntity['wifi_connections']);

    if (!normalizedEntity['registration_begin_date']) normalizedEntity['registration_begin_date'] = null;
    if (!normalizedEntity['registration_end_date']) normalizedEntity['registration_end_date'] = null;
    if (!normalizedEntity['schedule_start_date']) normalizedEntity['schedule_start_date'] = null;
    if (!normalizedEntity['start_showing_venues_date']) normalizedEntity['start_showing_venues_date'] = null;
    if (!normalizedEntity['start_date']) normalizedEntity['start_date'] = null;
    if (!normalizedEntity['end_date']) normalizedEntity['end_date'] = null;

    if (!normalizedEntity['meeting_room_booking_max_allowed'])
        delete(normalizedEntity['meeting_room_booking_max_allowed']);

    if (!normalizedEntity['meeting_room_booking_slot_length'])
        delete(normalizedEntity['meeting_room_booking_slot_length']);

    if (normalizedEntity['api_feed_type'] === 'none')
        normalizedEntity['api_feed_type'] = '';

    if (normalizedEntity['external_registration_feed_type'] === 'none')
        normalizedEntity['external_registration_feed_type'] = '';

    return normalizedEntity;

}
