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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {Dropdown, Input} from 'openstack-uicore-foundation/lib/components'
import { findElementPos } from 'openstack-uicore-foundation/lib/methods'
import EmailTemplateInput from '../inputs/email-template-input'
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchtags';
import 'codemirror/addon/edit/closetag';

class EmailTemplateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePreview = this.handlePreview.bind(this);
        this.handleCodeMirrorChange = this.handleCodeMirrorChange.bind(this);
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

    handleCodeMirrorChange(instance, change){
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        errors['html_content' ] = '';
        entity['html_content'] = instance.getValue();
        this.setState({entity: entity, errors: errors});
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
        let {entity} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity);
    }

    handlePreview(ev) {
        let {entity} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity, true);
        this.props.onRender();
    }

    handleSendTest(ev) {
        let {entity} = this.state;
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
        let { currentSummit, clients } = this.props;
        let email_clients_ddl = clients ? clients.map(cli => ({label: cli.name, value: cli.id})) : [];

        return (
            <form className="email-template-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("emails.name")} *</label>
                        <Input
                            id="identifier"
                            value={entity.identifier}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('identifier')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.client")} *</label>
                        <Dropdown
                            id="allowed_clients"
                            value={entity.allowed_clients}
                            placeholder={T.translate("emails.placeholders.select_client")}
                            options={email_clients_ddl}
                            onChange={this.handleChange}
                            isMulti
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.parent")} *</label>
                        <EmailTemplateInput
                            id="parent"
                            value={entity.parent}
                            ownerId={entity.id}
                            placeholder={T.translate("emails.placeholders.select_parent")}
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
                    <div className="col-md-12">
                        <label>
                            {T.translate("emails.html_content")}
                            {' in '}
                            <a href="https://opensource.com/sites/default/files/gated-content/osdc_cheatsheet-jinja2.pdf">
                                jinja format
                            </a>
                            {' *'}
                        </label>
                        <CodeMirror
                            id="html_content"
                            value={entity.html_content}
                            onChanges={this.handleCodeMirrorChange}
                            options={{
                                theme: 'monokai',
                                keyMap: 'sublime',
                                mode: 'html',
                                tabSize: 2,
                                lineNumbers: true,
                                autoCloseBrackets: true,
                                autoCloseTags: true,
                                matchTags: {bothTags: true},
                                extraKeys: {"Ctrl-J": "toMatchingTag"},
                            }}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")} />
                        <input type="button" onClick={this.handlePreview} disabled={!entity.id}
                               className="btn btn-primary pull-right" value={T.translate("emails.preview")} />
                        {/*<input type="button" onClick={this.handleSendTest}
                               className="btn btn-primary pull-right" value={T.translate("emails.send_test")}/>*/}
                    </div>
                </div>
            </form>
        );
    }
}

export default EmailTemplateForm;
