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
import {Input, Dropdown} from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual} from "../../utils/methods";


class MediaUploadForm extends React.Component {
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

        if (!shallowEqual(prevProps.entity, this.props.entity)) {
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
        if (field in errors) {
            return errors[field];
        }

        return '';
    }


    render() {
        const {entity} = this.state;
        const {currentSummit, mediaFileTypes} = this.props;

        let private_storage_ddl = [
            {value: 'None', label: 'None'},
            {value: 'DropBox', label: 'DropBox'},
            {value: 'Local', label: 'Local'}
        ];

        let public_storage_ddl = [
            {value: 'None', label: 'None'},
            {value: 'Local', label: 'Local'}
        ];

        if (window.PUBLIC_STORAGES.includes("S3"))
            public_storage_ddl.push({value: 'S3', label: 'S3'});

        if (window.PUBLIC_STORAGES.includes("SWIFT"))
            public_storage_ddl.push({value: 'Swift', label: 'Swift'});

        let presentation_types_ddl = currentSummit.event_types
            .filter(t => t.class_name === 'PresentationType')
            .map(t => ({value: t.id, label: t.name}));

        return (
            <form className="media-upload-form">
                <input type="hidden" id="id" value={entity.id}/>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("media_upload.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={this.hasErrors('name')}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("media_upload.max_size")} *</label>
                        <Input
                            type="number"
                            id="max_size"
                            className="form-control"
                            error={this.hasErrors('max_size')}
                            onChange={this.handleChange}
                            value={entity.max_size}
                        />
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_mandatory" checked={entity.is_mandatory}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="is_mandatory">
                                {T.translate("media_upload.is_mandatory")}
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8">
                        <label> {T.translate("media_upload.description")}</label>
                        <textarea
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4 text-left">
                        <label> {T.translate("media_upload.type")}</label>
                        <Dropdown
                            id="type_id"
                            className="right-space"
                            value={entity.type_id}
                            placeholder={T.translate("media_upload.placeholders.select_type")}
                            options={mediaFileTypes}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("media_upload.private_storage_type")}</label>
                        <Dropdown
                            id="private_storage_type"
                            className="right-space"
                            value={entity.private_storage_type}
                            placeholder={T.translate("media_upload.placeholders.select_private_storage")}
                            options={private_storage_ddl}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row">
                                    <div className="col-md-12">
                                        <label> {T.translate("media_upload.public_storage_type")}</label>
                                        <Dropdown
                                            id="public_storage_type"
                                            className="right-space"
                                            value={entity.public_storage_type}
                                            placeholder={T.translate("media_upload.placeholders.select_public_storage")}
                                            options={public_storage_ddl}
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-check abc-checkbox">
                                            <input type="checkbox" id="use_temporary_links_on_public_storage"
                                                   checked={entity.use_temporary_links_on_public_storage}
                                                   onChange={this.handleChange} className="form-check-input"/>
                                            <label className="form-check-label"
                                                   htmlFor="use_temporary_links_on_public_storage">
                                                {T.translate("media_upload.use_temporary_links_on_public_storage")}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <i className="fa fa-info-circle info-help" aria-hidden="true"
                                           title={T.translate("media_upload.temporary_links_public_storage_ttl_info")}/>
                                        &nbsp;
                                        <Input
                                            type="number"
                                            id="temporary_links_public_storage_ttl"
                                            className="form-control"
                                            style={{width: '100px'}}
                                            error={this.hasErrors('temporary_links_public_storage_ttl')}
                                            onChange={this.handleChange}
                                            placeholder={T.translate("media_upload.placeholders.temporary_links_public_storage_ttl")}
                                            value={entity.temporary_links_public_storage_ttl}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-8 text-left">
                        <label> {T.translate("media_upload.presentation_types")}</label>
                        <Dropdown
                            id="presentation_types"
                            className="right-space"
                            value={entity.presentation_types}
                            placeholder={T.translate("media_upload.placeholders.select_presentation_types")}
                            options={presentation_types_ddl}
                            onChange={this.handleChange}
                            isMulti
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

export default MediaUploadForm;
