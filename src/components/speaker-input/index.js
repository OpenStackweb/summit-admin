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
import {querySpeakers} from '../../actions/base-actions';

export default class SpeakerInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
        this.getSpeakers = this.getSpeakers.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.hasOwnProperty('value') && this.state.value != nextProps.value) {
            this.setState({value: nextProps.value});
        }
    }

    handleChange(value) {
        let ev = {target: {
            id: this.props.id,
            value: value,
            type: 'speakerinput'
        }};

        this.props.onChange(ev);
    }

    handleClick(value) {
        let {history, summitId} = this.props;

        history.push(`/app/speakers/${value.id}`);
    }

    filterOptions(options, filterString, values) {
        if (this.props.multi) {
            let filtered_options = options.filter( op => {
                return values.map(val => val.id).indexOf( op.id ) < 0;
            } );

            return filtered_options;
        } else {
            return options;
        }
    }

    getSpeakers (input) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        let summitId = (this.props.hasOwnProperty('queryAll')) ? null : this.props.summitId;

        return querySpeakers(summitId, input);
    }

    processTagValues(new_values) {
        if (this.props.multi) {
            if (!new_values) return [];
            new_values = Array.isArray(new_values) ? new_values : [new_values];

            return new_values.map(v => {
                if (v.hasOwnProperty('name'))
                    return {id: v.id, name: v.name};
                else
                    return {id: v.id, name: v.first_name + ' ' + v.last_name + ' (' + v.id + ')'};
            });

        } else {
            let value = {};
            if (!new_values || !new_values.hasOwnProperty('id')) return value;

            let label = new_values.hasOwnProperty('name') ? new_values.name : new_values.first_name + ' ' + new_values.last_name + ' (' + new_values.id + ')';

            return {id: new_values.id, name: label};
        }

    }

    render() {
        let {value, onChange, history, summitId, error, id, ...rest} = this.props;
        let has_error = ( this.props.hasOwnProperty('error') && error != '' );

        return (
            <div>
                <Select.Async
                    value={this.processTagValues(this.state.value)}
                    onChange={this.handleChange}
                    loadOptions={this.getSpeakers}
                    onValueClick={this.handleClick}
                    backspaceRemoves={true}
                    valueKey="id"
                    labelKey="name"
                    filterOptions={this.filterOptions}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}

