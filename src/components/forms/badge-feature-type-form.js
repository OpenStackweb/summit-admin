/**
 * Copyright 2021 OpenStack Foundation
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

import React from "react";
import T from "i18n-react";
import {Input, TextEditor, UploadInput} from "openstack-uicore-foundation/lib/components";
import {hasErrors, isEmpty, scrollToError, shallowEqual} from "../../utils/methods";

class BadgeFeatureTypeForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
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
        const entity = {...this.state.entity};
        const errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        ev.preventDefault();
        this.props.onSubmit(this.state.entity);
    }

    handleUploadImage(file) {
        const entity = {...this.state.entity};

        entity.image = file.preview;
        this.setState({entity:entity});

        const formData = new FormData();
        formData.append('file', file);
        this.props.onUploadImage(this.state.entity, formData, 'profile')
    }

    handleRemoveFile(attr) {
        const entity = {...this.state.entity};

        entity[attr] = '';

        if (attr === 'image') {
            this.props.onRemoveImage(entity.id);
        }

        this.setState({entity:entity});
    }

    render(){
        const {entity, errors} = this.state;

        return(
            <form className="badge-feature-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_badge_feature.name")} *</label>
                        <Input
                            id="name"
                            className="form-control"
                            error={hasErrors('name', errors)}
                            onChange={this.handleChange}
                            value={entity.name}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_badge_feature.description")} *</label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={hasErrors('description', errors)}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_badge_feature.template_content")} *</label>
                        <TextEditor
                            id="template_content"
                            value={entity.template_content}
                            onChange={this.handleChange}
                            error={hasErrors('template_content', errors)}
                        />
                    </div>
                </div>
                {entity.id !== 0 &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_badge_feature.image")} </label>
                        <UploadInput
                            value={entity.image}
                            handleUpload={this.handleUploadImage}
                            handleRemove={ev => this.handleRemoveFile('image')}
                            className="dropzone col-md-6"
                            multiple={false}
                            accept="image/*"
                        />
                    </div>
                </div>
                }
                <hr />

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

export default BadgeFeatureTypeForm;