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

import history from '../history'
import React from 'react'
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import AbstractAuthorizationCallbackRoute from "openstack-uicore-foundation/lib/security/abstract-auth-callback-route";
import { getUserInfo } from "openstack-uicore-foundation/lib/security/actions";

class AuthorizationCallbackRoute extends AbstractAuthorizationCallbackRoute {

    constructor(props){
        super(process.env['IDP_BASE_URL'], process.env['OAUTH2_CLIENT_ID'], props);
    }

    _callback(backUrl) {
        if(!backUrl) backUrl = '/app/directory';
        this.props.getUserInfo('groups','', backUrl, history);
    }

    _redirect2Error(error){
        return (
            <Route render={ props => {
                return <Redirect to={`/error?error=${error}`} />
            }} />
        )
    }
}

const mapStateToProps = ({ loggedUserState }) => ({
})

export default connect(mapStateToProps,{
    getUserInfo
})(AuthorizationCallbackRoute)

