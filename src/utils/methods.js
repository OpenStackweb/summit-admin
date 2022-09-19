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

import moment from "moment-timezone";
import {findElementPos} from "openstack-uicore-foundation/lib/utils/methods";
import {getAccessToken} from 'openstack-uicore-foundation/lib/security/methods'
import { initLogOut} from 'openstack-uicore-foundation/lib/security/methods';

export const trim = (string, length) => {
    return string.length > length ?
        string.substring(0, length - 3) + "..." :
        string;
}
export const groupByDate = function(array, prop, sortBy) {
    let grouped_unordered = array.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups;
    }, {});

    const grouped_ordered = {};
    Object.keys(grouped_unordered)
        .sort( (a,b) => {
            let compare_a = grouped_unordered[a][0][sortBy];
            let compare_b = grouped_unordered[b][0][sortBy];
            return (compare_a > compare_b ? 1 : (compare_a < compare_b ? -1 : 0));
        } )
        .forEach(function(key) {
            grouped_ordered[key] = grouped_unordered[key];
        });

    return grouped_ordered;
};

export const scrollToError = (errors) => {
    if(Object.keys(errors).length > 0) {
        const firstError = Object.keys(errors)[0];
        const firstNode = document.getElementById(firstError);
        if (firstNode) window.scrollTo(0, findElementPos(firstNode));
    }
};

export const hasErrors = (field, errors) => {
    if(field in errors) {
        return errors[field];
    }
    return '';
};

export const shallowEqual = (object1, object2) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (object1[key] !== object2[key]) {
            return false;
        }
    }

    return true;
};

export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

export const isEmptyString = (str) => {
    return !str || str.trim().length === 0;
};

export const stripTags = (s) => {
    return s?.replace(/(<([^>]+)>)/gi, "") || '';
}

export const boolToStr = boolean => {
    return boolean ? 'Yes' : 'No';
}

export const getTicketFromQR = (code, summit) => {
    const qrCodeArray = code.split(summit.qr_registry_field_delimiter);
    const qrPrefix = qrCodeArray[0];

    // is badge: QR_PREFIX_BADGE|TICKET_NUMBER|OWNER_EMAIL|FULLNAME
    const isBadgeQR = qrCodeArray.length === 4 && qrPrefix === summit.badge_qr_prefix;
    // is ticket: QR_PREFIX_TICKET|TICKET_NUMBER
    const isTicketQR = qrCodeArray.length === 2 && qrPrefix === summit.ticket_qr_prefix;

    const ticketNumber = (isBadgeQR || isTicketQR) ? qrCodeArray[1] : null;

    return {ticketNumber, qrPrefix};
}

export const validateBadgeQR = (code, summit) => {
    const qrCodeArray = code.split(summit.qr_registry_field_delimiter);

    if (qrCodeArray.length > 2 && qrCodeArray[0] === summit.badge_qr_prefix) {
        return qrCodeArray;
    }

    return false;
}

export const parseAndFormat = (dateString, inputFormat, outputFormat = 'MM/DD/YYYY h:mma', inputTZ = 'UTC', outputTZ = 'UTC') => {
    const parsedDate = moment.tz(dateString, inputFormat, inputTZ).tz(outputTZ);
    return parsedDate.format(outputFormat);
}

export const getAccessTokenSafely = async () => {
    try {
        return await getAccessToken();
    }
    catch (e) {
        console.log('log out: ', e);
        initLogOut();
    }
};
