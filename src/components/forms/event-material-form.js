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
import { Dropdown, Input, UploadInputV2, TextEditor} from 'openstack-uicore-foundation/lib/components'
import {isEmpty, scrollToError, shallowEqual, hasErrors} from "../../utils/methods";


class EventMaterialForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            file: null,
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeMUType = this.handleChangeMUType.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        this.onMediaUploadComplete = this.onMediaUploadComplete.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        const name = this.props.entity.id ? this.props.entity.name : this.props.event.title;
        const description = this.props.entity.id ? this.props.entity.description : this.props.event.description;

        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = {...this.props.entity, name, description};
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

    handleChangeMUType(ev) {
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};
        const {value} = ev.target;

        const type = this.props.event.type.allowed_media_upload_types.find(mu => mu.id === value);
        errors.media_upload_type_id = '';
        entity.media_upload_type_id = value;
        entity.media_upload_type = type;
        entity.name = type.name;

        this.setState({entity: entity, errors: errors});
    }

    handleUploadFile(file) {
        this.setState({file: file});
    }

    handleRemoveFile(ev) {
        const entity = {...this.state.entity};
        entity.file_link = '';
        entity.filename = '';
        entity.filepath = '';
        this.setState({entity: entity, file: null});
    }

    onMediaUploadComplete(response, id, data){
        const {entity} = this.state;

        if(response){
            entity.filepath = `${response.path}${response.name}`;
            entity.filename = response.name;
            this.setState({entity});
        }
    }

    handleSubmit(ev) {
        const {entity} = this.state;
        ev.preventDefault();
        this.props.onSubmit(entity);
    }

    render() {
        const {entity, errors} = this.state;
        // on admin we upload one per time
        const media_type ={ ... entity.media_upload_type, max_uploads_qty:1};
        const mediaInputValue = entity.filename ? [entity] : [];

        const event_materials_ddl = [
            {label: 'Link', value: 'PresentationLink'},
            {label: 'Slide', value: 'PresentationSlide'},
            {label: 'Video', value: 'PresentationVideo'},
            {label: 'Media Upload', value: 'PresentationMediaUpload'}
        ];

        const media_uploads_ddl = this.props.event.type.allowed_media_upload_types.map(mu => ({label: mu.name, value: mu.id}));

        const disableInputs = entity.class_name === 'PresentationMediaUpload';

        const slideMediaType = {
            id: 'slide',
            max_size: 500 * 1024,
            type: {
                allowed_extensions: ['jpg','jpeg','ppt', 'pptx', 'pdf']
            }
        };

        return (
            <form className="event-material-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_material.type")} *</label>
                        <Dropdown
                            id="class_name"
                            key="class_name_ddl"
                            value={entity.class_name}
                            placeholder={T.translate("edit_event_material.placeholders.select_type")}
                            options={event_materials_ddl}
                            onChange={this.handleChange}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    {entity.class_name === 'PresentationMediaUpload' &&
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_material.media_upload_type")} *</label>
                        <Dropdown
                            id="media_upload_type_id"
                            value={entity.media_upload_type_id}
                            placeholder={T.translate("edit_event_material.placeholders.select_type")}
                            options={media_uploads_ddl}
                            onChange={this.handleChangeMUType}
                            disabled={entity.id !== 0}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_event_material.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('name', errors)}
                            disabled={disableInputs}
                        />
                    </div>
                    <div className="col-md-6 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="display_on_site" checked={entity.display_on_site}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="display_on_site">
                                {T.translate("edit_event_material.display_on_site")}
                            </label>
                        </div>
                    </div>
                </div>

                {!disableInputs &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_material.description")} *</label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={hasErrors('description', errors)}
                        />
                    </div>
                </div>
                }
                {entity.class_name === 'PresentationLink' &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_event_material.link")} *</label>
                        <Input
                            id="link"
                            value={entity.link}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('link', errors)}
                        />
                    </div>
                </div>
                }

                {entity.class_name === 'PresentationSlide' &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_material.slide")} (max size 500Mb)</label>
                        <UploadInputV2
                            id="slide"
                            onUploadComplete={this.onMediaUploadComplete}
                            value={mediaInputValue}
                            mediaType={slideMediaType}
                            postUrl={`${window.API_BASE_URL}/api/public/v1/files/upload`}
                            error={hasErrors("slide", errors)}
                            djsConfig={{withCredentials:true}}
                        />
                    </div>
                    <div className="col-md-7 text-center">
                        <br/>
                        <label> OR </label>
                    </div>
                    <div className="col-md-6">
                        <label> {T.translate("edit_event_material.link")}</label>
                        <Input
                            id="link"
                            value={entity.link}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('link', errors)}
                        />
                    </div>
                </div>
                }

                {entity.class_name === 'PresentationVideo' &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_event_material.youtube_id")} *</label>
                        <Input
                            id="youtube_id"
                            value={entity.youtube_id}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('youtube_id', errors)}
                        />
                    </div>
                </div>
                }
                {entity.class_name === 'PresentationVideo' &&
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("edit_event_material.external_url")} *</label>
                        <Input
                            id="external_url"
                            value={entity.external_url}
                            onChange={this.handleChange}
                            className="form-control"
                            error={hasErrors('external_url', errors)}
                        />
                    </div>
                </div>
                }

                {entity.class_name === 'PresentationMediaUpload' && media_type && media_type.type &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_material.media_upload_file")} {`(max size: ${entity.media_upload_type.max_size/1024}Mb )`}</label>
                        <UploadInputV2
                            id={`media_upload_${media_type.id}`}
                            onUploadComplete={this.onMediaUploadComplete}
                            value={mediaInputValue}
                            mediaType={media_type}
                            onRemove={this.handleRemoveFile}
                            postUrl={`${window.API_BASE_URL}/api/public/v1/files/upload`}
                            error={hasErrors(media_type.name, errors)}
                            djsConfig={{withCredentials:true}}
                        />
                    </div>
                </div>
                }

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

export default EventMaterialForm;
