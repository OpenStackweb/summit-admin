import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const RECEIVE_SPEAKERS       = 'RECEIVE_SPEAKERS';
export const RECEIVE_SPEAKER        = 'RECEIVE_SPEAKER';
export const REQUEST_SPEAKER        = 'REQUEST_SPEAKER';
export const RESET_SPEAKER_FORM     = 'RESET_SPEAKER_FORM';
export const UPDATE_SPEAKER         = 'UPDATE_SPEAKER';
export const SPEAKER_UPDATED        = 'SPEAKER_UPDATED';
export const SPEAKER_ADDED          = 'SPEAKER_ADDED';
export const PIC_ATTACHED           = 'PIC_ATTACHED';
export const MERGE_SPEAKERS         = 'MERGE_SPEAKERS';
export const SPEAKER_MERGED         = 'SPEAKER_MERGED';
export const REQUEST_ATTENDANCES    = 'REQUEST_ATTENDANCES';
export const RECEIVE_ATTENDANCES    = 'RECEIVE_ATTENDANCES';
export const ATTENDANCE_DELETED     = 'ATTENDANCE_DELETED';
export const RECEIVE_ATTENDANCE     = 'RECEIVE_ATTENDANCE';
export const RESET_ATTENDANCE_FORM  = 'RESET_ATTENDANCE_FORM';
export const UPDATE_ATTENDANCE      = 'UPDATE_ATTENDANCE';
export const ATTENDANCE_UPDATED     = 'ATTENDANCE_UPDATED';
export const ATTENDANCE_ADDED       = 'ATTENDANCE_ADDED';
export const EMAIL_SENT             = 'EMAIL_SENT';


export const getSpeakers = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = '1' ) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`first_name=@${term},last_name=@${term},email=@${term}`);
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
        orderDir = (orderDir == '1') ? '+' : '-';
        params['order']= `${orderDir}${order}`;
    }


    return getRequest(
        null,
        createAction(RECEIVE_SPEAKERS),
        `${apiBaseUrl}/api/v1/speakers?access_token=${accessToken}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getSpeaker = (speakerId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    return getRequest(
        null,
        createAction(RECEIVE_SPEAKER),
        `${apiBaseUrl}/api/v1/speakers/${speakerId}?access_token=${accessToken}&expand=member,presentations`,
        authErrorHandler
    )({})(dispatch).then(dispatch(stopLoading()));
};

export const getSpeakerForMerge = (speakerId, speakerCol) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let params = {
        access_token : accessToken,
        expand: 'member,presentations'
    };

    return getRequest(
        createAction(REQUEST_SPEAKER),
        createAction(RECEIVE_SPEAKER),
        `${apiBaseUrl}/api/v1/speakers/${speakerId}`,
        authErrorHandler,
        {speakerCol}
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const mergeSpeakers = (speakers, selectedFields, changedFields, history) => (dispatch, getState) => {
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    let success_message = [
        'Success! Speakers merged.',
        'Changes made on: ' + changedFields.join(', ') ,
        'success',
        () => { history.push(`/app/speakers/${speakers[1].id}`) }
    ];

    putRequest(
        null,
        createAction(RESET_SPEAKER_FORM),
        `${apiBaseUrl}/api/v1/speakers/merge/${speakers[0].id}/${speakers[1].id}?access_token=${accessToken}`,
        selectedFields,
        authErrorHandler
    )({})(dispatch)
    .then((payload) => {
        dispatch(showMessage(...success_message));
    });
};

export const resetSpeakerForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_SPEAKER_FORM)({}));
};

export const saveSpeaker = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = ['Done!', 'Speaker saved successfully.', 'success'];

        putRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = ['Done!', 'Speaker created successfully.', 'success'];

        postRequest(
            createAction(UPDATE_SPEAKER),
            createAction(SPEAKER_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/speakers/${payload.response.id}`) }
                ));
            });
    }
}

export const attachPicture = (entity, file) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    //dispatch(startLoading());

    if (entity.id) {
        return dispatch(uploadFile(entity, file));
    } else {
        return postRequest(
            null,
            createAction(SPEAKER_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers/${entity.id}?access_token=${accessToken}`,
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
        createAction(PIC_ATTACHED),
        `${apiBaseUrl}/api/v1/speakers/${entity.id}/photo?access_token=${accessToken}`,
        file,
        authErrorHandler,
        {pic: entity.pic}
    )({})(dispatch)
}

const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    normalizedEntity.member_id = (normalizedEntity.member != null) ? normalizedEntity.member.id : 0;

    delete normalizedEntity['presentations'];
    delete normalizedEntity['all_presentations'];
    delete normalizedEntity['moderated_presentations'];
    delete normalizedEntity['all_moderated_presentations'];
    delete normalizedEntity['affiliations'];
    delete normalizedEntity['gender'];
    delete normalizedEntity['pic'];
    delete normalizedEntity['member'];
    delete normalizedEntity['summit_assistance'];
    delete normalizedEntity['code_redeemed'];

    return normalizedEntity;

}

export const getAttendances = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = '1' ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`speaker=@${term},speaker_email=@${term},on_site_phone=@${term}`);
    }

    let req_params = {
        order: order,
        orderDir: parseInt(orderDir)
    }

    let params = {
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
        orderDir = (orderDir == '1') ? '+' : '-';
        params['order']= `${orderDir}${order}`;
    }


    return getRequest(
        createAction(REQUEST_ATTENDANCES),
        createAction(RECEIVE_ATTENDANCES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers-assistances`,
        authErrorHandler,
        req_params
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const deleteAttendance = (attendanceId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return deleteRequest(
        null,
        createAction(ATTENDANCE_DELETED)({attendanceId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers-assistances/${attendanceId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getAttendance = (attendanceId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : 'speaker',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_ATTENDANCE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers-assistances/${attendanceId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetAttendanceForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ATTENDANCE_FORM)({}));
};

export const saveAttendance = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = ['Done!', 'Speaker Attendance saved successfully.', 'success'];

        putRequest(
            createAction(UPDATE_ATTENDANCE),
            createAction(ATTENDANCE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers-assistances/${entity.id}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = ['Done!', 'Speaker Attendance created successfully.', 'success'];


        postRequest(
            createAction(UPDATE_ATTENDANCE),
            createAction(ATTENDANCE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers-assistances`,
            normalizedEntity,
            authErrorHandler,
            entity
        )(params)(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/speakers/attendance/${payload.response.id}`) }
                ));
            });
    }
}

export const sendAttendanceEmail = (attendanceId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(EMAIL_SENT),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/speakers-assistances/${attendanceId}/mail`,
        authErrorHandler
    )(params)(dispatch).then(
        (payload) => {
            dispatch(stopLoading());
            dispatch(showMessage('Done!', 'Email sent successfully.', 'success'));
        });
};