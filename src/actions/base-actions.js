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
            swal("ERROR", err.response.body.errors[0], "error");
        case 500:
            swal("ERROR", "There was a problem with our server, please contact admin.", "error");
    }
}

export const showMessage = (title, msg, msg_type) => (dispatch) => {
    dispatch(stopLoading());
    swal(title, msg, msg_type);
}