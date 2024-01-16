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
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";
import history from "../../history";
import HexColorInput from '../inputs/hex-color-input';

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

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        const {entity, file} = this.state;
        const { currentSummit } = this.props;

        this.props.onSubmit(entity, file).then((payload) => {
            if(entity.id && entity.id > 0){
                // UPDATE
                this.props.showSuccessMessage(T.translate("marketing.setting_saved"));
                return;
            }

            const success_message = {
                title: T.translate("general.done"),
                html: T.translate("marketing.setting_created"),
                type: 'success'
            };

            this.props.showMessage(
                success_message,
                () => {
                    history.push(`/app/summits/${currentSummit.id}/marketing/${payload.response.id}`)
                }
            );
        })
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

        entity.file_preview = file.preview;

        this.setState({file: file, entity: entity});
    }

    handleRemoveFile(ev) {
        let entity = {...this.state.entity};

        entity.file_preview = '';
        this.setState({entity: entity});
    }

    render() {
        const {entity} = this.state;
        const { currentSummit } = this.props;
        let setting_types_ddl = [
            {label: 'Plain Text', value: 'TEXT'},
            {label: 'Html', value: 'TEXTAREA'},
            {label: 'File', value: 'FILE'},
            {label: 'Hex Color', value: 'HEX_COLOR'},
        ];

        return (
            <form className="marketing-setting-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("marketing.type")} *</label>
                        <Dropdown
                            id="type"
                            value={entity.type}
                            placeholder={T.translate("marketing.placeholders.select_type")}
                            options={setting_types_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("marketing.key")} *</label>
                        <Input
                            id="key"
                            value={entity.key}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('key')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("marketing.selection_plan")}</label>
                        <Input
                            id="selection_plan_id"
                            value={entity.selection_plan_id}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('selection_plan_id')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    {entity.type === 'TEXT' &&
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
                    {entity.type === 'TEXTAREA' &&
                    <div className="col-md-8">
                        <label> {T.translate("marketing.html")} *</label>
                        <TextEditor
                            id="value"
                            value={entity.value}
                            onChange={this.handleChange}
                            error={this.hasErrors('value')}
                        />
                    </div>
                    }
                    {entity.type === 'FILE' &&
                    <div className="col-md-12">
                        <label> {T.translate("marketing.file")} *</label>
                        <UploadInput
                            value={entity.file_preview || entity.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
                        />
                    </div>
                    }
                    {entity.type === 'HEX_COLOR' &&
                    <div className="col-md-4">
                        <label> {T.translate("marketing.hex_color")} *</label>
                        <HexColorInput                            
                            onChange={this.handleChange}
                            id="value"
                            value={entity.value}                            
                            className="form-control"
                            error={this.hasErrors('value')}
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
