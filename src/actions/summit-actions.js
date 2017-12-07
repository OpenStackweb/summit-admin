import {createAction, getRequest, putRequest, startLoading, stopLoading} from "openstack-uicore-foundation";
import {apiBaseUrl, authErrorHandler} from "./base-actions";

export const RECEIVE_SUMMIT = 'RECEIVE_SUMMIT';

export const getSummitById = (summitId) => (dispatch, getState) => {

    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;
    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        expand: 'event_types,tracks'
    };

    return getRequest(
        null,
        createAction(RECEIVE_SUMMIT),
        `${apiBaseUrl}/api/v1/summits/${summitId}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
}