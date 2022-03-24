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
    getCSV,
    authErrorHandler,
    escapeFilterValue
} from 'openstack-uicore-foundation/lib/methods';

export const REQUEST_SPEAKERS       = 'REQUEST_SPEAKERS';
export const RECEIVE_SPEAKERS       = 'RECEIVE_SPEAKERS';
export const RECEIVE_SPEAKER        = 'RECEIVE_SPEAKER';
export const REQUEST_SPEAKER        = 'REQUEST_SPEAKER';
export const RESET_SPEAKER_FORM     = 'RESET_SPEAKER_FORM';
export const SPEAKER_DELETED        = 'SPEAKER_DELETED';
export const UPDATE_SPEAKER         = 'UPDATE_SPEAKER';
export const SPEAKER_UPDATED        = 'SPEAKER_UPDATED';
export const SPEAKER_ADDED          = 'SPEAKER_ADDED';
export const PIC_ATTACHED           = 'PIC_ATTACHED';
export const BIG_PIC_ATTACHED       = 'BIG_PIC_ATTACHED';
export const MERGE_SPEAKERS         = 'MERGE_SPEAKERS';
export const SPEAKER_MERGED         = 'SPEAKER_MERGED';

export const REQUEST_ATTENDANCES        = 'REQUEST_ATTENDANCES';
export const RECEIVE_ATTENDANCES        = 'RECEIVE_ATTENDANCES';
export const ATTENDANCE_DELETED         = 'ATTENDANCE_DELETED';
export const RECEIVE_ATTENDANCE         = 'RECEIVE_ATTENDANCE';
export const RESET_ATTENDANCE_FORM      = 'RESET_ATTENDANCE_FORM';
export const UPDATE_ATTENDANCE          = 'UPDATE_ATTENDANCE';
export const ATTENDANCE_UPDATED         = 'ATTENDANCE_UPDATED';
export const ATTENDANCE_ADDED           = 'ATTENDANCE_ADDED';
export const ATTENDANCE_EMAIL_SENT      = 'ATTENDANCE_EMAIL_SENT';

export const REQUEST_FEATURED_SPEAKERS      = 'REQUEST_FEATURED_SPEAKERS';
export const RECEIVE_FEATURED_SPEAKERS      = 'RECEIVE_FEATURED_SPEAKERS';
export const FEATURED_SPEAKER_DELETED       = 'FEATURED_SPEAKER_DELETED';
export const FEATURED_SPEAKER_ADDED         = 'FEATURED_SPEAKER_ADDED';
export const FEATURED_SPEAKER_ORDER_UPDATED = 'FEATURED_SPEAKER_ORDER_UPDATED';


export const getSpeakers = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;
    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`full_name=@${escapedTerm},first_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm}`);
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
        createAction(REQUEST_SPEAKERS),
        createAction(RECEIVE_SPEAKERS),
        `${window.API_BASE_URL}/api/v1/speakers`,
        authErrorHandler,
        {order, orderDir, page, term}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSpeaker = (speakerId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    return getRequest(
        null,
        createAction(RECEIVE_SPEAKER),
        `${window.API_BASE_URL}/api/v1/speakers/${speakerId}?access_token=${accessToken}&expand=member,presentations`,
        authErrorHandler
    )({})(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getSpeakerForMerge = (speakerId, speakerCol) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        expand: 'member,presentations'
    };

    return getRequest(
        createAction(REQUEST_SPEAKER),
        createAction(RECEIVE_SPEAKER),
        `${window.API_BASE_URL}/api/v1/speakers/${speakerId}`,
        authErrorHandler,
        {speakerCol}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteSpeaker = (speakerId) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(SPEAKER_DELETED)({speakerId}),
        `${window.API_BASE_URL}/api/v1/speakers/${speakerId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const mergeSpeakers = (speakers, selectedFields, changedFields) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const success_message = [
        T.translate("merge_speakers.merge_success"),
        T.translate("merge_speakers.merge_changes") + changedFields.join(', ') ,
        'success'
    ];

    putRequest(
        null,
        createAction(RESET_SPEAKER_FORM),
        `${window.API_BASE_URL}/api/v1/speakers/merge/${speakers[0].id}/${speakers[1].id}?access_token=${accessToken}`,
        selectedFields,
        authErrorHandler
    )({})(dispatch)
    .then((payload) => {
        dispatch(stopLoading());
        dispatch(showMessage(success_message, () => { history.push(`/app/speakers/${speakers[1].id}`) }));
    });
};

export const resetSpeakerForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPEAKER_FORM)({}));
};

export const saveSpeaker = (entity) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_UPDATED),
            `${window.API_BASE_URL}/api/v1/speakers/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_speaker.speaker_saved")));
            });

    } else {
        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_speaker.speaker_created"),
            type: 'success'
        };

        postRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_ADDED),
            `${window.API_BASE_URL}/api/v1/speakers?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/speakers`) }
                ));
            });
    }
}

export const attachPicture = (entity, file, picAttr) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const normalizedEntity = normalizeEntity(entity);

    const uploadFile = picAttr === 'profile' ? uploadProfilePic : uploadBigPic;

    if (entity.id) {
        dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_ADDED),
            `${window.API_BASE_URL}/api/v1/speakers?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(uploadFile(payload.response, file));
            }
        );
    }
}

const uploadProfilePic = (entity, file) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    postRequest(
        null,
        createAction(PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/photo?access_token=${accessToken}`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )({})(dispatch)
        .then(() => {
            dispatch(stopLoading());
            history.push(`/app/speakers/${entity.id}`)
        });
};

const uploadBigPic = (entity, file) => (dispatch, getState) => {
    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    postRequest(
        null,
        createAction(BIG_PIC_ATTACHED),
        `${window.API_BASE_URL}/api/v1/speakers/${entity.id}/big-photo?access_token=${accessToken}`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )({})(dispatch)
        .then(() => {
            dispatch(stopLoading());
            history.push(`/app/speakers/${entity.id}`)
        });
};

const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    if (normalizedEntity.member != null) {
        normalizedEntity.member_id = normalizedEntity.member.id;
        delete(normalizedEntity.email);
    } else {
        delete(normalizedEntity.member_id);
    }

    delete normalizedEntity['presentations'];
    delete normalizedEntity['all_presentations'];
    delete normalizedEntity['moderated_presentations'];
    delete normalizedEntity['all_moderated_presentations'];
    delete normalizedEntity['other_presentation_links'];
    delete normalizedEntity['affiliations'];
    delete normalizedEntity['gender'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['member'];
    delete normalizedEntity['summit_assistances'];
    delete normalizedEntity['code_redeemed'];
    delete normalizedEntity['active_involvements'];
    delete normalizedEntity['travel_preferences'];
    return normalizedEntity;
}



/****************************************************************************************************/
/* SPEAKER ATTENDANCE */
/****************************************************************************************************/

export const getAttendances = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = '1' ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`speaker=@${escapedTerm},speaker_email=@${escapedTerm},on_site_phone=@${escapedTerm}`);
    }

    const req_params = {
        order: order,
        orderDir: parseInt(orderDir),
        term: term
    }

    const params = {
        expand       : 'speaker',
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        orderDir = (orderDir === '1') ? '+' : '-';
        params['order']= `${orderDir}${order}`;
    }


    return getRequest(
        createAction(REQUEST_ATTENDANCES),
        createAction(RECEIVE_ATTENDANCES),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances`,
        authErrorHandler,
        req_params
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const deleteAttendance = (attendanceId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(ATTENDANCE_DELETED)({attendanceId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances/${attendanceId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const getAttendance = (attendanceId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        expand       : 'speaker',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDANCE),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances/${attendanceId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const resetAttendanceForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ATTENDANCE_FORM)({}));
};

export const saveAttendance = (entity) => (dispatch, getState) => {
    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    dispatch(startLoading());

    const normalizedEntity = normalizeAttendance(entity);

    if (entity.id) {

        putRequest(
            createAction(UPDATE_ATTENDANCE),
            createAction(ATTENDANCE_UPDATED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showSuccessMessage(T.translate("edit_speaker_attendance.attendance_saved")));
            });

    } else {

        const success_message = {
            title: T.translate("general.done"),
            html: T.translate("edit_speaker_attendance.attendance_created"),
            type: 'success'
        };


        postRequest(
            createAction(UPDATE_ATTENDANCE),
            createAction(ATTENDANCE_ADDED),
            `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/speaker-attendances/${payload.response.id}`) }
                ));
            });
    }
}

export const sendAttendanceEmail = (attendanceId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(ATTENDANCE_EMAIL_SENT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances/${attendanceId}/mail`,
        null,
        authErrorHandler
    )(params)(dispatch).then(
        (payload) => {
            dispatch(stopLoading());
            dispatch(showMessage(T.translate("general.done"), T.translate("general.email_sent"), 'success'));
        });
};

export const exportAttendances = ( term = null, order = 'code', orderDir = 1 ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-Speaker-Attendance.csv';
    const filter = [];
    const params = {
        access_token : accessToken
    };

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`speaker=@${escapedTerm},speaker_email=@${escapedTerm},on_site_phone=@${escapedTerm}`);
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers-assistances/csv`, params, filename));

};

const normalizeAttendance = (entity) => {
    const normalizedEntity = {...entity};

    normalizedEntity.speaker_id = (normalizedEntity.speaker != null) ? normalizedEntity.speaker.id : 0;

    delete normalizedEntity['speaker'];

    return normalizedEntity;

}

/****************************************************************************************************/
/* FEATURED SPEAKERS */
/****************************************************************************************************/

export const getFeaturedSpeakers = ( term = null, page = 1, perPage = 100 ) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(`full_name=@${escapedTerm},last_name=@${escapedTerm},email=@${escapedTerm}`);
    }

    const req_params = {
        term: term
    };

    const params = {
        expand       : 'speaker',
        page         : page,
        per_page     : perPage,
        order        : '+order',
        access_token : accessToken,
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    return getRequest(
        createAction(REQUEST_FEATURED_SPEAKERS),
        createAction(RECEIVE_FEATURED_SPEAKERS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/featured-speakers`,
        authErrorHandler,
        req_params
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addFeaturedSpeaker = (speaker) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return postRequest(
        null,
        createAction(FEATURED_SPEAKER_ADDED)({speaker}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/featured-speakers/${speaker.id}`,
        {},
        authErrorHandler,
        speaker
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const updateFeaturedSpeakerOrder = (speakers, speakerId, newOrder) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken
    };

    putRequest(
        null,
        createAction(FEATURED_SPEAKER_ORDER_UPDATED)(speakers),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/featured-speakers/${speakerId}`,
        { order : newOrder },
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeFeaturedSpeaker = (speakerId) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(FEATURED_SPEAKER_DELETED)({speakerId}),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/featured-speakers/${speakerId}`,
        null,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};