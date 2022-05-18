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

import React from 'react'
import { Switch, Route, Router } from 'react-router-dom'
import PrimaryLayout from "./layouts/primary-layout"
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import LogOutCallbackRoute from './routes/logout-callback-route'
import AuthButton from './components/auth-button'
import DefaultRoute from './routes/default-route'
import { connect } from 'react-redux'
import { AjaxLoader, OPSessionChecker } from "openstack-uicore-foundation/lib/components";
import { getBackURL,onUserAuth, doLoginBasicLogin, doLogout, initLogOut, getUserInfo, resetLoading } from "openstack-uicore-foundation/lib/methods";
import T from 'i18n-react';
import CustomErrorPage from "./pages/custom-error-page";
import history from './history'
import exclusiveSections from 'js-yaml-loader!./exclusive-sections.yml';
import IdTokenVerifier from 'idtoken-verifier';
import {getTimezones} from './actions/base-actions';


// here is set by default user lang as en
let language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

// DISABLED language - ONLY ENGLISH

T.setTexts(require(`./i18n/en.json`));

// move all env var to global scope so ui core has access to this

window.IDP_BASE_URL             = process.env['IDP_BASE_URL'];
window.API_BASE_URL             = process.env['API_BASE_URL'];
window.REPORT_API_BASE_URL      = process.env['REPORT_API_BASE_URL'];
window.MARKETING_API_BASE_URL   = process.env['MARKETING_API_BASE_URL'];
window.EMAIL_API_BASE_URL       = process.env['EMAIL_API_BASE_URL'];
window.OAUTH2_CLIENT_ID         = process.env['OAUTH2_CLIENT_ID'];
window.SCOPES                   = process.env['SCOPES'];
window.ALLOWED_USER_GROUPS      = process.env['ALLOWED_USER_GROUPS'];
window.EXCLUSIVE_SECTIONS       = [];
window.PUBLIC_STORAGES          = process.env['PUBLIC_STORAGES'] || "S3";
window.CHAT_API_BASE_URL        = process.env['CHAT_API_BASE_URL'];
window.APP_CLIENT_NAME          = process.env['APP_CLIENT_NAME'];

if (exclusiveSections.hasOwnProperty(process.env['APP_CLIENT_NAME'])) {
    window.EXCLUSIVE_SECTIONS = exclusiveSections[process.env['APP_CLIENT_NAME']];
}

class App extends React.PureComponent {

    constructor(props) {
        super(props);
        props.resetLoading();
    }

    onClickLogin(){
        doLoginBasicLogin(getBackURL());
    }

    componentDidMount() {
        this.props.getTimezones();
    }

    render() {
        const { isLoggedUser, onUserAuth, doLogout, getUserInfo, idToken, backUrl, loading} = this.props;

        // get user pic from idtoken claims (IDP)
        let profile_pic = '';

        if(idToken){
            let verifier = new IdTokenVerifier({
                issuer:   window.IDP_BASE_URL,
                audience: window.OAUTH2_CLIENT_ID
            });
            let jwt = verifier.decode(idToken);
            profile_pic = jwt.payload.picture;
        }

        return (
            <Router history={history}>
                <div>
                    <AjaxLoader show={ loading } size={ 120 }/>
                    <div className="header" id="page-header">
                        <div className="header-title">
                            {T.translate("landing.os_summit_admin")}
                            <AuthButton isLoggedUser={isLoggedUser} picture={profile_pic} doLogin={this.onClickLogin.bind(this)} initLogOut={initLogOut}/>
                        </div>
                    </div>
                    <Switch>
                        <AuthorizedRoute isLoggedUser={isLoggedUser} backUrl={backUrl} path="/app" component={PrimaryLayout} />
                        <AuthorizationCallbackRoute onUserAuth={onUserAuth} path='/auth/callback' getUserInfo={getUserInfo} />
                        <LogOutCallbackRoute doLogout={doLogout}  path='/auth/logout'/>
                        <Route path="/logout" render={props => (<p>404 - Not Found</p>)}/>
                        <Route path="/404" render={props => (<p>404 - Not Found</p>)}/>
                        <Route path="/error" component={CustomErrorPage}/>
                        <DefaultRoute isLoggedUser={isLoggedUser} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

const mapStateToProps = ({ loggedUserState, baseState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    backUrl: loggedUserState.backUrl,
    member: loggedUserState.member,
    idToken:  loggedUserState.idToken,
    loading : baseState.loading,
});

export default connect(mapStateToProps, {
    onUserAuth,
    doLogout,
    getUserInfo,
    resetLoading,
    getTimezones
})(App)
