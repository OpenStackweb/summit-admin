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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input, Dropdown } from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class SponsorshipForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }


    render() {
        const {entity} = this.state;
        const { currentSummit } = this.props;

        let size_ddl = [
            {label: 'Small', value: 'Small'},
            {label: 'Medium', value: 'Medium'},
            {label: 'Large', value: 'Large'},
            {label: 'Big', value: 'Big'},
        ];

        return (
            <form className="sponsorship-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsorship.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={this.hasErrors('name')}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>


                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsorship.label")}</label>
                        <Input
                            className="form-control"
                            type="label"
                            error={this.hasErrors('label')}
                            id="label"
                            value={entity.label}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsorship.size")}</label>
                        <Dropdown
                            id="size"
                            value={entity.size}
                            key={JSON.stringify(entity.size)}
                            onChange={this.handleChange}
                            placeholder={T.translate("edit_sponsorship.placeholders.select_size")}
                            options={size_ddl}
                            error={this.hasErrors('size')}
                        />
                    </div>
                </div>


                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default SponsorshipForm;
