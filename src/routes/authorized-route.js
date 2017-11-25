import React from 'react'
import { Route, Redirect, withRouter } from 'react-router-dom'

class AuthorizedRoute extends React.Component {

    componentWillMount() {
    }

    render() {
        const { component: Component, getUserInfo, isLoggedUser,currentSummit, ...rest } = this.props;
        return (
            <Route {...rest} render={props => {
                return isLoggedUser
                    ? <Component getUserInfo={getUserInfo} currentSummit={currentSummit} {...props} />
                    : <Redirect
                        to={{
                            pathname: '/',
                            state: { from: props.location }
                        }}
                      />
            }} />
        )
    }
}

export default AuthorizedRoute;


