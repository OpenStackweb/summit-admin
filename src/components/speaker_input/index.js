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
import 'react-select/dist/react-select.css';
import Select from 'react-select';
import {querySpeakers} from '../../actions/actions';

export default class SpeakerInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
        this.getSpeakers = this.getSpeakers.bind(this);
    }

    handleChange(value) {
        this.setState({
            value: value
        });

        let ev = {target: {
            id: this.props.id,
            value: value,
            type: 'speakerinput'
        }};

        this.props.onChange(ev);
    }

    getSpeakers (input) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        return querySpeakers(this.props.summitId, input);
    }

    processTagValues(new_values) {
        if (this.props.multi) {
            let values = [];
            if (!new_values) return values;
            new_values = Array.isArray(new_values) ? new_values : [new_values];

            for(let i in new_values) {
                let label = new_values[i].first_name + ' ' + new_values[i].last_name + ' (' + new_values[i].id + ')';
                values.push({value: new_values[i].id, label: label});
            }

            return values;
        } else {
            let value = {};
            if (!new_values) return value;

            let label = new_values.first_name + ' ' + new_values.last_name + ' (' + new_values.id + ')';
            value = {value: new_values.id, label: label};

            return value;
        }

    }

    render() {

        return (
            <Select.Async
                multi={this.props.multi}
                value={this.processTagValues(this.state.value)}
                onChange={this.handleChange}
                loadOptions={this.getSpeakers}
                backspaceRemoves={true}
            />
        );

    }
}

