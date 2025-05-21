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
 * */

import React from "react";
import T from "i18n-react/dist/i18n-react";
import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";
import {
  Dropdown,
  Input,
  UploadInput
} from "openstack-uicore-foundation/lib/components";
import { TextEditorV3 } from "openstack-uicore-foundation/lib/components/inputs/editor-input-v3";
import Swal from "sweetalert2";
import { isEmpty, scrollToError, shallowEqual } from "../../utils/methods";
import history from "../../history";
import HexColorInput from "../inputs/hex-color-input";
import {
  MARKETING_SETTING_TYPE_FILE,
  MARKETING_SETTING_TYPE_HEX_COLOR,
  MARKETING_SETTING_TYPE_TEXT,
  MARKETING_SETTING_TYPE_TEXTAREA
} from "../../utils/constants";

const setting_types_ddl = [
  { label: "Plain Text", value: MARKETING_SETTING_TYPE_TEXT },
  { label: "Html", value: MARKETING_SETTING_TYPE_TEXTAREA },
  { label: "File", value: MARKETING_SETTING_TYPE_FILE },
  { label: "Hex Color", value: MARKETING_SETTING_TYPE_HEX_COLOR }
];

class MarketingSettingForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: { ...props.entity },
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
    const newEntity = { ...this.state.entity };
    const newErrors = { ...this.state.errors };
    let { value, id } = ev.target;

    if (ev.target.type === "checkbox") {
      value = ev.target.checked;
    }

    if (ev.target.type === "number") {
      value = parseInt(ev.target.value);
    }

    newErrors[id] = "";
    newEntity[id] = value;
    this.setState({ entity: newEntity, errors: newErrors });
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const { entity } = this.state;
    const { currentSummit } = this.props;
    if (
      (entity.type !== MARKETING_SETTING_TYPE_FILE && !entity.value) ||
      (entity.type === MARKETING_SETTING_TYPE_FILE && !entity.file)
    ) {
      const msg = `${
        setting_types_ddl.find((e) => e.value === entity.type)?.label
      }: This field may not be blank.`;
      return Swal.fire("Validation error", msg, "warning");
    }

    this.props.onSubmit(entity, entity.file).then((payload) => {
      if (entity.id && entity.id > 0) {
        // UPDATE
        this.props.showSuccessMessage(T.translate("marketing.setting_saved"));
        return;
      }

      const success_message = {
        title: T.translate("general.done"),
        html: T.translate("marketing.setting_created"),
        type: "success"
      };

      this.props.showMessage(success_message, () => {
        history.push(
          `/app/summits/${currentSummit.id}/marketing/${payload.response.id}`
        );
      });
    });
  }

  hasErrors(field) {
    const { errors } = this.state;
    if (field in errors) {
      return errors[field];
    }

    return "";
  }

  handleUploadFile(file) {
    const newEntity = { ...this.state.entity };

    newEntity.file = file;
    newEntity.file_preview = file.preview;

    this.setState({ entity: newEntity });
  }

  handleRemoveFile() {
    const newEntity = { ...this.state.entity };

    newEntity.file_preview = "";
    newEntity.file = "";

    if (newEntity.id) {
      this.props.onDeleteImage(newEntity.id).then(() => {
        newEntity.id = 0;
      });
    }

    this.setState({ entity: newEntity });
  }

  render() {
    const { entity } = this.state;

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
              error={this.hasErrors("key")}
            />
          </div>
          <div className="col-md-4">
            <label> {T.translate("marketing.selection_plan")}</label>
            <Input
              id="selection_plan_id"
              value={entity.selection_plan_id}
              onChange={this.handleChange}
              className="form-control"
              error={this.hasErrors("selection_plan_id")}
            />
          </div>
        </div>
        <div className="row form-group">
          {entity.type === MARKETING_SETTING_TYPE_TEXT && (
            <div className="col-md-4">
              <label> {T.translate("marketing.plain_text")} *</label>
              <Input
                id="value"
                value={entity.value}
                onChange={this.handleChange}
                className="form-control"
                error={this.hasErrors("value")}
              />
            </div>
          )}
          {entity.type === MARKETING_SETTING_TYPE_TEXTAREA && (
            <div className="col-md-12">
              <label> {T.translate("marketing.html")} *</label>
              <TextEditorV3
                id="value"
                value={entity.value}
                onChange={this.handleChange}
                error={this.hasErrors("value")}
                license={process.env.JODIT_LICENSE_KEY}
              />
            </div>
          )}
          {entity.type === MARKETING_SETTING_TYPE_FILE && (
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
          )}
          {entity.type === MARKETING_SETTING_TYPE_HEX_COLOR && (
            <div className="col-md-4">
              <label> {T.translate("marketing.hex_color")} *</label>
              <HexColorInput
                onChange={this.handleChange}
                id="value"
                value={entity.value}
                className="form-control"
                error={this.hasErrors("value")}
              />
            </div>
          )}
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

export default MarketingSettingForm;
