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

import React from 'react';


export default class Panel extends React.Component {

    render() {

        let {children, showSection, name, title, handleClick, className} = this.props;

        return (
            <div className={"panel-group " + className}>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 className="panel-title">
                            <a className={showSection == name ? 'collapsed' : ''} onClick={handleClick}>
                                {title}
                            </a>
                        </h4>
                    </div>
                    <div className="panel-collapse collapse in">
                        {showSection === name &&
                        <div className="panel-body">
                            {children}
                        </div>
                        }
                    </div>
                </div>
            </div>
        );

    }
}