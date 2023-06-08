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
} from 'openstack-uicore-foundation/lib/utils/actions';
import {SPEAKERS_PROMO_CODE_CLASS_NAME, SPEAKERS_DISCOUNT_CODE_CLASS_NAME} from './promocode-specification-actions';
import {
    EXISTING_SPEAKERS_PROMO_CODE, 
    EXISTING_SPEAKERS_DISCOUNT_CODE,
    AUTO_GENERATED_SPEAKERS_PROMO_CODE,
    AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE
} from './promocode-actions';
import {getAccessTokenSafely} from '../utils/methods';

export const INIT_SPEAKERS_LIST_PARAMS  = 'INIT_SPEAKERS_LIST_PARAMS';

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

export const REQUEST_SPEAKERS_BY_SUMMIT     = 'REQUEST_SPEAKERS_BY_SUMMIT';
export const RECEIVE_SPEAKERS_BY_SUMMIT     = 'RECEIVE_SPEAKERS_BY_SUMMIT';
export const SELECT_SUMMIT_SPEAKER          = 'SELECT_SUMMIT_SPEAKER';
export const UNSELECT_SUMMIT_SPEAKER        = 'UNSELECT_SUMMIT_SPEAKER';
export const SELECT_ALL_SUMMIT_SPEAKERS     = 'SELECT_ALL_SUMMIT_SPEAKERS';
export const UNSELECT_ALL_SUMMIT_SPEAKERS   = 'UNSELECT_ALL_SUMMIT_SPEAKERS';
export const SEND_SPEAKERS_EMAILS           = 'SEND_SPEAKERS_EMAILS';
export const SET_SPEAKERS_CURRENT_FLOW_EVENT= 'SET_SPEAKERS_CURRENT_FLOW_EVENT';

export const initSpeakersList = () => async (dispatch, getState) => {
    dispatch(createAction(INIT_SPEAKERS_LIST_PARAMS)());
}

export const getSpeakers = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = 1 ) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();
    const filter = [];

    dispatch(startLoading());

    if(term) {
        let filterTerm = buildTermFilter(term, false);

        filter.push(
            filterTerm.join(',')
        );
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

export const getSpeaker = (speakerId) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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

export const getSpeakerForMerge = (speakerId, speakerCol) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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

export const deleteSpeaker = (speakerId) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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

export const mergeSpeakers = (speakers, selectedFields, changedFields) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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
    .then(() => {
        dispatch(stopLoading());
        dispatch(showMessage(success_message, () => { history.push(`/app/speakers/${speakers[1].id}`) }));
    });
};

export const resetSpeakerForm = () => (dispatch) => {
    dispatch(createAction(RESET_SPEAKER_FORM)({}));
};

export const saveSpeaker = (entity) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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
            .then(() => {
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
            .then(() => {
                dispatch(showMessage(
                    success_message,
                    () => { history.push(`/app/speakers`) }
                ));
            });
    }
}

export const attachPicture = (entity, file, picAttr) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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

const uploadProfilePic = (entity, file) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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

const uploadBigPic = (entity, file) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

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

export const getAttendances = ( term = null, page = 1, perPage = 10, order = 'id', orderDir = '1' ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

export const deleteAttendance = (attendanceId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

export const getAttendance = (attendanceId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

export const resetAttendanceForm = () => (dispatch) => {
    dispatch(createAction(RESET_ATTENDANCE_FORM)({}));
};

export const saveAttendance = (entity) => async (dispatch, getState) => {
    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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
            .then(() => {
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

export const sendAttendanceEmail = (attendanceId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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
        () => {
            dispatch(stopLoading());
            dispatch(showMessage(T.translate("general.done"), T.translate("general.email_sent"), 'success'));
        });
};

export const exportAttendances = ( term = null, order = 'code', orderDir = 1 ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

export const getFeaturedSpeakers = ( term = null, page = 1, perPage = 100 ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const filter = [];

    dispatch(startLoading());

    if(term){
        const escapedTerm = escapeFilterValue(term);
        filter.push(
            [
                `full_name=@${escapedTerm}`,
                `last_name=@${escapedTerm}`,
                `email=@${escapedTerm}`,
                `id==${escapedTerm}`,
                `member_id==${escapedTerm}`,
                `member_user_external_id==${escapedTerm}`,
            ].join(',')
        );
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

export const addFeaturedSpeaker = (speaker) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

export const updateFeaturedSpeakerOrder = (speakers, speakerId, newOrder) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

export const removeFeaturedSpeaker = (speakerId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
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

/****************************************************************************************************/
/* SPEAKERS BY SUMMIT */
/****************************************************************************************************/

export const getSpeakersBySummit = (term = null, page = 1, perPage = 10, order = 'full_name', orderDir = 1, filters = {}) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    
    const filter = parseFilters(filters);

    dispatch(startLoading());

    if(term) {
        const escapedTerm = escapeFilterValue(term);

        let filterTerm =  [
            `full_name@@${escapedTerm}`,
            `email=@${escapedTerm}`,
            `presentations_title=@${escapedTerm}`,
            `presentations_abstract=@${escapedTerm}`,
            `presentations_submitter_full_name@@${escapedTerm}`,
            `presentations_submitter_email=@${escapedTerm}`
        ];

        if(parseInt(escapedTerm)){
            const filterTermId = parseInt(escapedTerm);
            filterTerm = [...filterTerm, ...[`id==${filterTermId}`,
                `member_id==${filterTermId}`,
                `member_user_external_id==${filterTermId}`]]
        }

        filter.push(
            filterTerm.join(',')
        );
    }

    const params = {
        page         : page,
        per_page     : perPage,
        access_token : accessToken,
        expand       : 'accepted_presentations,alternate_presentations,rejected_presentations',
        relations : 'accepted_presentations,alternate_presentations,rejected_presentations',
    };

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        if(order === '') order = 'full_name';
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    return getRequest(
        createAction(REQUEST_SPEAKERS_BY_SUMMIT),
        createAction(RECEIVE_SPEAKERS_BY_SUMMIT),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers`,
        authErrorHandler,
        {order, orderDir, page, perPage, term, ...filters, currentSummitId: currentSummit.id}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const exportSummitSpeakers = (term = null, order = 'id', orderDir = 1, filters = {}) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;
    const filename = currentSummit.name + '-Speakers.csv';
    const params = {
        access_token : accessToken
    };
    
    const filter = parseFilters(filters);

    if(term) {
        let filterTerm = buildTermFilter(term);

        filter.push(
            filterTerm.join(',')
        );
    }

    if(filter.length > 0){
        params['filter[]']= filter;
    }

    // order
    if(order != null && orderDir != null){
        const orderDirSign = (orderDir === 1) ? '+' : '-';
        params['order']= `${orderDirSign}${order}`;
    }

    dispatch(getCSV(`${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers/csv`, params, filename));
}

/**
 * @param currentFlowEvent
 * @param selectedAll
 * @param selectedIds
 * @param testRecipient
 * @param excerptRecipient
 * @param shouldSendCopy2Submitter
 * @param term
 * @param filters
 * @param source
 * @returns {function(*=, *): *}
 */
export const sendSpeakerEmails = (currentFlowEvent,
                           selectedAll = false ,
                           selectedIds = [],
                           testRecipient = '',
                           excerptRecipient= '',
                           shouldSendCopy2Submitter = false,
                           term = '',
                           filters = {},
                           source = null,
                           promoCodeStrategy = null,
                           promocodeSpecification = null,
                           ) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    const params = {
        access_token : accessToken,
    };

    const filter = parseFilters(filters);

    if(term) {
        const escapedTerm = escapeFilterValue(term);
        filter.push(
            [
                `full_name@@${escapedTerm}`,
                `email=@${escapedTerm}`,
                `presentations_title=@${escapedTerm}`,
                `presentations_abstract=@${escapedTerm}`,
                `presentations_submitter_full_name@@${escapedTerm}`,
                `presentations_submitter_email=@${escapedTerm}`
            ].join(',')
        );
    }

    if (filter.length > 0) {
        params['filter[]'] = filter;
    }

    const payload =  {
        email_flow_event : currentFlowEvent,
        should_send_copy_2_submitter : shouldSendCopy2Submitter,
    };

    if([EXISTING_SPEAKERS_PROMO_CODE, EXISTING_SPEAKERS_DISCOUNT_CODE].includes(promoCodeStrategy)) {
        payload['promo_code'] = promocodeSpecification.existingPromoCode.code;
    } else if([AUTO_GENERATED_SPEAKERS_PROMO_CODE, AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE].includes(promoCodeStrategy)) {
        const className = promoCodeStrategy === 3 ? SPEAKERS_PROMO_CODE_CLASS_NAME : SPEAKERS_DISCOUNT_CODE_CLASS_NAME;
        payload['promo_code_spec'] = {
            'class_name'          : className,
            'type'                : promocodeSpecification.type,
            'allowed_ticket_types': promocodeSpecification.ticketTypes.map(t => t.id),
            'badge_features'      : promocodeSpecification.badgeFeatures.map(b => b.id),
            'tags'                : promocodeSpecification.tags.map(t => t.tag),
        };

        if (promoCodeStrategy === AUTO_GENERATED_SPEAKERS_DISCOUNT_CODE) {
            const amount = promocodeSpecification.amount ? parseFloat(promocodeSpecification.amount) : 0;
            const rate = promocodeSpecification.rate ? parseFloat(promocodeSpecification.rate) : 0;
            payload['promo_code_spec']['amount'] = amount;
            payload['promo_code_spec']['rate'] = rate;
            if (!promocodeSpecification.applyToAllTix) {
                payload['promo_code_spec']['ticket_types_rules'] = 
                    promocodeSpecification.ticketTypes.map(t => { 
                        return { 
                            ticket_type_id: t.id,
                            amount: amount, 
                            rate: rate
                        };
                    });
            }
        }
    }

    if(!selectedAll && selectedIds.length > 0){
        payload['speaker_ids'] = selectedIds;
    }

    if(testRecipient) {
        payload['test_email_recipient'] = testRecipient;
    }

    if(excerptRecipient){
        payload['outcome_email_recipient'] = excerptRecipient
    }

    dispatch(startLoading());

    const success_message = {
        title: T.translate("general.done"),
        html: T.translate("summit_speakers_list.resend_done"),
        type: 'success'
    };

    return putRequest(
        null,
        createAction(SEND_SPEAKERS_EMAILS),
        `${window.API_BASE_URL}/api/v1/summits/${currentSummit.id}/speakers/all/send`,
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

export const selectSummitSpeaker = (speakerId) => (dispatch) => {
    dispatch(createAction(SELECT_SUMMIT_SPEAKER)(speakerId));
};

export const unselectSummitSpeaker = (speakerId) => (dispatch) => {
    dispatch(createAction(UNSELECT_SUMMIT_SPEAKER)(speakerId));
};

export const selectAllSummitSpeakers = () => (dispatch) => {
    dispatch(createAction(SELECT_ALL_SUMMIT_SPEAKERS)());
}

export const unselectAllSummitSpeakers = () => (dispatch) => {
    dispatch(createAction(UNSELECT_ALL_SUMMIT_SPEAKERS)());
}

export const setCurrentFlowEvent = (value) => (dispatch) => {
    dispatch(createAction(SET_SPEAKERS_CURRENT_FLOW_EVENT)(value));
};

const parseFilters = (filters) => {

    const filter = [];

    if(filters.hasOwnProperty('selectionPlanFilter') && Array.isArray(filters.selectionPlanFilter)
        && filters.selectionPlanFilter.length > 0){
        filter.push('presentations_selection_plan_id=='+filters.selectionPlanFilter.reduce(
            (accumulator, sp) => accumulator +(accumulator !== '' ? '||':'') +`${sp}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('trackFilter') && Array.isArray(filters.trackFilter)
        && filters.trackFilter.length > 0){
        filter.push('presentations_track_id=='+filters.trackFilter.reduce(
            (accumulator, t) => accumulator +(accumulator !== '' ? '||':'') +`${t}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('activityTypeFilter') && Array.isArray(filters.activityTypeFilter)
        && filters.activityTypeFilter.length > 0){
        filter.push('presentations_type_id=='+filters.activityTypeFilter.reduce(
            (accumulator, at) => accumulator +(accumulator !== '' ? '||':'') +`${at}`,
            ''
        ));
    }

    if(filters.hasOwnProperty('selectionStatusFilter')
        && Array.isArray(filters.selectionStatusFilter)
        && filters.selectionStatusFilter.length > 0 ) {

        // exclusive filters
        if(filters.selectionStatusFilter.includes('only_rejected')){
            filter.push('has_rejected_presentations==true');
            filter.push('has_accepted_presentations==false');
            filter.push('has_alternate_presentations==false');
        }
        else if(filters.selectionStatusFilter.includes('only_accepted')){
            filter.push('has_rejected_presentations==false');
            filter.push('has_accepted_presentations==true');
            filter.push('has_alternate_presentations==false');
        }
        else if(filters.selectionStatusFilter.includes('only_alternate')){
            filter.push('has_rejected_presentations==false');
            filter.push('has_accepted_presentations==false');
            filter.push('has_alternate_presentations==true');
        }
        else if(filters.selectionStatusFilter.includes('accepted_alternate')){
            filter.push('has_rejected_presentations==false');
            filter.push('has_accepted_presentations==true');
            filter.push('has_alternate_presentations==true');
        }
        else if(filters.selectionStatusFilter.includes('accepted_rejected')){
            filter.push('has_rejected_presentations==true');
            filter.push('has_accepted_presentations==true');
            filter.push('has_alternate_presentations==false');
        }
        else if(filters.selectionStatusFilter.includes('alternate_rejected')){
            filter.push('has_rejected_presentations==true');
            filter.push('has_accepted_presentations==false');
            filter.push('has_alternate_presentations==true');
        }
        else {
           filter.push(filters.selectionStatusFilter.reduce(
               (accumulator, at) => accumulator + (accumulator !== '' ? ',' : '') + `has_${at}_presentations==true`,
               ''
           ));
       }
    }

    return filter;
}

const buildTermFilter = (term, usePresentationFilters = true) => {
    const escapedTerm = escapeFilterValue(term);
       
    let termFilter =  [
        `full_name=@${escapedTerm}`,
        `first_name=@${escapedTerm}`,
        `last_name=@${escapedTerm}`,
        `email=@${escapedTerm}`,
    ];

    if(usePresentationFilters){
        termFilter.push( `presentations_title=@${escapedTerm}`);
        termFilter.push(`presentations_abstract=@${escapedTerm}`);
    }

    if (parseInt(escapedTerm)) {
        const filterTermId = parseInt(escapedTerm)
        termFilter = [...termFilter, ...[`id==${filterTermId}`,
            `member_id==${filterTermId}`,
            `member_user_external_id==${filterTermId}`]];
    }

    return termFilter;
}