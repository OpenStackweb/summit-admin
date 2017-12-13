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

export default class Input extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if( nextProps.hasOwnProperty('value') && this.state.value != nextProps.value ) {
            this.setState({
                value: nextProps.value
            });
        }
    }

    handleChange(ev) {
        this.props.onChange(ev);
    }

    render() {

        let {onChange, value, className, error, ...rest} = this.props;
        let has_error = ( error != '' );

        return (
            <div>
                <input
                    className={className + ' ' + (has_error ? 'error' : '')}
                    value={this.state.value}
                    onChange={this.handleChange}
                    {...rest}
                />
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}