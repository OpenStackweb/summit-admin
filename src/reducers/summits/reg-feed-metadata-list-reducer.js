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


import { RECEIVE_REG_FEED_METADATA_LIST, REQUEST_REG_FEED_METADATA_LIST, REG_FEED_METADATA_DELETED, REG_FEED_METADATA_ADDED, REG_FEED_METADATA_UPDATED } from "../../actions/reg-feed-metadata-actions";

import {SET_CURRENT_SUMMIT} from "../../actions/summit-actions";
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';

const DEFAULT_STATE = {
    regFeedMetadata : [],
    term            : '',
    order           : 'id',
    orderDir        : 1,
    currentPage     : 1,
    lastPage        : 1,
    perPage         : 10,
    totalRegFeedMetadata   : 0
};

const currentRegFeedMetadataListReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action
    switch (type) {
        case SET_CURRENT_SUMMIT:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case REQUEST_REG_FEED_METADATA_LIST: {
            let { order, orderDir, term, page, perPage, ...rest } = payload;
            return { ...state, order, orderDir, term, currentPage: page, perPage, ...rest }            
        }
        case RECEIVE_REG_FEED_METADATA_LIST: {
            const {data, last_page, total, current_page } = payload.response;
            return {...state, regFeedMetadata: data, currentPage: current_page, lastPage: last_page, totalRegFeedMetadata: total}
        }
        case REG_FEED_METADATA_ADDED: {
            let newRegFeedMetadata = payload.response;
            return {...state, regFeedMetadata: [...state.regFeedMetadata, newRegFeedMetadata] };
        }
        case REG_FEED_METADATA_UPDATED: {
            const editedRegFeedMetadata = payload.response;
            const isOnList = state.regFeedMetadata.some(e => e.id === editedRegFeedMetadata.id);
            return {...state, regFeedMetadata: isOnList ? [...state.regFeedMetadata.filter(regFeed => regFeed.id === editedRegFeedMetadata), editedRegFeedMetadata] : state.regFeedMetadata}
        }
        case REG_FEED_METADATA_DELETED: {
            let {regFeedMetadataId} = payload;
            return {...state, regFeedMetadata: state.regFeedMetadata.filter(regFeed => regFeed.id !== regFeedMetadataId)};
        }
        default:
            return state;
    }
};

export default currentRegFeedMetadataListReducer;
