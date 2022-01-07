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


export default class AuthButton extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showLogOut: false,
        };

        this.toggleLogOut = this.toggleLogOut.bind(this);
    }

    toggleLogOut(ev) {
        this.setState({showLogOut: !this.state.showLogOut});
    }

    render() {
        let {isLoggedUser, doLogin, initLogOut, picture} = this.props;
        let {showLogOut} = this.state;

        if (isLoggedUser) {
            return (
                <div className="user-menu" onMouseEnter={this.toggleLogOut} onMouseLeave={this.toggleLogOut}>
                    <div className="profile-pic" style={{backgroundImage: `url(${picture})`}} />
                    {showLogOut &&
                    <button className="btn btn-default logout" onClick={() => { initLogOut(); }}>
                        {T.translate("landing.sign_out")}
                    </button>
                    }
                </div>
            );
        } else {
            return (
                <div className="login">
                    {T.translate("landing.not_logged_in")}
                    <br/><br/>
                    <button className="btn btn-primary btn-lg" onClick={() => { doLogin(); }}>
                        {T.translate("landing.log_in")}
                    </button>
                </div>
            );
        }

    }
}
