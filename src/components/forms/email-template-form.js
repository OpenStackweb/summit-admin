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
import EmailTemplateInput from '../inputs/email-template-input'
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchtags';
import 'codemirror/addon/edit/closetag';
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";

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

    handleCodeMirrorChange(instance, change){
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};
        errors['html_content' ] = '';
        entity['html_content'] = instance.getValue();
        this.setState({entity: entity, errors: errors});
    }

    handleChange(ev) {
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        const {entity} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity);
    }

    handlePreview(ev) {
        const {entity} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity, true);
        this.props.onRender();
    }

    render() {
        const {entity, errors} = this.state;
        const { clients } = this.props;
        const email_clients_ddl = clients ? clients.map(cli => ({label: cli.name, value: cli.id})) : [];

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
                            error={hasErrors('identifier', errors)}
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
                            error={hasErrors('from_email', errors)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("emails.subject")} *</label>
                        <Input
                            id="subject"
                            value={entity.subject}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('subject', errors)}
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
                            error={hasErrors('max_retries', errors)}
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
