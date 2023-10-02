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
    authErrorHandler, fetchResponseHandler, fetchErrorHandler
} from 'openstack-uicore-foundation/lib/utils/actions';
import {getAccessTokenSafely} from '../utils/methods';


export const REQUEST_REPORT         = 'REQUEST_REPORT';
export const RECEIVE_REPORT         = 'RECEIVE_REPORT';
export const REQUEST_EXPORT_REPORT  = 'REQUEST_EXPORT_REPORT';
export const RECEIVE_EXPORT_REPORT  = 'RECEIVE_EXPORT_REPORT';
export const RESET_EXPORT_REPORT    = 'RESET_EXPORT_REPORT';
export const LOADING_EXPORT_REPORT    = 'LOADING_EXPORT_REPORT';


const TIMEOUT = 300 ;//secs

export const getReport = (query, reportName, page) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

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

export const getMetricRaw = (query) => async (dispatch) => {
    const accessToken = await getAccessTokenSafely();

    dispatch(startLoading());

    return fetch(`${window.REPORT_API_BASE_URL}/reports?access_token=${accessToken}&query=${encodeURIComponent(query)}`)
      .then(fetchResponseHandler)
      .then(response => {
          dispatch(stopLoading());
          return response?.data?.reportData?.results || [];
      })
      .catch(fetchErrorHandler);
};

const jsonToCsv = (items) => {
    const replacer = (key, value) => value === null ? '' : value ;
    const header = Object.keys(items[0])
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')

    return csv;
}

export const exportReport = ( buildQuery, reportName, grouped, preProcessData=null ) => async (dispatch, getState) => {
    const {currentReportState} = getState();
    const {totalCount} = currentReportState;
    const perPage = 100;
    const accessToken = await getAccessTokenSafely();
    // grouped reports don't use pagination, we pull all the records
    const totalPages = grouped ? 1 : Math.ceil(totalCount / perPage);
    let reportData = [];
    let rawData = [];
    let extraData = null;

    const params = {
        access_token : accessToken,
        query: null
    };

    for (var i = 1; i <= totalPages; i++) {
        params.query = buildQuery(i, perPage);

        dispatch(createAction(LOADING_EXPORT_REPORT)({exportProgress: i * perPage}));

        const result = await getRequest(
          createAction(REQUEST_EXPORT_REPORT),
          createAction('DUMMY_ACTION'),
          `${window.REPORT_API_BASE_URL}/reports`,
          authErrorHandler,
          {},
          TIMEOUT,
          TIMEOUT
        )(params)(dispatch).then(({response}) => {
            const data = response.data?.reportData || [];
            extraData = response.data?.extraData || null;
            rawData = [...rawData, ...(data.results || data)];
        });
    }

    if (preProcessData) {
        const procData = preProcessData(rawData, extraData, true);
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
        reportData = [{name: 'Data', data: flattenData(rawData)}];
    }

    // dispatch(stopLoading());
    dispatch(createAction(RECEIVE_EXPORT_REPORT)({reportData}));

    // cleanup, file already created
    dispatch(createAction(RESET_EXPORT_REPORT)({}));

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





