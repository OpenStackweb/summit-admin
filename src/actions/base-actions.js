import T from "i18n-react/dist/i18n-react";
import {stopLoading} from "openstack-uicore-foundation";
import swal from "sweetalert2";

export const apiBaseUrl             = process.env['API_BASE_URL'];

export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());
    if(code == 401 || code == 403){
        swal("ERROR", T.translate("errors.session_expired"), "error");
        dispatch({
            type: "LOGOUT_USER",
            payload: {}
        });
    }
    if(code == 412 ){
        swal("ERROR", err.response.body.errors[0], "error");
    }
}