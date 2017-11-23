import React from 'react'
import { withRouter } from 'react-router-dom'

const AuthButton = withRouter(({ history,isLoggedUser, doLogin, doLogout }) => (
    isLoggedUser ? (
        <p>
            Welcome! <button onClick={() => {
            doLogout();
        }}>Sign out</button>
        </p>
    ) : (
        <p>You are not logged in<button onClick={() => {
            doLogin();
        }}>Log in</button></p>
    )
))

export default AuthButton;