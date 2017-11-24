import { getRequest, putRequest, postRequest, deleteRequest, createAction } from "openstack-uicore-foundation";
import 'sweetalert2/dist/sweetalert2.css';
import swal from 'sweetalert2';
import T from 'i18n-react';

export const SET_LOGGED_USER    = 'SET_LOGGED_USER';
export const LOGOUT_USER        = 'LOGOUT_USER';
export const LOADING            = "LOADING";
export const STOP_LOADING       = "STOP_LOADING";
export const RECEIVE_SUMMITS    = "RECEIVE_SUMMITS";
const GROUP_ADMINS_CODE         = 'administrators';

let apiBaseUrl                  = process.env['API_BASE_URL'];

export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    if(code == 401 || code == 403){
        swal("ERROR", T.translate("errors.user_not_set"), "error");
        dispatch({
            type: LOGOUT_USER,
            payload: {}
        });
    }
}

export const doLogin = () => {

    let oauth2ClientId = process.env['OAUTH2_CLIENT_ID'];
    let baseUrl = process.env['IDP_BASE_URL'];
    let scopes = process.env['SCOPES'];
    var authUrl = baseUrl +"/oauth2/auth"+
        "?response_type=token id_token" +
        "&approval_prompt=force"+
        "&prompt=login+consent"+
        "&scope=" + encodeURI(scopes)+
        "&nonce=12345"+
        "&client_id="  + encodeURI(oauth2ClientId) +
        "&redirect_uri=" + window.location.origin+'/auth/callback';

    window.location = authUrl;
}

export const onUserAuth = (accessToken, idToken) => (dispatch) => {
    dispatch({
        type: SET_LOGGED_USER,
        payload: {accessToken, idToken}
    });
}

export const doLogout = () => (dispatch) => {
    dispatch({
        type: LOGOUT_USER,
        payload: {}
    });
}

export const getUserInfo = () => (dispatch, getState) => {

    console.log('calling getUserInfo ...');
    let { loggedUserState } = getState();
    let { accessToken }     = loggedUserState;

    getRequest(
        createAction(LOADING),
        createAction(STOP_LOADING),
        `${apiBaseUrl}/api/v1/members/me?expand=groups&access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch, getState).then(() => {
            let { member } = getState().loggedUserState;
            if( member == null || member == undefined){
                swal("ERROR", T.translate("errors.user_not_set"), "error");
                dispatch({
                    type: LOGOUT_USER,
                    payload: {}
                });
            }

            let adminGroup = member.groups.filter((group, idx) => {
                return group.code === GROUP_ADMINS_CODE;
            })

            if(adminGroup.length == 0){
                swal("ERROR", T.translate("errors.user_not_authz") , "error");
                dispatch({
                    type: LOGOUT_USER,
                    payload: {}
                });
            }
        }
    );
}

export const loadSummits = getRequest(
    createAction(LOADING),
    createAction(RECEIVE_SUMMITS),
    `${apiBaseUrl}/api/v1/summits/all`
);

