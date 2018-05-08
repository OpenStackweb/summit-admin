/**
 * Copyright 2017 OpenStack Foundation
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
import {createAction, getRequest, startLoading, stopLoading} from "openstack-uicore-foundation";
import swal from "sweetalert2";
import {authErrorHandler, apiBaseUrl} from "./base-actions";
import { AdminGroupCode, SummitAdminGroupCode } from '../constants';
import URI from "urijs";
export const SET_LOGGED_USER                = 'SET_LOGGED_USER';
export const LOGOUT_USER                    = 'LOGOUT_USER';
export const REQUEST_USER_INFO              = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO              = 'RECEIVE_USER_INFO';

const getAuthUrl = (backUrl = null) => {
    let oauth2ClientId = process.env['OAUTH2_CLIENT_ID'];
    let baseUrl        = process.env['IDP_BASE_URL'];
    let scopes         = process.env['SCOPES'];
    let redirectUri    =`${ window.location.origin}/auth/callback`;

    if(backUrl != null)
        redirectUri += `?BackUrl=${encodeURI(backUrl)}`;

    let url   = URI(`${baseUrl}/oauth2/auth`);
    url       = url.query({
        "response_type"   : encodeURI("token id_token"),
        "approval_prompt" : "auto",
        "prompt"          : "login+consent",
        "scope"           : encodeURI(scopes),
        "nonce"           : getNonce(),
        "client_id"       : encodeURI(oauth2ClientId),
        "redirect_uri"    : encodeURI(redirectUri)
    });

    return url;

}

const getNonce = () => {
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = window.localStorage.getItem('nonce');

    if (!nonce) {
        nonce = '';
        for(let i = 0; i < 16; i++) {
            nonce += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        console.log(`created nonce ${nonce}`);
        window.localStorage.setItem('nonce', nonce);
    }

    return nonce;
}

export const doLogin = (backUrl = null) => {
    let url = getAuthUrl(backUrl);
    window.location = url.toString();
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


export const getUserInfo = (history, backUrl) => (dispatch, getState) => {

    let { loggedUserState }     = getState();
    let { accessToken, member } = loggedUserState;
    if(member != null){
        console.log(`redirecting to ${backUrl}`)
        history.push(backUrl);
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
                swal("ERROR", T.translate("errors.user_not_set"), "error");
                dispatch({
                    type: LOGOUT_USER,
                    payload: {}
                });
            }

            let allowedGroups = member.groups.filter((group, idx) => {
                return group.code === AdminGroupCode || group.code == SummitAdminGroupCode;
            })

            if(allowedGroups.length == 0){
                swal("ERROR", T.translate("errors.user_not_authz") , "error");
                dispatch({
                    type: LOGOUT_USER,
                    payload: {}
                });
            }
            console.log(`redirecting to ${backUrl}`)
            history.push(backUrl);
        }
    );
}