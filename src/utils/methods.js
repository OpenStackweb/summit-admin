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
import {findElementPos, epochToMomentTimeZone} from "openstack-uicore-foundation/lib/utils/methods";
import {getAccessToken} from 'openstack-uicore-foundation/lib/security/methods'
import { initLogOut} from 'openstack-uicore-foundation/lib/security/methods';
import Swal from "sweetalert2";
import { OR_FILTER } from "./constants";

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

export const escapeFilterValue = (value) => {
    value = value.replace(/,/g, "\\,");
    value = value.replace(/;/g, "\\;");
    return value;
};

export const fetchResponseHandler = (response) => {
    if (!response.ok) {
        throw response;
    } else {
        return response.json();
    }
}

export const fetchErrorHandler = (response) => {
    let code = response.status;
    let msg = response.statusText;

    switch (code) {
        case 403:
            Swal.fire("ERROR", T.translate("errors.user_not_authz"), "warning");
            break;
        case 401:
            Swal.fire("ERROR", T.translate("errors.session_expired"), "error");
            break;
        case 412:
            Swal.fire("ERROR", msg, "warning");
        case 500:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
}

export const adjustEventDuration = (evt, entity) => {

    let adjustedEntity = {...entity};
    let {value, id, type} = evt.target;

    if (type === 'datetime') {
        const empty = moment(0);
        if(value.valueOf() === empty.valueOf()) value = null;
        if(value !== null)
             value = value.valueOf() / 1000;
        // if we have both dates, update duration
        if (id === 'start_date' && adjustedEntity.end_date) {
            adjustedEntity.duration = adjustedEntity.end_date > value ? adjustedEntity.end_date - value : 0;
        } else if (id === 'end_date' && adjustedEntity.start_date) {
            adjustedEntity.duration = adjustedEntity.start_date < value ? value - adjustedEntity.start_date : 0;
        } else if (adjustedEntity.duration) {
            // if one of the dates is missing but we have duration, update missing date
            if (id === 'start_date') {
                adjustedEntity.end_date = value + adjustedEntity.duration;
            } else {
                adjustedEntity.start_date = value - adjustedEntity.duration;
            }
        }
    } else { // updating duration unless is empty        
        // check if the value is a valid number
        if (value !== "") {
            value = parseInt(value*60);
            if (!Number.isNaN(value)) {
                if (adjustedEntity.start_date) {
                    // if we have start date, update end date
                    adjustedEntity.end_date = adjustedEntity.start_date + value;
                } else if (adjustedEntity.end_date) {
                    // if we only have end date, update start date
                    adjustedEntity.start_date = adjustedEntity.end_date - value;
                }
            }
        }        
    }

    adjustedEntity[id] = value;

    return adjustedEntity;
}

export const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export const getSummitDays = (summit) => {
    const days = [];
    const summitLocalStartDate = epochToMomentTimeZone(summit.start_date, summit.time_zone_id);
    const summitLocalEndDate = epochToMomentTimeZone(summit.end_date, summit.time_zone_id);
    let currentAuxDay = summitLocalStartDate.clone();
    
    do {
        const option = {
            value: currentAuxDay.valueOf() / 1000,
            label: currentAuxDay.format('MMM Do YYYY')
        };
    
        days.push(option);
       
        currentAuxDay = currentAuxDay.clone();
        currentAuxDay.add(1, 'day');
    } while (!currentAuxDay.isAfter(summitLocalEndDate));
    
    return days;
}

export const isNumericString = (value) => {
    return /^[0-9]*$/.test(value);
}

export const checkOrFilter = (filters, filter) => {
    // check if filter is OR to return the correct fitler
    if(filters.hasOwnProperty("orAndFilter") && filters.orAndFilter === OR_FILTER) {
        return filter.map(f => `or(${f})`);
    }
    return filter;
}

export const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

export const parseSpeakerAuditLog = (logString) => {
    const logEntries = logString.split('|');
    const userChanges = {};
    for (const entry of logEntries) {
        const emailMatch = entry.match(/\b[\w.-]+@[\w.-]+\.\w{2,}\b/);
        if (!emailMatch) continue;
        const email = emailMatch[0];
        if (entry.includes('added')) {
          userChanges[email] = (userChanges[email] || 0) + 1;
        } else if (entry.includes('removed')) {
          userChanges[email] = (userChanges[email] || 0) - 1;
        }
    }

    const relevantChanges = [];
    for (const [email, changeCount] of Object.entries(userChanges)) {
        if (changeCount !== 0) {
            relevantChanges.push(`Speaker ${email} ${changeCount > 0 ? 'was added to the collection' : 'was removed from the collection'}`);
    }
  }

  return relevantChanges.join('|');
}