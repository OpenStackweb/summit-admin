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

import
{
    RECEIVE_SUMMITDOCS,
    REQUEST_SUMMITDOCS,
    SUMMITDOC_DELETED,
} from '../../actions/summitdoc-actions';

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/utils/actions';

const DEFAULT_STATE = {
    summitDocs      : [],
    term            : '',
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalSummitDocs : 0,
};

const summitDocListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_SUMMITDOCS: {
            let {order, orderDir, term} = payload;

            return {...state, order, orderDir, term }
        }
        case RECEIVE_SUMMITDOCS: {
            let {total, last_page, current_page} = payload.response;
            let summitDocs = payload.response.data.map(s => {
                return {
                    id: s.id,
                    name: s.name,
                    label: s.label,
                    description: s.description,
                    event_types_string: s.event_types.map(et => et.name).join(', ')
                };
            });

            return {...state, summitDocs: summitDocs, currentPage: current_page, totalSummitDocs: total, lastPage: last_page };
        }
        case SUMMITDOC_DELETED: {
            let {summitDocId} = payload;
            return {...state, summitDocs: state.summitDocs.filter(s => s.id !== summitDocId)};
        }
        default:
            return state;
    }
};

export default summitDocListReducer;
