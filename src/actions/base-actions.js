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
import {stopLoading, startLoading, createAction} from "openstack-uicore-foundation";
import {objectToQueryString} from '../utils/methods';
import swal from "sweetalert2";

export const apiBaseUrl         = process.env['API_BASE_URL'];
export const RECEIVE_COUNTRIES  = 'RECEIVE_COUNTRIES';
export const VALIDATE           = 'VALIDATE';
const LOGOUT_USER               = 'LOGOUT_USER';

export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            swal("ERROR", T.translate("errors.user_not_authz"), "warning");
            break;
        case 401:
            swal("ERROR", T.translate("errors.session_expired"), "error");
            dispatch({
                type: LOGOUT_USER,
                payload: {
                    persistStore: true
                }
            });
            break;
        case 404:
            msg = (err.response.body.message) ? err.response.body.message : err.message;
            swal("Not Found", msg, "warning");
            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                msg += '- ' + value + '<br>';
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

export const fetchErrorHandler = (response) => {
    let code = response.status;
    let msg = response.statusText;

    switch (code) {
        case 403:
            swal("ERROR", T.translate("errors.user_not_authz"), "warning");
            break;
        case 401:
            swal("ERROR", T.translate("errors.session_expired"), "error");
            break;
        case 412:
            swal("ERROR", msg, "warning");
        case 500:
            swal("ERROR", T.translate("errors.server_error"), "error");
    }
}

export const fetchResponseHandler = (response) => {
    if (!response.ok) {
        throw response;
    } else {
        return response.json();
    }
}

export const showMessage = (title, text, type, callback = {}) => (dispatch) => {
    dispatch(stopLoading());
    swal({title, text, type}).then((result) => {
        if (result.value && typeof callback === 'function') {
            callback();
        }
    });
}

export const queryMembers = (input) => {

    let accessToken = window.accessToken;
    input       = encodeURIComponent(input);
    let filters = `first_name=@${input},last_name=@${input},email=@${input}`;
    let expand = `tickets,rsvp,schedule_summit_events,all_affiliations`

    return fetch(`${apiBaseUrl}/api/v1/members?filter=${filters}&expand=${expand}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((m) =>
                ({id: m.id, name: m.first_name + ' ' + m.last_name + ' (' + m.id + ')', ...m})
            );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const querySpeakers = (summitId, input) => {

    let accessToken = window.accessToken;
    let filters = `first_name=@${input},last_name=@${input},email=@${input}`;
    let apiUrl = `${apiBaseUrl}/api/v1`;

    if (summitId) {
        apiUrl += `/summits/${summitId}`;
    }

    apiUrl += `/speakers?filter=${filters}&access_token=${accessToken}`;

    return fetch(apiUrl)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((s) =>
                ({id: s.id, name: s.first_name + ' ' + s.last_name + ' (' + s.id + ')'})
            );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryTags = (input, summitId = null) => {

    let accessToken = window.accessToken;

    return fetch(`${apiBaseUrl}/api/v1/tags?filter=tag=@${input}&order=tag&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((t) => ({tag: t.tag, id: t.id}) );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryTracks = (summitId, input) => {

    let accessToken = window.accessToken;

    return fetch(`${apiBaseUrl}/api/v1/summits/${summitId}/tracks?filter=name=@${input}&order=name&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryEvents = (summitId, input, onlyPublished = false) => {

    let accessToken = window.accessToken;
    let baseUrl = `${apiBaseUrl}/api/v1/summits/${summitId}/events` + (onlyPublished ? '/published' : '');

    return fetch(`${baseUrl}?filter=title=@${input}&order=title&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};


export const queryGroups = (input) => {

    let accessToken = window.accessToken;
    let filters = `title=@${input},code=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/groups?filter=${filters}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = [...json.data];

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};

export const queryCompanies = (input) => {

    let accessToken = window.accessToken;
    let filters = `name=@${input}`;

    return fetch(`${apiBaseUrl}/api/v1/companies?filter=${filters}&access_token=${accessToken}`)
        .then(fetchResponseHandler)
        .then((json) => {
            let options = json.data.map((c) => ({id: c.id, name: c.name}) );

            return {
                options: options
            };
        })
        .catch(fetchErrorHandler);
};


export const getCSV = (url, params, filename) => (dispatch) => {

    let queryString = objectToQueryString(params);
    let apiUrl = `${url}?${queryString}`;

    dispatch(startLoading());

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw response;
            } else {
                return response.text();
            }
        })
        .then((csv) => {
            dispatch(stopLoading());

            let link = document.createElement('a');
            link.textContent = 'download';
            link.download = filename;
            link.href = 'data:text/csv;charset=utf-8,'+ encodeURI(csv);
            document.body.appendChild(link); // Required for FF
            link.click();
            document.body.removeChild(link);
        })
        .catch(fetchErrorHandler);
};

export const getCountryList = () => (dispatch) => {

    let apiUrl = 'https://restcountries.eu/rest/v2/all?fields=name;alpha2Code';

    return fetch(apiUrl)
        .then(fetchResponseHandler)
        .then((json) => {
            dispatch(createAction(RECEIVE_COUNTRIES)(json));
        })
        .catch(fetchErrorHandler);
};

var geocoder;

export const geoCodeAddress = (address) => {

    if (!geocoder) geocoder = new google.maps.Geocoder();

    // return a Promise
    return new Promise(function(resolve,reject) {
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // resolve results upon a successful status
                resolve(results);
            } else {
                // reject status upon un-successful status
                reject(status);
            }
        });
    });
};

export const geoCodeLatLng = (lat, lng) => {

    if (!geocoder) geocoder = new google.maps.Geocoder();

    var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    // return a Promise
    return new Promise(function(resolve,reject) {
        geocoder.geocode( { 'location': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // resolve results upon a successful status
                resolve(results);
            } else {
                // reject status upon un-successful status
                reject(status);
            }
        });
    });
};
