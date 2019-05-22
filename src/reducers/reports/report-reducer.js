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
    flattenData
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
