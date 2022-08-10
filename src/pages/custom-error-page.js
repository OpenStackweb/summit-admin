/**
 * Copyright 2018 OpenStack Foundation
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
import React from 'react';
import URI from "urijs";
import Swal from "sweetalert2";
import '../styles/error-page.less';
import T from "i18n-react/dist/i18n-react";
import {getBackURL} from "openstack-uicore-foundation/lib/utils/methods";
import {doLogin} from "openstack-uicore-foundation/lib/security/methods";

class CustomErrorPage extends React.Component {

    componentDidMount() {
        let query = URI.parseQuery(this.props.location.search);
        Swal.fire(query.error,
            query.error_description,
            "error");
    }

    onClickLogin(){
        doLogin(getBackURL());
    }

    render(){
        return (
            <div className="error_page_wrapper container">
                <h1>{T.translate("landing.not_logged_in")}</h1>

                <br/><br/>
                <button className="btn btn-primary btn-lg" onClick={this.onClickLogin.bind(this)}>
                    {T.translate("landing.log_in")}
                </button>
            </div>
        );
    }
}

export default CustomErrorPage;
