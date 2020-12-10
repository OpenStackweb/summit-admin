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

export default class PublishedFilter extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterChange = this.handleFilterChange.bind(this);

    }

    handleFilterChange(value) {
        let published = null;

        if (value.length === 1) {
            if ( value.includes('published')) {
                published = true;
            } else if ( value.includes('not-published')){
                published = false;
            }
        }

        this.props.onChange(published);
    }

    render() {
        let {value, onChange, ...rest} = this.props;

        return (
            <div className="published-filter">
                <label>Filter by Published</label>
                <ButtonToolbar>
                    <ToggleButtonGroup type="checkbox" defaultValue={["published", "not-published"]} onChange={this.handleFilterChange}>
                        <ToggleButton value="published">Published</ToggleButton>
                        <ToggleButton value="not-published">Not Published</ToggleButton>
                    </ToggleButtonGroup>
                </ButtonToolbar>
            </div>
        );
    }
}
