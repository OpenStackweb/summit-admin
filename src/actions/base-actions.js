import T from "i18n-react/dist/i18n-react";
import {stopLoading} from "openstack-uicore-foundation";
import swal from "sweetalert2";

export const apiBaseUrl             = process.env['API_BASE_URL'];

export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    switch (code) {
        case 401:
        case 403:
            swal("ERROR", T.translate("errors.session_expired"), "error");
            dispatch({
                type: "LOGOUT_USER",
                payload: {}
            });
            break;
        case 412:
            let msg = '';
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                msg += '- ' + value + '<br>';
            }
            swal("Validation ERROR", msg, "error");
            break;
        default:
            swal("ERROR", "There was a problem with our server, please contact admin.", "error");
    }
}

export const fetchErrorHandler = (response) => {
    let code = response.status;
    let msg = response.statusText;

    switch (code) {
        case 401:
        case 403:
            swal("ERROR", T.translate("errors.session_expired"), "error");
            break;
        case 412:
            swal("ERROR", msg, "error");
        case 500:
            swal("ERROR", "There was a problem with our server, please contact admin.", "error");
    }
}

export const fetchResponseHandler = (response) => {
    if (!response.ok) {
        throw response;
    } else {
        return response.json();
    }
}

export const showMessage = (title, msg, msg_type) => (dispatch) => {
    dispatch(stopLoading());
    swal(title, msg, msg_type);
}