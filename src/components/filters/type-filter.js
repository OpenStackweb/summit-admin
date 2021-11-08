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
import Select from 'react-select'

export default class TypeFilter extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterChange = this.handleFilterChange.bind(this);

    }

    handleFilterChange(value) {
        let theValue = this.props.isMulti ? value.map(v => v.value) : value.value;
        this.props.onChange(theValue);
    }

    render() {
        let {types, value, onChange, ...rest} = this.props;
        let theValue = null;
        let options = types.map(t => ({value: t.id, label: t.name}));

        if (value) {
            theValue = this.props.isMulti ? options.filter(op => value.includes(op.value)) : options.find(op => op.value === value);
        }

        return (
            <div className="type-filter">
                <label>Filter by Type</label>
                <Select
                    value={theValue}
                    id="type-filter"
                    options={options}
                    onChange={this.handleFilterChange}
                    {...rest}
                />
            </div>
        );
    }
}
