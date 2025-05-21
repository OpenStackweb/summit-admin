/**
 * Copyright 2018 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * */

import React from "react";
import T from "i18n-react/dist/i18n-react";
import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";
import { Input, UploadInput } from "openstack-uicore-foundation/lib/components";
import { TextEditorV3 } from "openstack-uicore-foundation/lib/components/inputs/editor-input-v3";
import { isEmpty, scrollToError, shallowEqual } from "../../utils/methods";

class ImageForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: { ...props.entity },
      file: null,
      errors: props.errors
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
  }

  componentDidUpdate(prevProps) {
    const state = {};
    scrollToError(this.props.errors);

    if (!shallowEqual(prevProps.entity, this.props.entity)) {
      state.entity = { ...this.props.entity };
      state.errors = {};
    }

    if (!shallowEqual(prevProps.errors, this.props.errors)) {
      state.errors = { ...this.props.errors };
    }

    if (!isEmpty(state)) {
      this.setState({ ...this.state, ...state });
    }
  }

  handleChange(ev) {
    const entity = { ...this.state.entity };
    const errors = { ...this.state.errors };
    const { value, id } = ev.target;

    errors[id] = "";
    entity[id] = value;
    this.setState({ entity, errors });
  }

  handleSubmit(ev) {
    const { entity, file } = this.state;
    const { locationId } = this.props;

    ev.preventDefault();

    this.props.onSubmit(locationId, entity, file);
  }

  hasErrors(field) {
    const { errors } = this.state;
    if (field in errors) {
      return errors[field];
    }

    return "";
  }

  handleUploadFile(file) {
    const entity = { ...this.state.entity };
    const { valueField } = this.props;

    entity[valueField] = file.preview;

    this.setState({ file, entity });
  }

  handleRemoveFile() {
    const entity = { ...this.state.entity };
    const { valueField } = this.props;

    entity[valueField] = "";
    this.setState({ entity });
  }

  render() {
    const { entity } = this.state;
    const { valueField } = this.props;

    return (
      <form className="image-form">
        <input type="hidden" id="id" value={entity.id} />
        <div className="row form-group">
          <div className="col-md-4">
            <label> {T.translate("general.name")} *</label>
            <Input
              id="name"
              value={entity.name}
              onChange={this.handleChange}
              className="form-control"
              error={this.hasErrors("name")}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-12">
            <label> {T.translate("general.description")} </label>
            <TextEditorV3
              id="description"
              value={entity.description}
              onChange={this.handleChange}
              error={this.hasErrors("description")}
              license={process.env.JODIT_LICENSE_KEY}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-12">
            <label> {T.translate("general.file")} </label>
            <UploadInput
              value={entity[valueField]}
              handleUpload={this.handleUploadFile}
              handleRemove={this.handleRemoveFile}
              className="dropzone col-md-6"
              multiple={false}
              accept="image/*"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 submit-buttons">
            <input
              type="button"
              onClick={this.handleSubmit}
              className="btn btn-primary pull-right"
              value={T.translate("general.save")}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default ImageForm;
