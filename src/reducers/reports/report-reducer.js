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

import
{
    RECEIVE_REPORT,
    REQUEST_REPORT,
    RECEIVE_EXPORT_REPORT,
    RESET_EXPORT_REPORT,
    LOADING_EXPORT_REPORT,
} from '../../actions/report-actions';

import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    name            : '',
    data            : [],
    extraData       : null,
    currentPage     : 1,
    perPage         : 25,
    totalCount      : 0,
    extraStat       : null,
    exportData      : null,
    exportingReport : false,
    exportProgress  : 1,
};


const reportReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case LOGOUT_USER: {
            // we need this in case the token expired while editing the form
            if (payload.hasOwnProperty('persistStore')) {
                return state;
            } else {
                return DEFAULT_STATE;
            }
        }
        case REQUEST_REPORT: {
            const {name, page} = payload;
            return {...DEFAULT_STATE, name: name, currentPage: page, exportData: null}
        }
        case RECEIVE_REPORT: {
            let responseData = {...payload.response.data};
            let data = (responseData.hasOwnProperty("reportData")) ? responseData.reportData : [];
            let extraData = (responseData.hasOwnProperty("extraData")) ? responseData.extraData : null;
            let extraStat = data?.hasOwnProperty("extraStat") ? data.extraStat : null;

            return {...state, data: data?.results || data, extraData: extraData, totalCount: data?.totalCount || 0, extraStat: extraStat };
        }
        case RECEIVE_EXPORT_REPORT: {
            return {...state, exportData: payload.reportData };
        }
        case LOADING_EXPORT_REPORT: {
            const {exportProgress} = payload;
            const {totalCount} = state;

            const newExportProgress = exportProgress < totalCount ? exportProgress : totalCount;
            return {...state, exportProgress: newExportProgress, exportingReport: true };
        }
        case RESET_EXPORT_REPORT: {
            return {...state, exportData: null, exportingReport: false, exportQueryNumber: 1, totalExportQueries: 10};
        }
        default:
            return state;
    }
};

export default reportReducer;
