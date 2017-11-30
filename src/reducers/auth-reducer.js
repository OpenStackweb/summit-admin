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

import { LOGOUT_USER , SET_LOGGED_USER, RECEIVE_USER_INFO} from '../actions';

const DEFAULT_STATE = {
    isLoggedUser: false,
    accessToken: null,
    member: null,
}

const loggedUserReducer = (state = DEFAULT_STATE, action) => {

    if (action.type === SET_LOGGED_USER) {
        let {accessToken } = action.payload;
        window.accessToken = accessToken;
        return {...state, isLoggedUser:true, accessToken };
    }
    if(action.type === LOGOUT_USER){
        window.accessToken = null;
        return DEFAULT_STATE
    }
    if(action.type === RECEIVE_USER_INFO){
        let { response } = action.payload;
        return {...state, member: response};
    }
    return state
}

export default loggedUserReducer