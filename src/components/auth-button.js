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
import T from 'i18n-react/dist/i18n-react'
import { withRouter } from 'react-router-dom'

const AuthButton = withRouter(({ history, isLoggedUser, doLogin, doLogout }) => (
    isLoggedUser ? (
        <div className="logout">
            <button className="btn btn-default" onClick={() => { doLogout(); }}>
                {T.translate("landing.sign_out")}
            </button>
        </div>
    ) : (
        <div className="login">
            {T.translate("landing.not_logged_in")}
            <br/><br/>
            <button className="btn btn-primary btn-lg" onClick={() => { doLogin(); }}>
                {T.translate("landing.log_in")}
            </button>
        </div>
    )
))

export default AuthButton;