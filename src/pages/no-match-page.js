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

import '../styles/no-match-page.less';


export default class NoMatchPage extends React.Component {

    render(){

        return (
            <div className="no_match_page_wrapper container">
                <h1>YOU JUST GOT 404'D</h1>
                <h3>This URL does not match any page in the admin.</h3>
            </div>
        );
    }
}
