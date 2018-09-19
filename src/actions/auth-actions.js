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
import {createAction, getRequest, startLoading, stopLoading, showMessage} from "openstack-uicore-foundation/lib/methods";
import {authErrorHandler, apiBaseUrl} from "./base-actions";
import { AllowedUserGroups } from '../utils/constants';
import URI from "urijs";
import history from '../history'

export const SET_LOGGED_USER    = 'SET_LOGGED_USER';
export const LOGOUT_USER        = 'LOGOUT_USER';
export const REQUEST_USER_INFO  = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO  = 'RECEIVE_USER_INFO';
export const START_SESSION_STATE_CHECK = 'START_SESSION_STATE_CHECK';
export const END_SESSION_STATE_CHECK = 'END_SESSION_STATE_CHECK';

const NONCE_LEN = 16;

export const getAuthUrl = (backUrl = null, prompt = null, tokenIdHint = null) => {

    let oauth2ClientId = process.env['OAUTH2_CLIENT_ID'];
    let baseUrl        = process.env['IDP_BASE_URL'];
    let scopes         = process.env['SCOPES'];
    let redirectUri    =`${window.location.origin}/auth/callback`;

    if(backUrl != null)
        redirectUri += `?BackUrl=${encodeURI(backUrl)}`;

    let nonce = createNonce(NONCE_LEN);
    console.log(`created nonce ${nonce}`);
    // store nonce to check it later
    window.localStorage.setItem('nonce', nonce);
    let url   = URI(`${baseUrl}/oauth2/auth`);

    let query = {
        "response_type"   : encodeURI("token id_token"),
        "scope"           : encodeURI(scopes),
        "nonce"           : nonce,
        "client_id"       : encodeURI(oauth2ClientId),
        "redirect_uri"    : encodeURI(redirectUri)
    };

    if(prompt){
        query['prompt'] = prompt;
    }

    if(prompt){
        query['prompt'] = prompt;
    }

    url = url.query(query);

    return url;
}

const getLogoutUrl = (idToken) => {
    let baseUrl     = process.env['IDP_BASE_URL'];
    let url         = URI(`${baseUrl}/oauth2/end-session`);
    let state       = createNonce(NONCE_LEN);
    let postLogOutUri = window.location.origin + '/auth/logout';
    // store nonce to check it later
    window.localStorage.setItem('post_logout_state', state);
    /**
     * post_logout_redirect_uri should be listed on oauth2 client settings
     * on IDP
     * "Security Settings" Tab -> Logout Options -> Post Logout Uris
     */
    return url.query({
        "id_token_hint"             : idToken,
        "post_logout_redirect_uri"  : encodeURI(postLogOutUri),
        "state"                     : state,
    });
}

const createNonce = (len) => {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = '';
    for(let i = 0; i < len; i++) {
        nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return nonce;
}

export const doLogin = (backUrl = null) => {
    if(backUrl)
        console.log(`doLogin - backUrl ${backUrl} `);
    let url = getAuthUrl(backUrl);
    window.location = url.toString();
}

export const onUserAuth = (accessToken, idToken, sessionState) => (dispatch) => {
    dispatch({
        type: SET_LOGGED_USER,
        payload: {accessToken, idToken, sessionState}
    });
}

export const initLogOut = () => {
    window.location = getLogoutUrl(window.idToken).toString();
}


export const doLogout = (backUrl) => (dispatch, getState) => {
    dispatch({
        type: LOGOUT_USER,
        payload: {backUrl:backUrl}
    });
}

export const getUserInfo = (backUrl) => (dispatch, getState) => {

    let { loggedUserState }     = getState();
    let { accessToken, member } = loggedUserState;
    if(member != null){
        console.log(`redirecting to ${backUrl}`)
        history.push(backUrl);
        return;
    }

    dispatch(startLoading());

    return getRequest(
        createAction(REQUEST_USER_INFO),
        createAction(RECEIVE_USER_INFO),
        `${apiBaseUrl}/api/v1/members/me?expand=groups&access_token=${accessToken}`,
        authErrorHandler
    )({})(dispatch, getState).then(() => {
            dispatch(stopLoading());

            let { member } = getState().loggedUserState;
            if( member == null || member == undefined){
                let error_message = {
                    title: 'ERROR',
                    html: T.translate("errors.user_not_set"),
                    type: 'error'
                };

                dispatch(showMessage( error_message, initLogOut ));

            }

            let allowedGroups = member.groups.filter((group, idx) => {
                return AllowedUserGroups.includes(group.code);
            })

            if(allowedGroups.length == 0){
                let error_message = {
                    title: 'ERROR',
                    html: T.translate("errors.user_not_authz"),
                    type: 'error'
                };

                dispatch(showMessage( error_message, initLogOut ));
            }

            history.push(backUrl);
        }
    );
}

export const onStartSessionStateCheck = () => (dispatch) => {
    dispatch({
        type: START_SESSION_STATE_CHECK,
        payload: {}
    });
}

export const onFinishSessionStateCheck = () => (dispatch) => {
    dispatch({
        type: END_SESSION_STATE_CHECK,
        payload: {}
    });
}
