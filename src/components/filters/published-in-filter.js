/**
 * Copyright 2019 OpenStack Foundation
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
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'

export default class PublishedInFilter extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterChange = this.handleFilterChange.bind(this);

    }

    handleFilterChange(ev) {
        this.props.onChange(ev.target.checked);
    }

    render() {
        let {value, onChange, ...rest} = this.props;

        return (
            <div className="published-in-filter checkboxes-div">
                <div className="form-check abc-checkbox">
                  <input type="checkbox" id="published_in" checked={value ? true : false} onChange={this.handleFilterChange} className="form-check-input" />
                  <label className="form-check-label" htmlFor="published_in">
                    Only on Schedule
                  </label>
                </div>
            </div>
        );
    }
}
