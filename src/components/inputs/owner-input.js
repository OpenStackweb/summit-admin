/**
 * Copyright 2020 OpenStack Foundation
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
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';
import {queryMembers} from 'openstack-uicore-foundation/lib/utils/query-actions';
import T from 'i18n-react/dist/i18n-react'
import { Input } from 'openstack-uicore-foundation/lib/components'


export default class OwnerInput extends React.Component {

    constructor(props) {
        super(props);

        this.handleMemberChange = this.handleMemberChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getMembers = this.getMembers.bind(this);
    }

    handleMemberChange(value) {
        let theValue = {email: value.label, first_name:'', last_name: ''};

        if (value.member) {
            const {first_name, last_name} = value.member;
            theValue = {...theValue, first_name, last_name};
        }

        let ev = {target: {
            id: this.props.id,
            value: theValue,
            type: 'ownerinput'
        }};

        this.props.onChange(ev);
    }

    handleChange(ev) {
        let {value, id} = ev.target;

        let newEv = {target: {
            id: this.props.id,
            value: this.props.owner,
            type: 'ownerinput'
        }};

        newEv.target.value[id] = value;

        this.props.onChange(newEv);
    }

    getMembers (input, callback) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {
            let newOptions = options.map(m => ({value: m.email, label: m.email, member:m}));
            callback(newOptions);
        };


        queryMembers(input, translateOptions);
    }


    render() {
        let {owner, errors, onChange, id, multi, ...rest} = this.props;

        let theValue = owner ? {value: owner.email, label: owner.email} : null;

        return (
            <div className="row">
                <div className="col-md-4">
                    <label> 
                        {T.translate("edit_purchase_order.owner_email")} &nbsp;
                        <i className='copy-button fa fa-clipboard'
                            onClick={() => { navigator.clipboard.writeText(owner.hasOwnProperty("email") ? owner.email : '')}}
                        title="Copy to clipboard" />
                    </label>
                    <AsyncCreatableSelect
                        value={theValue}
                        onChange={this.handleMemberChange}
                        loadOptions={this.getMembers}
                        className={errors.email && 'error'}
                        noOptionsMessage={() => <>Type in email to get options.</>}
                        formatCreateLabel={(input) => <>Use this: <i>{input}</i> </>}
                        {...rest}
                    />
                    {errors.email &&
                    <p className="error-label">{errors.email}</p>
                    }
                </div>
                <div className="col-md-4">
                    <label> {T.translate("edit_purchase_order.owner_first_name")}</label>
                    <Input
                        id="first_name"
                        value={owner ? owner.first_name : ''}
                        onChange={this.handleChange}
                        className="form-control"
                        error={errors.first_name}
                    />
                </div>
                <div className="col-md-4">
                    <label> {T.translate("edit_purchase_order.owner_last_name")}</label>
                    <Input
                        id="last_name"
                        value={owner ? owner.last_name : ''}
                        onChange={this.handleChange}
                        className="form-control"
                        error={errors.last_name}
                    />
                </div>
            </div>
        );

    }
}

