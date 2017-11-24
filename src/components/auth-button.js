import React from 'react'
import { withRouter } from 'react-router-dom'

const AuthButton = withRouter(({ history,isLoggedUser, doLogin, doLogout }) => (
    isLoggedUser ? (
        <div className="logout">
            <button className="btn btn-default" onClick={() => { doLogout(); }}>Sign out</button>
        </div>
    ) : (
        <div className="login">
            You are not logged in. Please log in to continue:<br/><br/>
            <button className="btn btn-primary btn-lg" onClick={() => { doLogin(); }}>Log in</button>
        </div>
    )
))

export default AuthButton;