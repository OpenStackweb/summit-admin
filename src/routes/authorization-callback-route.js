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

import URI from "urijs"
import React from 'react'
import { Route, Redirect, withRouter } from 'react-router-dom'

class AuthorizationCallbackRoute extends React.Component {

    componentWillMount() {
    }

    extractToken() {
        let parse = URI.parseQuery(this.props.location.hash.substr(1));
        return parse.access_token;
    }

    render() {
        let accessToken = this.extractToken();
        if(accessToken == undefined){
            return (
                <Route render={props => {
                    return <Redirect to="/error" />
                }} />
            )
        }
        this.props.onUserAuth(accessToken, "");
        return (
            <Route render={props => {
                return <Redirect to="/app" />
            }} />
        )
    }
}

export default AuthorizationCallbackRoute;

