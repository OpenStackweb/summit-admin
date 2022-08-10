import {
    getRequest,
    deleteRequest,
    postRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';


export const REQUEST_USER_ROLES_BY_SUMMIT = 'REQUEST_USER_ROLES_BY_SUMMIT';
export const RECEIVE_USER_ROLES_BY_SUMMIT = 'RECEIVE_USER_ROLES_BY_SUMMIT';
export const REQUEST_USER_ROLES_BY_EVENT = 'REQUEST_USER_ROLES_BY_EVENT';
export const RECEIVE_USER_ROLES_BY_EVENT = 'RECEIVE_USER_ROLES_BY_EVENT';
export const ADD_HELP_USER = 'ADD_HELP_USER';
export const HELP_USER_ADDED = 'HELP_USER_ADDED';
export const REMOVE_HELP_USER = 'REMOVE_HELP_USER';
export const HELP_USER_REMOVED = 'HELP_USER_REMOVED';
export const REQUEST_QA_USERS_BY_SUMMIT_EVENT = 'REQUEST_QA_USERS_BY_SUMMIT_EVENT';
export const RECEIVE_QA_USERS_BY_SUMMIT_EVENT = 'RECEIVE_QA_USERS_BY_SUMMIT_EVENT';

export const getUserRolesBySummit = () => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        summit_id:currentSummit.id,
    };

    return getRequest(
        createAction(REQUEST_USER_ROLES_BY_SUMMIT),
        createAction(RECEIVE_USER_ROLES_BY_SUMMIT),
        `${window.CHAT_API_BASE_URL}/api/public/v1/user-roles`,
        (err, res) => (dispatch, state) => {
            dispatch(stopLoading())
        },
        {}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addHelpMember = (member) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
    };

    return postRequest(
        createAction(ADD_HELP_USER),
        createAction(HELP_USER_ADDED),
        `${window.CHAT_API_BASE_URL}/api/v1/user-roles`,
        member,
        authErrorHandler,
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeHelpMember = (member) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        summit_id: currentSummit.id,
        member_id: member.member_id
    };

    return deleteRequest(
        createAction(REMOVE_HELP_USER),
        createAction(HELP_USER_REMOVED),
        `${window.CHAT_API_BASE_URL}/api/v1/user-roles`,
        null,
        authErrorHandler,
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const getQAUsersBySummitEvent = (summitId, eventId) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        summit_id:summitId,
        summit_event_id:eventId
    };

    return getRequest(
        createAction(REQUEST_QA_USERS_BY_SUMMIT_EVENT),
        createAction(RECEIVE_QA_USERS_BY_SUMMIT_EVENT),
        `${window.CHAT_API_BASE_URL}/api/public/v1/user-roles`,
        authErrorHandler,
        {}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

export const addQAMember = (member, eventId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());
    member.summit_id = currentSummit.id;
    member.summit_event_id = eventId;
    const params = {
        access_token : accessToken,
    };

    return postRequest(
        createAction(ADD_HELP_USER),
        createAction(HELP_USER_ADDED),
        `${window.CHAT_API_BASE_URL}/api/v1/user-roles`,
        member,
        authErrorHandler,
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

export const removeQAMember = (member, eventId) => async (dispatch, getState) => {

    const { currentSummitState } = getState();
    const accessToken = await getAccessTokenSafely();
    const { currentSummit }   = currentSummitState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        summit_id: currentSummit.id,
        member_id: member.member_id,
        summit_event_id: eventId,
    };

    return deleteRequest(
        createAction(REMOVE_HELP_USER),
        createAction(HELP_USER_REMOVED),
        `${window.CHAT_API_BASE_URL}/api/v1/user-roles`,
        null,
        authErrorHandler,
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}

