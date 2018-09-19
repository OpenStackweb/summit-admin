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
import { Route, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import IdTokenVerifier from 'idtoken-verifier'

class AuthorizationCallbackRoute extends React.Component {

    constructor(props){
        super(props);
        // control variable to avoid double api call
        this.accessTokenParsed = false;
    }
    componentWillMount() {

    }

    extractHashParams() {
        return URI.parseQuery(this.props.location.hash.substr(1));
    }

    validateIdToken(idToken){
        let verifier = new IdTokenVerifier({
            issuer:   process.env['IDP_BASE_URL'],
            audience: process.env['OAUTH2_CLIENT_ID']
        });
        let storedNonce = window.localStorage.getItem('nonce');
        window.localStorage.removeItem('nonce');
        console.log(`retrieved nonce ${storedNonce}`);
        let jwt    = verifier.decode(idToken);
        let alg    = jwt.header.alg;
        let kid    = jwt.header.kid;
        let aud    = jwt.payload.aud;
        let iss    = jwt.payload.iss;
        let exp    = jwt.payload.exp;
        let nbf    = jwt.payload.nbf;
        let tnonce = jwt.payload.nonce || null;
        return tnonce == storedNonce && aud == process.env['OAUTH2_CLIENT_ID'] && iss == process.env['IDP_BASE_URL'];
    }

    render() {
        let { getUserInfo } = this.props;

        if(this.accessTokenParsed) return null;


        let { access_token , id_token, session_state, error, error_description } = this.extractHashParams();

        if(access_token == undefined){
            return (
                <Route render={ props => {
                    return <Redirect to={`/error?error=${error}&error_description=${error_description}`} />
                }} />
            )
        }

        if(!this.validateIdToken(id_token))
        {
            let error = "validation error";
            let error_description = "invalid id token";
            return (
                <Route render={ props => {
                    return <Redirect to={`/error?error=${error}&error_description=${error_description}`} />
                }} />
            )
        }

        this.accessTokenParsed = true;
        this.props.onUserAuth(access_token, id_token, session_state);
        let url              = URI( window.location.href);
        let query            = url.search(true);
        let fragment         = URI.parseQuery(url.fragment());

        // purge fragment
        delete fragment['access_token'];
        delete fragment['expires_in'];
        delete fragment['token_type'];
        delete fragment['scope'];
        delete fragment['id_token'];
        delete fragment['session_state'];

        let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : '/app';

        if (fragment.length > 0) {
            backUrl     += `#${URI.buildQuery(fragment)}`;
        }

        getUserInfo(backUrl);

        return null;
    }
}

export default withRouter(AuthorizationCallbackRoute);

