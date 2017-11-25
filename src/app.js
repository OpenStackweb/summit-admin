import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PrimaryLayout from "./layouts/primary-layout"
import AuthorizedRoute from './routes/authorized-route'
import AuthorizationCallbackRoute from "./routes/authorization-callback-route"
import AuthButton from './components/auth-button'
import DefaultRoute from './routes/default-route'
import { connect } from 'react-redux'
import { onUserAuth, doLogin, doLogout, getUserInfo } from './actions'
import { BrowserRouter } from 'react-router-dom'
import { AjaxLoader } from "openstack-uicore-foundation";
import T from 'i18n-react';

// here is set by default user lang as en

let language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

// language would be something like es-ES or es_ES
// However we store our files with format es.json or en.json
// therefore retrieve only the first 2 digits

if (language.length > 2) {
    language = language.split("-")[0];
    language = language.split("_")[0];
}

console.log(`user language is ${language}`);

T.setTexts(require(`./i18n/${language}.json`));


class App extends React.PureComponent {
    render() {
        let { isLoggedUser, onUserAuth, doLogout, getUserInfo, currentSummit} = this.props;
        return (
            <BrowserRouter>
                <div>
                    <AjaxLoader show={ this.props.loading } size={ 120 }/>
                    <div className="row header">
                        <div className="col-md-12 text-center">
                            <h1>OpenStack Summit Admin</h1>
                            <AuthButton isLoggedUser={isLoggedUser} doLogin={doLogin} doLogout={doLogout}/>
                        </div>
                    </div>
                    <Switch>
                        <AuthorizedRoute currentSummit={currentSummit} isLoggedUser={isLoggedUser} getUserInfo={getUserInfo} path="/app" component={PrimaryLayout} />
                        <AuthorizationCallbackRoute onUserAuth={onUserAuth} path='/auth/callback'/>
                        <Route path="/404" render={props => (<p>404 - Not Found</p>)}/>
                        <DefaultRoute isLoggedUser={isLoggedUser} />
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

const mapStateToProps = ({ loggedUserState, baseState, currentSummitState }) => ({
    isLoggedUser: loggedUserState.isLoggedUser,
    loading : baseState.loading,
    currentSummit: currentSummitState.currentSummit,
})

export default connect(mapStateToProps, {
    onUserAuth,
    doLogin,
    doLogout,
    getUserInfo,
})(App)