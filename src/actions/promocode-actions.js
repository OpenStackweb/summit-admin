import { getRequest, putRequest, postRequest, deleteRequest, createAction, stopLoading, startLoading } from "openstack-uicore-foundation";
import { authErrorHandler, fetchResponseHandler, fetchErrorHandler, apiBaseUrl, showMessage} from './base-actions';
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const REQUEST_PROMOCODES       = 'REQUEST_PROMOCODES';
export const RECEIVE_PROMOCODES       = 'RECEIVE_PROMOCODES';
export const RECEIVE_PROMOCODE        = 'RECEIVE_PROMOCODE';
export const RECEIVE_PROMOCODE_META   = 'RECEIVE_PROMOCODE_META';
export const RESET_PROMOCODE_FORM     = 'RESET_PROMOCODE_FORM';
export const UPDATE_PROMOCODE         = 'UPDATE_PROMOCODE';
export const PROMOCODE_UPDATED        = 'PROMOCODE_UPDATED';
export const PROMOCODE_ADDED          = 'PROMOCODE_ADDED';
export const PROMOCODE_DELETED        = 'PROMOCODE_DELETED';
export const EMAIL_SENT               = 'EMAIL_SENT';


export const getPromocodeMeta = () => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_PROMOCODE_META),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes/metadata`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};


export const getPromocodes = ( term = null, page = 1, perPage = 10, order = 'code', orderDir = 1, type = 'ALL' ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;
    let filter = [];

    dispatch(startLoading());

    if(term != null){
        filter.push(`code=@${term},creator=@${term},creator_email=@${term},owner=@${term},owner_email=@${term},speaker=@${term},speaker_email=@${term},sponsor=@${term}`);
    }

    if (type != 'ALL') {
        filter.push(`type==${type}`);
    }

    let params = {
        expand       : 'speaker,owner,sponsor,creator',
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
        createAction(REQUEST_PROMOCODES),
        createAction(RECEIVE_PROMOCODES),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes`,
        authErrorHandler,
        {page, perPage, order, orderDir, type}
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const getPromocode = (promocodeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        expand       : 'owner, sponsor, speaker, tickets, ticket_type',
        access_token : accessToken,
    };

    return getRequest(
        null,
        createAction(RECEIVE_PROMOCODE),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes/${promocodeId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const resetPromocodeForm = () => (dispatch, getState) => {
    dispatch(createAction(RESET_PROMOCODE_FORM)({}));
};

export const savePromocode = (entity, history) => (dispatch, getState) => {
    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    let normalizedEntity = normalizeEntity(entity);

    if (entity.id) {

        let success_message = ['Done!', 'Promocode saved successfully.', 'success'];

        putRequest(
            createAction(UPDATE_PROMOCODE),
            createAction(PROMOCODE_UPDATED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes/${entity.id}?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(...success_message));
            });

    } else {
        let success_message = ['Done!', 'Promocode created successfully.', 'success'];


        postRequest(
            createAction(UPDATE_PROMOCODE),
            createAction(PROMOCODE_ADDED),
            `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes?access_token=${accessToken}`,
            normalizedEntity,
            authErrorHandler,
            entity
        )({})(dispatch)
            .then((payload) => {
                dispatch(showMessage(
                    ...success_message,
                    () => { history.push(`/app/summits/${currentSummit.id}/promocodes/${payload.response.id}`) }
                ));
            });
    }
}

export const deletePromocode = (promocodeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return deleteRequest(
        null,
        createAction(PROMOCODE_DELETED)({promocodeId}),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes/${promocodeId}`,
        authErrorHandler
    )(params)(dispatch).then(dispatch(stopLoading()));
};

export const sendEmail = (promocodeId) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;
    let { currentSummit }   = currentSummitState;

    let params = {
        access_token : accessToken
    };

    return postRequest(
        null,
        createAction(EMAIL_SENT),
        `${apiBaseUrl}/api/v1/summits/${currentSummit.id}/promo-codes/${promocodeId}/mail`,
        authErrorHandler
    )(params)(dispatch).then(
        (payload) => {
            dispatch(stopLoading());
            dispatch(showMessage('Done!', 'Email sent successfully.', 'success'));
        });
};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    if (entity.class_name == 'MEMBER_PROMO_CODE') {
        if (entity.owner != null)
            normalizedEntity.owner_id = entity.owner.id;
    } else if (entity.class_name == 'SPEAKER_PROMO_CODE') {
        if (entity.speaker != null)
            normalizedEntity.speaker_id = entity.speaker.id;
    } else if (entity.class_name == 'SPONSOR_PROMO_CODE') {
        if (entity.sponsor != null)
            normalizedEntity.sponsor_id = entity.sponsor.id;
        else if (entity.owner != null)
            normalizedEntity.owner_id = entity.owner.id;
    }

    delete normalizedEntity['owner'];
    delete normalizedEntity['speaker'];
    delete normalizedEntity['sponsor'];

    return normalizedEntity;

}
