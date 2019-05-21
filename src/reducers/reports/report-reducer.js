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
    REQUEST_REPORT
} from '../../actions/report-actions';

import { LOGOUT_USER, VALIDATE } from 'openstack-uicore-foundation/lib/actions';
import { SET_CURRENT_SUMMIT } from '../../actions/summit-actions';


const DEFAULT_STATE = {
    name            : '',
    data            : [],
    currentPage     : 1,
    perPage         : 25,
    totalCount      : 0
};

const flattenData = (data) => {
    let flatData = [];

    for (var idx=0; idx < data.length; idx++) {
        let idxRef = {idx};
        let flatItem = flattenItem(data[idx], idxRef);
        idx = idxRef.idx;

        flatData.push(flatItem);
    }

    return flatData;

}

const flattenItem = (item, idxRef) => {
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
        break;
        case REQUEST_REPORT: {
            let {name, page} = payload;

            return {...DEFAULT_STATE, name: name, currentPage: page}
        }
        break;
        case RECEIVE_REPORT: {
            let responseData = {...payload.response.data};
            let data = responseData[Object.keys(responseData)[0]];

            let flatData = flattenData(data.results);

            console.log(flatData);

            return {...state, data: flatData, totalCount: data.totalCount };
        }
        break;
        default:
            return state;
    }
};

export default reportReducer;
