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

import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    authErrorHandler
} from 'openstack-uicore-foundation/lib/methods';


export const REQUEST_REPORT         = 'REQUEST_REPORT';
export const RECEIVE_REPORT         = 'RECEIVE_REPORT';
export const REQUEST_EXPORT_REPORT  = 'REQUEST_EXPORT_REPORT';
export const RECEIVE_EXPORT_REPORT  = 'RECEIVE_EXPORT_REPORT';
export const RESET_EXPORT_REPORT    = 'RESET_EXPORT_REPORT';
const TIMEOUT = 300 ;//secs

export const getReport = (query, reportName, page) => (dispatch, getState) => {

    const { loggedUserState, currentSummitState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        query: query
    };

    return getRequest(
        createAction(REQUEST_REPORT),
        createAction(RECEIVE_REPORT),
        `${window.REPORT_API_BASE_URL}/reports`,
        authErrorHandler,
        {name: reportName, page},
        TIMEOUT,
        TIMEOUT
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

export const exportReport = ( query, reportName, grouped, preProcessData=null ) => (dispatch, getState) => {

    const { loggedUserState } = getState();
    const { accessToken }     = loggedUserState;

    dispatch(startLoading());

    const params = {
        access_token : accessToken,
        query: query
    };

    return getRequest(
        createAction(REQUEST_EXPORT_REPORT),
        createAction('DUMMY_ACTION'),
        `${window.REPORT_API_BASE_URL}/reports`,
        authErrorHandler,
        {},
        TIMEOUT,
        TIMEOUT
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());

        const responseData = {...payload.response.data};
        const data = (responseData.hasOwnProperty("reportData")) ? responseData.reportData : [];
        const extraData = (responseData.hasOwnProperty("extraData")) ? responseData.extraData : null;
        let reportData = [];

        if (preProcessData) {
            const procData = preProcessData(data.results || data, extraData, true);
            const labels = procData.tableColumns.map(col => col.value);
            const keys = procData.tableColumns.map(col => col.columnKey);

            // replace labels
            if (grouped) {
                for (var groupName in procData.reportData) {
                    const newSheet = {name: groupName, data: []};
                    const groupData = procData.reportData[groupName];
                    for (let item in groupData) {
                        const newData = {};

                        for (var a in labels) {
                            newData[labels[a]] = groupData[item][keys[a]];
                        }

                        newSheet.data.push(newData);
                    }

                    reportData.push(newSheet);
                }

            } else {
                for (var item in procData.reportData) {
                    var newData = {};

                    for (var a in labels) {
                        newData[labels[a]] = procData.reportData[item][keys[a]];
                    }

                    reportData.push(newData);
                }

                reportData = [{name: 'Data', data: reportData}];
            }


        } else {
            reportData = [{name: 'Data', data: flattenData(data.results)}];
        }

        return reportData;

        /*let csv = jsonToCsv(reportData);

        let link = document.createElement('a');
        link.textContent = 'download';
        link.download = reportName+ '.csv';
        link.href = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);*/

    }).then((reportData)=>{
        dispatch(createAction(RECEIVE_EXPORT_REPORT)({reportData}));
    }).then((reportData)=>{
        dispatch(createAction(RESET_EXPORT_REPORT)({}));
    });

};


const normalizeEntity = (entity) => {
    const normalizedEntity = {...entity};

    return normalizedEntity;

}

export const flattenData = (data) => {
    const flatData = [];
    const rawData = JSON.parse(JSON.stringify(data));

    for (var idx=0; idx < rawData.length; idx++) {
        const idxRef = {idx};
        const flatItem = {};
        flattenItem(flatItem, rawData[idx], idxRef);
        idx = idxRef.idx;
        flatData.push(flatItem);
    }

    return flatData;

}

export const flattenItem = (flatData, item, idxRef, ctx='') => {
    if (typeof item != 'object') {
        flatData[ctx] = item;
    } else {
        for (var property in item) {
            const flatName = ctx ? ctx + '_' + property : property;

            if (item[property] == null) {
                flatData[flatName] = '';
            } else if (Array.isArray(item[property]) && item[property].length > 0) {
                flattenItem(flatData, item[property].shift(), idxRef, flatName);
                if (item[property].length > 0 && typeof item[property] != "string") {
                    idxRef.idx--; // redo this item
                }
            } else if (typeof item[property] == 'object' && typeof item[property] != "string") {
                flattenItem(flatData, item[property], idxRef, flatName)
            } else {
                flatData[flatName] = item[property];
            }
        }
    }

}





