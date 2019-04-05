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

import { START_LOADING, STOP_LOADING, RECEIVE_COUNTRIES, LOGOUT_USER } from "openstack-uicore-foundation/lib/actions";

const DEFAULT_STATE = {
    loading: false,
    countries: []
}

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            //console.log('START_LOADING')
            return {...state, loading: true};
        break;
        case STOP_LOADING:
            //console.log('STOP_LOADING')
            return {...state, loading: false};
        break;
        case RECEIVE_COUNTRIES:
            return {...state, countries: payload};
        default:
            return state;
        break;
    }
}

export default baseReducer
