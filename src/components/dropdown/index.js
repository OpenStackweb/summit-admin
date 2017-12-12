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

export default class Dropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            error: false,
            touched: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.hasOwnProperty('value') &&  this.state.value != nextProps.value) {
            this.setState({value: nextProps.value});
        }
    }

    handleChange(selection) {
        this.setState({
            touched: false
        });

        let ev = {target: {
            id: this.props.id,
            value: selection.value,
            type: 'dropdown'
        }};

        this.props.onChange(ev);
    }

    validate(ev) {
        let {value} = this.state;
        let error = (value == 0);

        this.setState({
            error: error,
            touched: true
        });

    }

    render() {

        let {onChange, id, value, required, ...rest} = this.props;
        let {error, touched} = this.state;

        let has_error = (required && error && touched);

        return (
            <div>
                <Select
                    className={has_error ? 'is-invalid-select' : ''}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onBlur={this.validate}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">Required</p>
                }
            </div>
        );

    }
}