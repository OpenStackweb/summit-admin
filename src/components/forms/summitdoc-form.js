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
import {Dropdown, Input, TextArea, UploadInput} from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class SummitDocForm extends React.Component {
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

        if(prevProps.entity.id !== this.props.entity.id) {
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
        let {entity, file} = this.state;
        ev.preventDefault();

        this.props.onSubmit(entity, file);
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
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let event_types_ddl = currentSummit.event_types
            .filter( t => t.should_be_available_on_cfp )
            .map(et => ({value: et.id, label: et.name}));

        return (
            <form className="summitdoc-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("summitdoc.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("summitdoc.label")} *</label>
                        <Input
                            id="label"
                            value={entity.label}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('label')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("summitdoc.event_types")} *</label>
                        <Dropdown
                            id="event_types"
                            value={entity.event_types}
                            placeholder={T.translate("summitdoc.placeholders.select_type")}
                            options={event_types_ddl}
                            onChange={this.handleChange}
                            isMulti
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("summitdoc.description")} *</label>
                        <TextArea
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('description')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("summitdoc.file")} *</label>
                        <UploadInput
                            value={entity.file_preview || entity.file}
                            handleUpload={this.handleUploadFile}
                            handleRemove={this.handleRemoveFile}
                            className="dropzone col-md-6"
                            multiple={false}
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

export default SummitDocForm;
