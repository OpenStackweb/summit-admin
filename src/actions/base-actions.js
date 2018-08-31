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
import {
    stopLoading,
    startLoading,
    createAction,
    getBackURL,
    objectToQueryString,
    showMessage
} from "openstack-uicore-foundation/lib/methods";
import swal from "sweetalert2";
import {doLogin, initLogOut } from "./auth-actions";

export const apiBaseUrl         = process.env['API_BASE_URL'];
export const VALIDATE           = 'VALIDATE';
const LOGOUT_USER               = 'LOGOUT_USER';

export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    let msg = '';

    dispatch(stopLoading());

    switch (code) {
        case 403:
            let error_message = {
                title: 'ERROR',
                html: T.translate("errors.user_not_authz"),
                type: 'error'
            };

            dispatch(showMessage( error_message, initLogOut ));
            break;
        case 401:
            doLogin(window.location.pathname);
            break;
        case 404:
            msg = "";

            if (err.response.body && err.response.body.message) msg = err.response.body.message;
            else if (err.response.error && err.response.error.message) msg = err.response.error.message;
            else msg = err.message;

            swal("Not Found", msg, "warning")
                .then(function(){
                    window.history.back();
                }).catch(swal.noop);

            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                if (isNaN(key)) {
                    msg += key + ': ';
                }

                msg += value + '<br>';
            }
            swal("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
            swal("ERROR", T.translate("errors.server_error"), "error");
    }
}

