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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {Dropdown, Input, TextEditor} from 'openstack-uicore-foundation/lib/components'
import { findElementPos } from 'openstack-uicore-foundation/lib/methods'


class EmailTemplateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type == 'number') {
            value = parseInt(ev.target.value);
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let {entity, file} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity, file);
    }

    handlePreview(ev) {
        let {entity, file} = this.state;
        ev.preventDefault();

        console.log('Show Preview');
    }

    handleSendTest(ev) {
        let {entity, file} = this.state;
        ev.preventDefault();

        console.log('Test Sent');
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let email_templates_ddl = [
            {label: 'Template 1', value: 1},
            {label: 'Template 2', value: 2},
            {label: 'Template 3', value: 3},
        ];

        let email_clients_ddl = [
            {label: 'Client 1', value: 1},
            {label: 'Client 2', value: 2},
            {label: 'Client 3', value: 3},
        ];

        return (
            <form className="email-template-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("emails.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.client")} *</label>
                        <Dropdown
                            id="client_id"
                            value={entity.client_id}
                            placeholder={T.translate("emails.placeholders.select_client")}
                            options={email_clients_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.parent")} *</label>
                        <Dropdown
                            id="parent_id"
                            value={entity.parent_id}
                            placeholder={T.translate("emails.placeholders.select_parent")}
                            options={email_templates_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("emails.from_email")} *</label>
                        <Input
                            id="from_email"
                            value={entity.from_email}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('from_email')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.subject")} *</label>
                        <Input
                            id="subject"
                            value={entity.subject}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('subject')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.max_retries")} *</label>
                        <Input
                            id="max_retries"
                            type="number"
                            value={entity.max_retries}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('max_retries')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("emails.html_content")} *</label>
                        <TextEditor
                            id="html_content"
                            value={entity.html_content}
                            onChange={this.handleChange}
                            error={this.hasErrors('html_content')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("emails.plain_text")} *</label>
                        <TextEditor
                            id="plain_text"
                            value={entity.plain_text}
                            onChange={this.handleChange}
                            error={this.hasErrors('plain_text')}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")} />
                        <input type="button" onClick={this.handlePreview}
                               className="btn btn-primary pull-right" value={T.translate("emails.preview")} />
                        <input type="button" onClick={this.handleSendTest}
                               className="btn btn-primary pull-right" value={T.translate("emails.send_test")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default EmailTemplateForm;
