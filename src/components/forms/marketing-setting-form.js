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
import {Dropdown, Input, TextEditor, UploadInput} from 'openstack-uicore-foundation/lib/components'
import { findElementPos } from 'openstack-uicore-foundation/lib/methods'


class MarketingSettingForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
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

    handleUploadFile(file) {
        let entity = {...this.state.entity};
        let {valueField} = this.props;

        entity[valueField] = file.preview;

        this.setState({file: file, entity:entity});
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};
        let {valueField} = this.props;

        entity[valueField] = '';
        this.setState({entity:entity});
    }

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;
        let event_types_ddl = [
            {label: 'Plain Text', value: 'text'},
            {label: 'Html', value: 'html'},
            {label: 'File', value: 'file'},
        ];

        return (
            <form className="marketing-setting-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("marketing.type")} *</label>
                        <Dropdown
                            id="class_name"
                            value={entity.class_name}
                            placeholder={T.translate("marketing.placeholders.select_type")}
                            options={event_types_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("marketing.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    {entity.type == 'text' &&
                    <div className="col-md-4">
                        <label> {T.translate("marketing.plain_text")} *</label>
                        <Input
                            id="value"
                            value={entity.value}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('value')}
                        />
                    </div>
                    }
                    {entity.type == 'textarea' &&
                    <div className="col-md-4">
                        <label> {T.translate("marketing.html")} *</label>
                        <TextEditor
                            id="value"
                            value={entity.value}
                            onChange={this.handleChange}
                            error={this.hasErrors('value')}
                        />
                    </div>
                    }
                    {entity.type == 'file' &&
                    <div className="col-md-4">
                        <label> {T.translate("marketing.file")} *</label>
                        <UploadInput
                            value={entity.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                        />
                    </div>
                    }
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

export default MarketingSettingForm;
