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
import URI from "urijs"
import React from 'react'
import { withRouter } from 'react-router-dom'

class LogOutCallbackRoute extends React.Component {

    constructor(props){
        super(props);
        // control variable to avoid double api call
    }
    componentWillMount() {

    }

    render() {
        let storedState = window.localStorage.getItem('post_logout_state');
        window.localStorage.removeItem('post_logout_state');
        console.log(`retrieved state ${storedState}`);
        let { doLogout, location, history } = this.props;
        let query = URI.parseQuery(location.search);
        if(!query.hasOwnProperty("state"))
            return (<p>Invalid Method</p>);
        if(query["state"] != storedState)
            return (<p>Invalid State</p>);

        doLogout();
        history.push("/");
        return null;
    }
}

export default withRouter(LogOutCallbackRoute);

