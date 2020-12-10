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
import {ButtonToolbar, ToggleButtonGroup, ToggleButton} from 'react-bootstrap'

export default class StatusFilter extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterChange = this.handleFilterChange.bind(this);

    }

    handleFilterChange(value) {
        let status = null;

        if (value.length === 1) {
            if ( value.includes('received')) {
                status = "received";
            } else if ( value.includes('not-received')){
                status = "null";
            }
        }

        this.props.onChange(status);
    }

    render() {
        let {value, onChange, ...rest} = this.props;

        return (
            <div className="received-filter">
                <label>Filter by Status</label>
                <ButtonToolbar>
                    <ToggleButtonGroup type="checkbox" defaultValue={["received", "not-received"]} onChange={this.handleFilterChange}>
                        <ToggleButton value="received">Received</ToggleButton>
                        <ToggleButton value="not-received">Not Received</ToggleButton>
                    </ToggleButtonGroup>
                </ButtonToolbar>
            </div>
        );
    }
}
