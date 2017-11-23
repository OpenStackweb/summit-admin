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

