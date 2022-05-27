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
import { SegmentedControl } from 'segmented-control'

export default class AttendanceFilter extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterChange = this.handleFilterChange.bind(this);

        this.state = {
            filterValue: this.props.value
        }

    }

    handleFilterChange(value) {
        const { filterValue } = this.state;
        if (value !== filterValue) {
            this.setState({ filterValue: value }, () => this.props.onChange(value))
        }
    }

    render() {
        let { onChange, ...rest } = this.props;
        let { filterValue } = this.state;

        return (
            <div className="attendance-filter">
                <label>Filter by Attendance (pressed = show)</label>
                <SegmentedControl
                    name="memberFilter"
                    options={[
                        { label: "All", value: null, default: filterValue === null },
                        { label: "Registered", value: "registered", default: filterValue === "registered" },
                        { label: "Confirmed", value: "confirmed", default: filterValue === "confirmed" },
                    ]}
                    setValue={newValue => this.handleFilterChange(newValue)}
                    style={{ width: "100%", height: 40, color: '#337ab7', fontSize: '10px' }}
                />
            </div>
        );
    }
}
