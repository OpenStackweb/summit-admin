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
import history from '../history'
import moment from 'moment-timezone'

import {
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';


export const REQUEST_REPORT         = 'REQUEST_REPORT';
export const RECEIVE_REPORT         = 'RECEIVE_REPORT';
export const REQUEST_EXPORT_REPORT  = 'REQUEST_EXPORT_REPORT';
export const RECEIVE_EXPORT_REPORT  = 'RECEIVE_EXPORT_REPORT';


export const getReport = (query, reportName, page) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        query: query
    };

    return getRequest(
        createAction(REQUEST_REPORT),
        createAction(RECEIVE_REPORT),
        `${window.REPORT_API_BASE_URL}/reports`,
        authErrorHandler,
        {name: reportName, page}
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    );
};

const jsonToCsv = (items) => {
    const replacer = (key, value) => value === null ? '' : value ;
    const header = Object.keys(items[0])
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')

    return csv;
}

export const exportReport = ( query, reportName, preProcessData=null ) => (dispatch, getState) => {

    let { loggedUserState, currentSummitState } = getState();
    let { accessToken }     = loggedUserState;

    dispatch(startLoading());

    let params = {
        access_token : accessToken,
        query: query
    };

    return getRequest(
        createAction(REQUEST_EXPORT_REPORT),
        createAction(RECEIVE_EXPORT_REPORT),
        `${window.REPORT_API_BASE_URL}/reports`,
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());

        let responseData = {...payload.response.data};
        let data = (responseData.hasOwnProperty("reportData")) ? responseData.reportData : [];
        let extraData = (responseData.hasOwnProperty("extraData")) ? responseData.extraData : null;
        let reportData = [];

        if (preProcessData) {
            let procData = preProcessData(data.results, extraData, true);
            let labels = procData.tableColumns.map(col => col.value);
            let keys = procData.tableColumns.map(col => col.columnKey);

            for (var item in procData.reportData) {
                var newData = {};

                for (var a in labels) {
                    newData[labels[a]] = procData.reportData[item][keys[a]];
                }

                reportData.push(newData);
            }

        } else {
            reportData = flattenData(data.results);
        }


        let csv = jsonToCsv(reportData);

        let link = document.createElement('a');
        link.textContent = 'download';
        link.download = reportName+ '.csv';
        link.href = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    });

};


const normalizeEntity = (entity) => {
    let normalizedEntity = {...entity};

    return normalizedEntity;

}

export const flattenData = (data) => {
    let flatData = [];
    let rawData = JSON.parse(JSON.stringify(data));

    for (var idx=0; idx < rawData.length; idx++) {
        let idxRef = {idx};
        let flatItem = {};
        flattenItem(flatItem, rawData[idx], idxRef);
        idx = idxRef.idx;
        flatData.push(flatItem);
    }

    return flatData;

}

export const flattenItem = (flatData, item, idxRef, ctx='') => {
    for (var property in item) {
        let flatName = ctx ? ctx+'_'+property : property;

        if (item[property] == null) {
            flatData[flatName] = '';
        } else if (Array.isArray(item[property]) && item[property].length > 0) {
            flattenItem(flatData, item[property].shift(), idxRef, flatName);
            if (item[property].length > 0) {
                idxRef.idx--; // redo this item
            }
        } else if (typeof item[property] == 'object') {
            flattenItem(flatData, item[property], idxRef, flatName)
        } else {
            flatData[flatName] = item[property];
        }
    }

}

/*
export const flattenItem = (item, idxRef) => {
    let flatItem = {};

    for (var property in item) {
        if (item[property] == null) {
            flatItem[property] = '';
        } else if (Array.isArray(item[property]) && item[property].length > 0) {
            flatItem[property] = flattenItem(item[property].shift(), idxRef);
            if (item[property].length > 0) {
                idxRef.idx--; // redo this item
            }
        } else if (typeof item[property] == 'object') {
            flatItem[property] = flattenItem(item[property], idxRef)
        } else {
            flatItem[property] = item[property];
        }
    }

    return flatItem;
}

export const flattenData = (data) => {
    let flatData = [];

    for (var idx=0; idx < data.length; idx++) {
        let idxRef = {idx};
        let flatItem = flattenItem(data[idx], idxRef);
        idx = idxRef.idx;

        flatData.push(flatItem);
    }

    return flatData;

}
*/



