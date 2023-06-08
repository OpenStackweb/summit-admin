/**
 * Copyright 2023 OpenStack Foundation
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
import AsyncSelect from 'react-select/lib/Async';
import { queryBadgeFeatures } from '../../actions/badge-actions';
import { shallowEqual } from "../../utils/methods";

export default class BadgeFeatureInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.getTemplates = this.getTemplates.bind(this);
        this.getOptionValue = this.getOptionValue.bind(this);
        this.getOptionLabel = this.getOptionLabel.bind(this);
    }

    getOptionValue(badgeFeature){
        if(this.props.hasOwnProperty("getOptionValue")){
            return this.props.getOptionValue(badgeFeature);
        }
        //default
        return badgeFeature.id;
    }

    getOptionLabel(badgeFeature){
        if(this.props.hasOwnProperty("getOptionLabel")){
            return this.props.getOptionLabel(badgeFeature);
        }
        //default
        return `${badgeFeature.name}`;
    }

    handleChange(value) {
        const ev = {
            target: {
                id: this.props.id,
                value: value,
                type: 'badgefeatureinput'
            }
        };
        this.props.onChange(ev);
    }

    getTemplates(input, callback) {
        const { summitId } = this.props;

        if (!input) {
            return Promise.resolve({ options: [] });
        }

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {
            const newOptions = options.map(c => ({ id: c.id, name: c.name, value: c.id, label: c.name }));
            callback(newOptions);
        };

        queryBadgeFeatures(summitId, input, translateOptions);
    }

    render() {
        const { error, value, onChange, id, ...rest } = this.props;
        const has_error = (this.props.hasOwnProperty('error') && error !== '');

        return (
            <div>
                <AsyncSelect
                    value={value}
                    onChange={this.handleChange}
                    loadOptions={this.getTemplates}
                    getOptionValue={m => this.getOptionValue(m)}
                    getOptionLabel={m => this.getOptionLabel(m)}                    
                    isMulti
                    {...rest}
                />
                {has_error &&
                    <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}