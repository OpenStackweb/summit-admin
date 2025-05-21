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
import moment from "moment-timezone";
import "awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css";
import { epochToMomentTimeZone } from "openstack-uicore-foundation/lib/utils/methods";
import {
  DateTimePicker,
  Input,
  Panel,
  Dropdown,
  Table,
  UploadInput,
  MemberInput,
  Exclusive,
  FreeMultiTextInput
} from "openstack-uicore-foundation/lib/components";
import { TextEditorV3 } from "openstack-uicore-foundation/lib/components/inputs/editor-input-v3";
import { Pagination } from "react-bootstrap";
import Switch from "react-switch";
import history from "../../history";

import TextAreaInputWithCounter from "../inputs/text-area-input-with-counter";
import TextInputWithCounter from "../inputs/text-input-with-counter";
import { isEmpty, scrollToError, shallowEqual } from "../../utils/methods";
import UrlInput from "../inputs/url-input";

class SummitForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: { ...props.entity },
      regLiteMarketingSettings: { ...props.regLiteMarketingSettings },
      printAppMarketingSettings: { ...props.printAppMarketingSettings },
      regFeedMetadataListSettings: { ...props.regFeedMetadataListSettings },
      showSection: "main",
      errors: props.errors
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSPlanEdit = this.handleSPlanEdit.bind(this);
    this.handleSPlanAdd = this.handleSPlanAdd.bind(this);
    this.handleRegFeedMetadataEdit = this.handleRegFeedMetadataEdit.bind(this);
    this.handleRegFeedMetadataAdd = this.handleRegFeedMetadataAdd.bind(this);
    this.handleAttributeTypeEdit = this.handleAttributeTypeEdit.bind(this);
    this.handleNewAttributeType = this.handleNewAttributeType.bind(this);
    this.getHelpUsersOptionLabel = this.getHelpUsersOptionLabel.bind(this);
    this.handleSampleNumber = this.handleSampleNumber.bind(this);
    this.toggleSection = this.toggleSection.bind(this);
  }

  componentDidUpdate(prevProps) {
    const state = {};
    const {
      errors,
      entity,
      regLiteMarketingSettings,
      printAppMarketingSettings,
      regFeedMetadataListSettings
    } = this.props;
    scrollToError(errors);

    if (!shallowEqual(prevProps.entity, entity)) {
      state.entity = { ...entity };
      state.errors = {};
    }
    if (
      !shallowEqual(
        prevProps.regLiteMarketingSettings,
        regLiteMarketingSettings
      )
    ) {
      state.regLiteMarketingSettings = {
        ...regLiteMarketingSettings
      };
    }

    if (
      !shallowEqual(
        prevProps.printAppMarketingSettings,
        printAppMarketingSettings
      )
    ) {
      state.printAppMarketingSettings = {
        ...printAppMarketingSettings
      };
    }

    if (
      !shallowEqual(
        prevProps.regFeedMetadataListSettings,
        regFeedMetadataListSettings
      )
    ) {
      state.regFeedMetadataListSettings = {
        ...regFeedMetadataListSettings
      };
    }

    if (!shallowEqual(prevProps.errors, errors)) {
      state.errors = { ...errors };
    }

    if (!isEmpty(state)) {
      this.setState((prevState) => ({ ...prevState, ...state }));
    }
  }

  handleChange(ev) {
    const {
      entity,
      errors,
      regLiteMarketingSettings,
      printAppMarketingSettings
    } = this.state;
    const newEntity = { ...entity };
    const newErrors = { ...errors };
    const newRegLiteMarketingSettings = { ...regLiteMarketingSettings };
    const newPrintAppMarketingSettings = { ...printAppMarketingSettings };

    const { onAddHelpMember, onDeleteHelpMember } = this.props;
    let { value, id } = ev.target;
    let currentError = "";

    if (newErrors.hasOwnProperty(id)) delete newErrors[id];

    // logic for summit help users ( chat roles )
    if (ev.target.type === "memberinput") {
      const oldHelpUsers = entity[id];
      const currentOldOnes = [];
      try {
        // remap to chat api payload format
        const newHelpUsers = value.map((member) => {
          if (member.hasOwnProperty("email")) {
            // if has email property then its cames from main api
            // we need to remap but first only users with idp id set
            // are valid
            if (!member.user_external_id) {
              throw new Error("Invalid user");
            }
            const newMember = {
              member_id: member.id,
              idp_user_id: member.user_external_id,
              full_name: `${member.first_name} ${member.last_name}`,
              summit_event_id: 0,
              summit_id: entity.id
            };
            onAddHelpMember(newMember);
            return newMember;
          }
          currentOldOnes.push(member);
          return member;
        });

        // check if we delete something
        if (oldHelpUsers.length !== currentOldOnes.length) {
          // get missing one
          const missingOne = oldHelpUsers.filter((oldOne) => {
            const matches = currentOldOnes.filter(
              (newOne) => newOne.member_id === oldOne.member_id
            );
            return matches.length === 0;
          });
          if (missingOne.length > 0) {
            // remove it
            onDeleteHelpMember(missingOne[0]);
          }
        }

        value = newHelpUsers;
      } catch (e) {
        console.log(e);
        value = oldHelpUsers;
        currentError = e;
      }
    }

    if (ev.target.type === "radio") {
      id = ev.target.name;
      // eslint-disable-next-line no-magic-numbers
      value = ev.target.value === 1;
    }

    if (ev.target.type === "checkbox") {
      value = ev.target.checked;
    }

    if (ev.target.type === "datetime") {
      // eslint-disable-next-line no-magic-numbers
      value = value.valueOf() / 1000;
    }

    if (ev.target.type === "number") {
      value = parseInt(value);
    }

    if (id.startsWith("REG_LITE")) {
      if (!regLiteMarketingSettings.hasOwnProperty(id)) {
        regLiteMarketingSettings[id] = { value: "", id: 0 };
      }
      regLiteMarketingSettings[id].value = value;
    } else {
      if (currentError !== "") {
        newErrors[id] = currentError;
      }
      newEntity[id] = value;
    }

    this.setState({
      entity: newEntity,
      errors: newErrors,
      regLiteMarketingSettings: newRegLiteMarketingSettings,
      printAppMarketingSettings: newPrintAppMarketingSettings
    });
  }

  handleUploadLogo = (file, secondary = false) => {
    const { onLogoAttach } = this.props;
    const { entity } = this.state;
    const formData = new FormData();
    formData.append("file", file);
    onLogoAttach(entity, formData, secondary);
  };

  handleRemoveLogo = (ev, secondary = false) => {
    const { onLogoDelete } = this.props;
    const { entity } = this.state;
    const newEntity = { ...entity };

    if (secondary) {
      newEntity.secondary_logo = "";
    } else {
      newEntity.logo = "";
    }

    this.setState({ entity: newEntity });
    onLogoDelete(secondary);
  };

  handleSubmit(ev) {
    const { entity, regLiteMarketingSettings, printAppMarketingSettings } =
      this.state;

    const {
      onSubmit,
      saveRegistrationLiteMarketingSettings,
      savePrintAppMarketingSettings
    } = this.props;

    ev.preventDefault();

    if (this.validateForm(entity)) {
      onSubmit(entity).then((payload) => {
        saveRegistrationLiteMarketingSettings(regLiteMarketingSettings).then(
          () => {
            savePrintAppMarketingSettings(printAppMarketingSettings).then(
              () => {
                if (payload.response.id) {
                  history.push(`/app/summits/${payload.response.id}`);
                }
              }
            );
          }
        );
      });
    }
  }

  handleSPlanEdit(selectionPlanId) {
    const { entity, history } = this.props;
    history.push(
      `/app/summits/${entity.id}/selection-plans/${selectionPlanId}`
    );
  }

  handleSPlanAdd(ev) {
    const { entity, history } = this.props;
    ev.preventDefault();
    history.push(`/app/summits/${entity.id}/selection-plans/new`);
  }

  handleRegFeedMetadataEdit(regFeedMetadataId) {
    const { entity, history } = this.props;
    history.push(
      `/app/summits/${entity.id}/reg-feed-metadata/${regFeedMetadataId}`
    );
  }

  handleRegFeedMetadataAdd(ev) {
    const { entity, history } = this.props;
    ev.preventDefault();
    history.push(`/app/summits/${entity.id}/reg-feed-metadata/new`);
  }

  handleAttributeTypeEdit(attributeId) {
    const { entity, history } = this.props;
    history.push(
      `/app/summits/${entity.id}/room-booking-attributes/${attributeId}`
    );
  }

  handleNewAttributeType(ev) {
    ev.preventDefault();

    const { entity, history } = this.props;
    history.push(`/app/summits/${entity.id}/room-booking-attributes/new`);
  }

  handleOnSwitchChange(setting, value) {
    const { printAppMarketingSettings, errors } = this.state;
    const newPrintAppMarketingSettings = { ...printAppMarketingSettings };

    if (!newPrintAppMarketingSettings.hasOwnProperty(setting)) {
      newPrintAppMarketingSettings[setting] = { value: "" };
    }

    newPrintAppMarketingSettings[setting].value = value;

    this.setState((prevState) => ({
      ...prevState,
      printAppMarketingSettings: newPrintAppMarketingSettings,
      errors
    }));
  }

  handleGenerateEncryptionKey = (ev) => {
    const { generateEncryptionKey } = this.props;
    ev.preventDefault();
    generateEncryptionKey();
  };

  handleSampleNumber(type) {
    const { entity } = this.state;
    return `${type}_${entity.registration_slug_prefix.trim()}_662A968F26820246192380`
      .toUpperCase()
      .replace(/\s/g, "_");
  }

  getHelpUsersOptionLabel(member) {
    if (member.hasOwnProperty("full_name")) {
      return member.full_name;
    }
    // default
    return `${member.first_name} ${member.last_name} (${member.id})`;
  }

  validateForm = (entity) => {
    if (!entity.time_zone_label) {
      entity.time_zone_label = entity.time_zone_id;
    }
    return true;
  };

  hasErrors(field) {
    const { errors } = this.state;
    if (field in errors) {
      return errors[field];
    }
    return "";
  }

  toggleSection(section, ev) {
    const { showSection } = this.state;
    const newShowSection = showSection === section ? "main" : section;
    ev.preventDefault();

    this.setState({ showSection: newShowSection });
  }

  render() {
    const {
      entity,
      showSection,
      regLiteMarketingSettings,
      printAppMarketingSettings,
      regFeedMetadataListSettings
    } = this.state;
    const {
      timezones,
      onSPlanDelete,
      onAttributeTypeDelete,
      onRegFeedMetadataDelete
    } = this.props;
    const time_zones_ddl = timezones.map((tz) => ({ label: tz, value: tz }));
    const dates_enabled =
      entity.hasOwnProperty("time_zone_id") && entity.time_zone_id !== "";

    const splan_columns = [
      { columnKey: "name", value: T.translate("edit_summit.name") },
      { columnKey: "is_enabled", value: T.translate("edit_summit.enabled") }
    ];

    const splan_table_options = {
      actions: {
        edit: { onClick: this.handleSPlanEdit },
        delete: { onClick: onSPlanDelete }
      }
    };

    const registration_feed_metadata_table_columns = [
      { columnKey: "key", value: T.translate("edit_reg_feed_metadata.key") },
      { columnKey: "value", value: T.translate("edit_reg_feed_metadata.value") }
    ];

    const registration_feed_metadata_table_options = {
      actions: {
        edit: { onClick: this.handleRegFeedMetadataEdit },
        delete: { onClick: onRegFeedMetadataDelete }
      }
    };

    const api_feed_type_ddl = [
      { label: "None", value: "none" },
      { label: "Sched", value: "Sched" },
      { label: "Vanderpoel", value: "Vanderpoel" }
    ];

    const external_registration_feed_type_ddl = [
      { label: "None", value: "none" },
      { label: "Eventbrite", value: "Eventbrite" },
      { label: "Samsung", value: "SAMSUNG" }
    ];

    const attribute_columns = [
      { columnKey: "id", value: T.translate("general.id") },
      { columnKey: "type", value: T.translate("general.type") },
      { columnKey: "values", value: T.translate("general.values") }
    ];

    const attribute_options = {
      actions: {
        edit: { onClick: this.handleAttributeTypeEdit },
        delete: { onClick: onAttributeTypeDelete }
      }
    };

    const attributes = entity.meeting_booking_room_allowed_attributes.map(
      (at) => ({
        id: at.id,
        type: at.type,
        values: at.values.map((v) => v.value).join(", ")
      })
    );

    const room_booking_start = entity.meeting_room_booking_start_time
      ? epochToMomentTimeZone(entity.meeting_room_booking_start_time, "UTC")
      : moment.utc(0);
    const room_booking_end = entity.meeting_room_booking_end_time
      ? epochToMomentTimeZone(entity.meeting_room_booking_end_time, "UTC")
      : moment.utc(0);

    const timezone_error = !dates_enabled
      ? "Please choose a timezone first."
      : "";

    return (
      <form>
        <input type="hidden" id="id" value={entity.id} />
        <div className="row form-group">
          <div className="col-md-4">
            <label htmlFor="name"> {T.translate("edit_summit.name")} *</label>
            <Input
              className="form-control"
              error={this.hasErrors("name")}
              id="name"
              value={entity.name}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="slug"> {T.translate("edit_summit.slug")} *</label>
            <Input
              className="form-control"
              error={this.hasErrors("slug")}
              id="slug"
              value={entity.slug}
              disabled={entity.id}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="registration_slug_prefix">
              {" "}
              {T.translate("edit_summit.registration_slug")} *
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("registration_slug_prefix")}
              id="registration_slug_prefix"
              value={entity.registration_slug_prefix}
              disabled={entity.paid_tickets_count > 0}
              onChange={this.handleChange}
            />
          </div>
        </div>
        {entity.registration_slug_prefix && (
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="sample_order_qr_prefix">
                {" "}
                {T.translate("edit_summit.sample_order_qr_prefix")}
              </label>
              <br />
              <span id="sample_order_qr_prefix">
                {" "}
                {this.handleSampleNumber("order")}
              </span>
            </div>
            <div className="col-md-6">
              <label htmlFor="sample_ticket_qr_prefix">
                {" "}
                {T.translate("edit_summit.sample_ticket_qr_prefix")}
              </label>
              <br />
              <span id="sample_ticket_qr_prefix">
                {" "}
                {this.handleSampleNumber("ticket")}
              </span>
            </div>
          </div>
        )}
        <div className="row form-group">
          <div className="col-md-4">
            <label htmlFor="link"> {T.translate("edit_summit.link")}</label>
            <Input
              className="form-control"
              error={this.hasErrors("link")}
              id="link"
              value={entity.link}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="dates_label">
              {" "}
              {T.translate("edit_summit.dates_label")}
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("dates_label")}
              id="dates_label"
              value={entity.dates_label}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-4">
            <label htmlFor="registration_link">
              {" "}
              {T.translate("edit_summit.registration_link")}
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("registration_link")}
              id="registration_link"
              value={entity.registration_link}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="secondary_registration_link">
              {" "}
              {T.translate("edit_summit.secondary_registration_link")}
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("secondary_registration_link")}
              id="secondary_registration_link"
              value={entity.secondary_registration_link}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="secondary_registration_label">
              {" "}
              {T.translate("edit_summit.secondary_registration_label")}
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("secondary_registration_label")}
              id="secondary_registration_label"
              value={entity.secondary_registration_label}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-4 checkboxes-div">
            <div className="form-check abc-checkbox">
              <input
                type="checkbox"
                id="registration_disclaimer_mandatory"
                checked={entity.registration_disclaimer_mandatory}
                onChange={this.handleChange}
                className="form-check-input"
              />
              <label
                className="form-check-label"
                htmlFor="registration_disclaimer_mandatory"
              >
                {T.translate("edit_summit.registration_disclaimer_mandatory")}
              </label>
            </div>
          </div>
          <div className="col-md-4 checkboxes-div">
            <div className="form-check abc-checkbox">
              <input
                type="checkbox"
                id="active"
                checked={entity.active}
                onChange={this.handleChange}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="active">
                {T.translate("edit_summit.active")}
              </label>
            </div>
          </div>
          <div className="col-md-4 checkboxes-div">
            <div className="form-check abc-checkbox">
              <input
                type="checkbox"
                id="available_on_api"
                checked={entity.available_on_api}
                onChange={this.handleChange}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="available_on_api">
                {T.translate("edit_summit.available_on_api")}
              </label>
            </div>
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-6">
            <label htmlFor="support_email">
              {" "}
              {T.translate("edit_summit.support_email")}
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("support_email")}
              id="support_email"
              value={entity.support_email}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="speakers_support_email">
              {" "}
              {T.translate("edit_summit.speakers_support_email")}
            </label>
            <Input
              className="form-control"
              error={this.hasErrors("speakers_support_email")}
              id="speakers_support_email"
              value={entity.speakers_support_email}
              onChange={this.handleChange}
            />
          </div>
        </div>
        {entity.id > 0 && (
          <div className="row form-group">
            <div className="col-md-12">
              <label htmlFor="help_users">
                {" "}
                {T.translate("edit_summit.help_users")}{" "}
                <i
                  title={T.translate("edit_summit.help_users_info")}
                  className="fa fa-info-circle"
                />
              </label>
              <MemberInput
                id="help_users"
                value={entity.help_users}
                onChange={this.handleChange}
                error={this.hasErrors("help_users")}
                getOptionLabel={this.getHelpUsersOptionLabel}
                isMulti
              />
            </div>
          </div>
        )}
        <div className="row form-group">
          <div className="col-md-12">
            <label htmlFor="registration_disclaimer_content">
              {" "}
              {T.translate("edit_summit.registration_disclaimer_content")}{" "}
            </label>
            {/* <textarea
                  id="registration_disclaimer_content"
                  value={entity.registration_disclaimer_content}
                  onChange={this.handleChange}
                  className="form-control"
            /> */}
            <TextEditorV3
              id="registration_disclaimer_content"
              className="registration_disclaimer_input"
              value={entity.registration_disclaimer_content}
              onChange={this.handleChange}
              license={process.env.JODIT_LICENSE_KEY}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-6">
            <label htmlFor="logo_upload"> {T.translate("general.logo")} </label>
            <UploadInput
              id="logo_upload"
              value={entity.logo}
              handleUpload={(file) => this.handleUploadLogo(file)}
              handleRemove={(ev) => this.handleRemoveLogo(ev)}
              className="dropzone col-md-6"
              multiple={false}
              accept="image/*"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="secondary_logo_upload">
              {" "}
              {T.translate("general.secondary_logo")}{" "}
            </label>
            <UploadInput
              id="secondary_logo_upload"
              value={entity.secondary_logo}
              handleUpload={(file) => this.handleUploadLogo(file, true)}
              handleRemove={(ev) => this.handleRemoveLogo(ev, true)}
              className="dropzone col-md-6"
              multiple={false}
              accept="image/*"
            />
          </div>
        </div>

        <Panel
          show={showSection === "dates"}
          title={T.translate("edit_summit.dates")}
          handleClick={(ev) => this.toggleSection("dates", ev)}
        >
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="time_zone_id">
                {" "}
                {T.translate("edit_summit.time_zone")} *
              </label>
              <Dropdown
                id="time_zone_id"
                value={entity.time_zone_id}
                onChange={this.handleChange}
                options={time_zones_ddl}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="time_zone_label">
                {" "}
                {T.translate("edit_summit.time_zone_label")} *
              </label>
              <Input
                className="form-control"
                id="time_zone_label"
                value={entity.time_zone_label}
                onChange={this.handleChange}
                error={this.hasErrors("time_zone_label")}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="start_date">
                {" "}
                {T.translate("edit_summit.start_date")}{" "}
              </label>
              <DateTimePicker
                id="start_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.start_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("start_date")}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="end_date">
                {" "}
                {T.translate("edit_summit.end_date")}{" "}
              </label>
              <DateTimePicker
                id="end_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.end_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("end_date")}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="registration_begin_date">
                {" "}
                {T.translate("edit_summit.registration_begin_date")}{" "}
              </label>
              <DateTimePicker
                id="registration_begin_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.registration_begin_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("registration_begin_date")}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="registration_end_date">
                {" "}
                {T.translate("edit_summit.registration_end_date")}{" "}
              </label>
              <DateTimePicker
                id="registration_end_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.registration_end_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("registration_end_date")}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="schedule_start_date">
                {" "}
                {T.translate("edit_summit.schedule_start_date")}{" "}
              </label>
              <DateTimePicker
                id="schedule_start_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.schedule_start_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("schedule_start_date")}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="start_showing_venues_date">
                {" "}
                {T.translate("edit_summit.start_showing_venues_date")}{" "}
              </label>
              <DateTimePicker
                id="start_showing_venues_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.start_showing_venues_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("start_showing_venues_date")}
              />
            </div>
          </div>

          {entity.id !== 0 && (
            <div>
              <input
                type="button"
                onClick={this.handleSPlanAdd}
                className="btn btn-primary pull-right"
                value={T.translate("edit_summit.add_splan")}
              />
              <Table
                options={splan_table_options}
                data={entity.selection_plans.map((sl) => ({
                  id: sl.id,
                  name: sl.name,
                  is_enabled: sl.is_enabled ? "True" : "False"
                }))}
                columns={splan_columns}
              />
            </div>
          )}
        </Panel>

        <Panel
          show={showSection === "reg-email-settings"}
          title={T.translate("edit_summit.reg_email_settings")}
          handleClick={(ev) => this.toggleSection("reg-email-settings", ev)}
        >
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="reassign_ticket_till_date">
                {" "}
                {T.translate("edit_summit.reassign_ticket_till_date")}{" "}
              </label>
              <DateTimePicker
                id="reassign_ticket_till_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.reassign_ticket_till_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors("reassign_ticket_till_date")}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="registration_allowed_refund_request_till_date">
                {" "}
                {T.translate(
                  "edit_summit.registration_allowed_refund_request_till_date"
                )}{" "}
              </label>
              <DateTimePicker
                id="registration_allowed_refund_request_till_date"
                disabled={!dates_enabled}
                onChange={this.handleChange}
                format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                timezone={entity.time_zone_id}
                value={epochToMomentTimeZone(
                  entity.registration_allowed_refund_request_till_date,
                  entity.time_zone_id
                )}
                error={this.hasErrors(
                  "registration_allowed_refund_request_till_date"
                )}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="registration_send_qr_as_image_attachment_on_ticket_email"
                  checked={
                    entity.registration_send_qr_as_image_attachment_on_ticket_email
                  }
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="registration_send_qr_as_image_attachment_on_ticket_email"
                >
                  {T.translate(
                    "edit_summit.registration_send_qr_as_image_attachment_on_ticket_email"
                  )}
                </label>
              </div>
            </div>
            <div className="col-md-6 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="registration_send_ticket_as_pdf_attachment_on_ticket_email"
                  checked={
                    entity.registration_send_ticket_as_pdf_attachment_on_ticket_email
                  }
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="registration_send_ticket_as_pdf_attachment_on_ticket_email"
                >
                  {T.translate(
                    "edit_summit.registration_send_ticket_as_pdf_attachment_on_ticket_email"
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="registration_send_ticket_email_automatically"
                  checked={entity.registration_send_ticket_email_automatically}
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="registration_send_ticket_email_automatically"
                >
                  {T.translate(
                    "edit_summit.registration_send_ticket_email_automatically"
                  )}
                </label>
              </div>
            </div>
            <div className="col-md-6 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="allow_update_attendee_extra_questions"
                  checked={entity.allow_update_attendee_extra_questions}
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="allow_update_attendee_extra_questions"
                >
                  {T.translate(
                    "edit_summit.allow_update_attendee_extra_questions"
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="registration_allow_automatic_reminder_emails"
                  checked={entity.registration_allow_automatic_reminder_emails}
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="registration_allow_automatic_reminder_emails"
                >
                  {T.translate(
                    "edit_summit.registration_allow_automatic_reminder_emails"
                  )}
                </label>
              </div>
            </div>
            <div className="col-md-6 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="registration_send_order_email_automatically"
                  checked={entity.registration_send_order_email_automatically}
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="registration_send_order_email_automatically"
                >
                  {T.translate(
                    "edit_summit.registration_send_order_email_automatically"
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="registration_reminder_email_days_interval">
                {" "}
                {T.translate(
                  "edit_summit.registration_reminder_email_days_interval"
                )}
              </label>
              <Input
                type="number"
                min="0"
                className="form-control"
                error={this.hasErrors(
                  "registration_reminder_email_days_interval"
                )}
                id="registration_reminder_email_days_interval"
                value={entity.registration_reminder_email_days_interval}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="speaker_confirmation_default_page_url">
                {T.translate(
                  "edit_summit.speaker_confirmation_default_page_url"
                )}{" "}
                &nbsp;
                <i
                  className="fa fa-info-circle"
                  aria-hidden="true"
                  title={T.translate(
                    "edit_summit.speaker_confirmation_default_page_url_info"
                  )}
                />
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("speaker_confirmation_default_page_url")}
                id="speaker_confirmation_default_page_url"
                value={entity.speaker_confirmation_default_page_url}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="registration_encryption_key_btn">
                {" "}
                {T.translate("edit_summit.registration_encryption_key")}
              </label>
              <br />
              <div className="pull-left">{entity.qr_codes_enc_key}</div>
              <button
                id="registration_encryption_key_btn"
                className="btn btn-primary btn-xs pull-left left-space"
                onClick={this.handleGenerateEncryptionKey}
                type="button"
              >
                {T.translate("edit_summit.generate_encryption_key")}
              </button>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-12">
              <label htmlFor="reg_lite_settings">
                {T.translate("edit_summit.reg_lite_settings")}
              </label>
              <hr />
            </div>
          </div>
          <div className="row form-group" id="reg_lite_settings">
            <div className="col-md-4 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="REG_LITE_SHOW_COMPANY_INPUT"
                  checked={
                    regLiteMarketingSettings?.REG_LITE_SHOW_COMPANY_INPUT?.value
                  }
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="REG_LITE_SHOW_COMPANY_INPUT"
                >
                  {T.translate("edit_summit.reg_lite_show_company_input")}
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <label htmlFor="REG_LITE_COMPANY_DDL_PLACEHOLDER">
                {T.translate("edit_summit.reg_lite_company_ddl_placeholder")}{" "}
                &nbsp;
                <i
                  className="fa fa-info-circle"
                  aria-hidden="true"
                  title={T.translate(
                    "edit_summit.reg_lite_company_ddl_placeholder_info"
                  )}
                />
              </label>
              <Input
                className="form-control"
                id="REG_LITE_COMPANY_DDL_PLACEHOLDER"
                value={
                  regLiteMarketingSettings?.REG_LITE_COMPANY_DDL_PLACEHOLDER
                    ?.value
                }
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="REG_LITE_SHOW_COMPANY_INPUT_DEFAULT_OPTIONS"
                  checked={
                    regLiteMarketingSettings
                      ?.REG_LITE_SHOW_COMPANY_INPUT_DEFAULT_OPTIONS?.value
                  }
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="REG_LITE_SHOW_COMPANY_INPUT_DEFAULT_OPTIONS"
                >
                  {T.translate(
                    "edit_summit.reg_lite_show_company_input_default_options"
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-12 checkboxes-div">
              <div className="form-check abc-checkbox">
                <input
                  type="checkbox"
                  id="REG_LITE_ALLOW_PROMO_CODES"
                  checked={
                    regLiteMarketingSettings?.REG_LITE_ALLOW_PROMO_CODES?.value
                  }
                  onChange={this.handleChange}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  htmlFor="REG_LITE_ALLOW_PROMO_CODES"
                >
                  {T.translate("edit_summit.reg_lite_allow_promo_codes")}
                </label>
              </div>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="REG_LITE_ORDER_COMPLETE_TITLE">
                {T.translate("edit_summit.reg_lite_order_complete_title")}
              </label>
              <TextInputWithCounter
                className="form-control"
                maxLength={50}
                id="REG_LITE_ORDER_COMPLETE_TITLE"
                value={
                  regLiteMarketingSettings?.REG_LITE_ORDER_COMPLETE_TITLE?.value
                }
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="REG_LITE_INITIAL_ORDER_COMPLETE_STEP_1ST_PARAGRAPH">
                {T.translate(
                  "edit_summit.reg_lite_initial_order_complete_step_1st_paragraph"
                )}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_initial_order_complete_step_1st_paragraph_info"
                )}
              />
              <TextAreaInputWithCounter
                className="form-control"
                rows={5}
                maxLength={255}
                id="REG_LITE_INITIAL_ORDER_COMPLETE_STEP_1ST_PARAGRAPH"
                value={
                  regLiteMarketingSettings
                    ?.REG_LITE_INITIAL_ORDER_COMPLETE_STEP_1ST_PARAGRAPH?.value
                }
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="REG_LITE_INITIAL_ORDER_COMPLETE_STEP_2ND_PARAGRAPH">
                {T.translate(
                  "edit_summit.reg_lite_initial_order_complete_step_2nd_paragraph"
                )}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_initial_order_complete_step_2nd_paragraph_info"
                )}
              />
              <TextAreaInputWithCounter
                className="form-control"
                rows={5}
                maxLength={255}
                id="REG_LITE_INITIAL_ORDER_COMPLETE_STEP_2ND_PARAGRAPH"
                value={
                  regLiteMarketingSettings
                    ?.REG_LITE_INITIAL_ORDER_COMPLETE_STEP_2ND_PARAGRAPH?.value
                }
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="REG_LITE_INITIAL_ORDER_COMPLETE_BTN_LABEL">
                {T.translate(
                  "edit_summit.reg_lite_initial_order_complete_btn_label"
                )}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_initial_order_complete_btn_label_info"
                )}
              />
              <TextInputWithCounter
                className="form-control"
                maxLength={50}
                id="REG_LITE_INITIAL_ORDER_COMPLETE_BTN_LABEL"
                value={
                  regLiteMarketingSettings
                    ?.REG_LITE_INITIAL_ORDER_COMPLETE_BTN_LABEL?.value
                }
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="REG_LITE_ORDER_COMPLETE_STEP_1ST_PARAGRAPH">
                {T.translate(
                  "edit_summit.reg_lite_order_complete_step_1st_paragraph"
                )}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_order_complete_step_1st_paragraph_info"
                )}
              />
              <TextAreaInputWithCounter
                className="form-control"
                rows={5}
                maxLength={255}
                id="REG_LITE_ORDER_COMPLETE_STEP_1ST_PARAGRAPH"
                value={
                  regLiteMarketingSettings
                    ?.REG_LITE_ORDER_COMPLETE_STEP_1ST_PARAGRAPH?.value
                }
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="REG_LITE_ORDER_COMPLETE_STEP_2ND_PARAGRAPH">
                {T.translate(
                  "edit_summit.reg_lite_order_complete_step_2nd_paragraph"
                )}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_order_complete_step_2nd_paragraph_info"
                )}
              />
              <TextAreaInputWithCounter
                className="form-control"
                rows={5}
                maxLength={255}
                id="REG_LITE_ORDER_COMPLETE_STEP_2ND_PARAGRAPH"
                value={
                  regLiteMarketingSettings
                    ?.REG_LITE_ORDER_COMPLETE_STEP_2ND_PARAGRAPH?.value
                }
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="REG_LITE_ORDER_COMPLETE_BTN_LABEL">
                {T.translate("edit_summit.reg_lite_order_complete_btn_label")}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_order_complete_btn_label_info"
                )}
              />
              <TextInputWithCounter
                className="form-control"
                maxLength={50}
                id="REG_LITE_ORDER_COMPLETE_BTN_LABEL"
                value={
                  regLiteMarketingSettings?.REG_LITE_ORDER_COMPLETE_BTN_LABEL
                    ?.value
                }
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-12">
              <label htmlFor="REG_LITE_NO_ALLOWED_TICKETS_MESSAGE">
                {T.translate("edit_summit.reg_lite_no_allowed_tickets_message")}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate(
                  "edit_summit.reg_lite_no_allowed_tickets_message_info"
                )}
              />
              <TextEditorV3
                id="REG_LITE_NO_ALLOWED_TICKETS_MESSAGE"
                value={
                  regLiteMarketingSettings?.REG_LITE_NO_ALLOWED_TICKETS_MESSAGE
                    ?.value
                }
                onChange={this.handleChange}
                license={process.env.JODIT_LICENSE_KEY}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-12">
              <label htmlFor="check_in_settings">
                {T.translate("edit_summit.check_in_settings")}
              </label>
              <hr />
            </div>
          </div>
          <div className="row form-group" id="check_in_settings">
            <div className="col-md-6">
              <label htmlFor="PRINT_APP_HIDE_FIND_TICKET_BY_FULLNAME">
                {" "}
                {T.translate(
                  "edit_summit.print_app_hide_find_ticket_by_fullname"
                )}
                &nbsp;
              </label>{" "}
              <br />
              <Switch
                id="PRINT_APP_HIDE_FIND_TICKET_BY_FULLNAME"
                checked={
                  printAppMarketingSettings
                    ?.PRINT_APP_HIDE_FIND_TICKET_BY_FULLNAME?.value || false
                }
                onChange={(val) => {
                  this.handleOnSwitchChange(
                    "PRINT_APP_HIDE_FIND_TICKET_BY_FULLNAME",
                    val
                  );
                }}
                uncheckedIcon={false}
                checkedIcon={false}
                className="react-switch"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="PRINT_APP_HIDE_FIND_TICKET_BY_EMAIL">
                {" "}
                {T.translate("edit_summit.print_app_hide_find_ticket_by_email")}
                &nbsp;
              </label>{" "}
              <br />
              <Switch
                id="PRINT_APP_HIDE_FIND_TICKET_BY_EMAIL"
                checked={
                  printAppMarketingSettings?.PRINT_APP_HIDE_FIND_TICKET_BY_EMAIL
                    ?.value || false
                }
                onChange={(val) => {
                  this.handleOnSwitchChange(
                    "PRINT_APP_HIDE_FIND_TICKET_BY_EMAIL",
                    val
                  );
                }}
                uncheckedIcon={false}
                checkedIcon={false}
                className="react-switch"
              />
            </div>
          </div>
        </Panel>

        <Panel
          show={showSection === "calendar"}
          title={T.translate("edit_summit.calendar_sync")}
          handleClick={(ev) => this.toggleSection("calendar", ev)}
        >
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="calendar_sync_name">
                {" "}
                {T.translate("edit_summit.calendar_sync_name")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("calendar_sync_name")}
                id="calendar_sync_name"
                value={entity.calendar_sync_name}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="calendar_sync_desc">
                {" "}
                {T.translate("edit_summit.calendar_sync_desc")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("calendar_sync_desc")}
                id="calendar_sync_desc"
                value={entity.calendar_sync_desc}
                onChange={this.handleChange}
              />
            </div>
          </div>
        </Panel>

        <Panel
          show={showSection === "virtual_event"}
          title={T.translate("edit_summit.virtual_event")}
          handleClick={(ev) => this.toggleSection("virtual_event", ev)}
        >
          <div className="row form-group">
            <div className="col-md-12">
              <span className="note">
                {T.translate("edit_summit.virtual_event_note")}
              </span>
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-4">
              <label htmlFor="marketing_site_url">
                {" "}
                {T.translate("edit_summit.marketing_site_url")}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate("edit_summit.url_registered_idp")}
              />
              <UrlInput
                className="form-control"
                error={this.hasErrors("marketing_site_url")}
                id="marketing_site_url"
                value={entity.marketing_site_url}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="marketing_site_oauth2_client_idz">
                {" "}
                {T.translate("edit_summit.marketing_site_oauth2_client_id")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("marketing_site_oauth2_client_id")}
                id="marketing_site_oauth2_client_id"
                value={entity.marketing_site_oauth2_client_id}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="marketing_site_oauth2_client_scopes">
                {" "}
                {T.translate("edit_summit.marketing_site_oauth2_client_scopes")}
              </label>
              <textarea
                className="form-control"
                id="marketing_site_oauth2_client_scopes"
                value={entity.marketing_site_oauth2_client_scopes}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-6">
              <label htmlFor="virtual_site_url">
                {" "}
                {T.translate("edit_summit.virtual_site_url")}
              </label>
              &nbsp;
              <i
                className="fa fa-info-circle"
                aria-hidden="true"
                title={T.translate("edit_summit.url_registered_idp")}
              />
              <UrlInput
                className="form-control"
                error={this.hasErrors("virtual_site_url")}
                id="virtual_site_url"
                value={entity.virtual_site_url}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="virtual_site_oauth2_client_id">
                {" "}
                {T.translate("edit_summit.virtual_site_oauth2_client_id")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("virtual_site_oauth2_client_id")}
                id="virtual_site_oauth2_client_id"
                value={entity.virtual_site_oauth2_client_id}
                onChange={this.handleChange}
              />
            </div>
          </div>
        </Panel>

        <Exclusive name="room-booking">
          <Panel
            show={showSection === "room-booking"}
            title={T.translate("edit_summit.room-booking")}
            handleClick={(ev) => this.toggleSection("room-booking", ev)}
          >
            <div className="row form-group">
              <div className="col-md-4">
                <label htmlFor="begin_allow_booking_date">
                  {" "}
                  {T.translate("edit_summit.booking_begin_date")}{" "}
                </label>
                <DateTimePicker
                  id="begin_allow_booking_date"
                  onChange={this.handleChange}
                  format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                  timezone={entity.time_zone_id}
                  disabled={!dates_enabled}
                  value={epochToMomentTimeZone(
                    entity.begin_allow_booking_date,
                    entity.time_zone_id
                  )}
                  error={
                    this.hasErrors("begin_allow_booking_date") || timezone_error
                  }
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="end_allow_booking_date">
                  {" "}
                  {T.translate("edit_summit.booking_end_date")}{" "}
                </label>
                <DateTimePicker
                  id="end_allow_booking_date"
                  onChange={this.handleChange}
                  format={{ date: "YYYY-MM-DD", time: "HH:mm" }}
                  timezone={entity.time_zone_id}
                  disabled={!dates_enabled}
                  value={epochToMomentTimeZone(
                    entity.end_allow_booking_date,
                    entity.time_zone_id
                  )}
                  error={
                    this.hasErrors("end_allow_booking_date") || timezone_error
                  }
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-4">
                <label htmlFor="meeting_room_booking_start_time">
                  {" "}
                  {T.translate(
                    "room_bookings.meeting_room_booking_start_time"
                  )}{" "}
                  *
                </label>
                <DateTimePicker
                  id="meeting_room_booking_start_time"
                  onChange={this.handleChange}
                  format={{ date: false, time: "HH:mm" }}
                  defaultValue={0}
                  utc
                  value={room_booking_start}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="meeting_room_booking_end_time">
                  {" "}
                  {T.translate("room_bookings.meeting_room_booking_end_time")} *
                </label>
                <DateTimePicker
                  id="meeting_room_booking_end_time"
                  onChange={this.handleChange}
                  format={{ date: false, time: "HH:mm" }}
                  defaultValue={0}
                  utc
                  value={room_booking_end}
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-4">
                <label htmlFor="meeting_room_booking_slot_length">
                  {" "}
                  {T.translate(
                    "room_bookings.meeting_room_booking_slot_length"
                  )}{" "}
                  *
                </label>
                <Input
                  id="meeting_room_booking_slot_length"
                  type="number"
                  value={entity.meeting_room_booking_slot_length}
                  onChange={this.handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="meeting_room_booking_max_allowed">
                  {" "}
                  {T.translate(
                    "room_bookings.meeting_room_booking_max_allowed"
                  )}{" "}
                  *
                </label>
                <Input
                  id="meeting_room_booking_max_allowed"
                  type="number"
                  value={entity.meeting_room_booking_max_allowed}
                  onChange={this.handleChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="row form-group">
              <div className="col-md-12">
                <button
                  className="btn btn-primary pull-right left-space"
                  onClick={this.handleNewAttributeType}
                  type="button"
                >
                  {T.translate("room_bookings.add_attribute")}
                </button>
                <Table
                  options={attribute_options}
                  data={attributes}
                  columns={attribute_columns}
                />
              </div>
            </div>
          </Panel>
        </Exclusive>

        <Panel
          show={showSection === "third_party"}
          title={T.translate("edit_summit.third_party")}
          handleClick={(ev) => this.toggleSection("third_party", ev)}
        >
          <div className="row form-group">
            <div className="col-md-4">
              <label htmlFor="api_feed_type">
                {" "}
                {T.translate("edit_summit.api_feed_type")}
              </label>
              <Dropdown
                id="api_feed_type"
                value={entity.api_feed_type}
                placeholder={T.translate(
                  "edit_summit.placeholders.api_feed_type"
                )}
                options={api_feed_type_ddl}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="api_feed_key">
                {" "}
                {T.translate("edit_summit.api_feed_key")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("api_feed_key")}
                id="api_feed_key"
                value={entity.api_feed_key}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="api_feed_url">
                {" "}
                {T.translate("edit_summit.api_feed_url")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("api_feed_url")}
                id="api_feed_url"
                value={entity.api_feed_url}
                onChange={this.handleChange}
              />
            </div>
          </div>
          <div className="row form-group">
            <div className="col-md-4">
              <label htmlFor="external_registration_feed_type">
                {" "}
                {T.translate("edit_summit.external_registration_feed_type")}
              </label>
              <Dropdown
                id="external_registration_feed_type"
                value={entity.external_registration_feed_type}
                placeholder={T.translate(
                  "edit_summit.placeholders.external_registration_feed_type"
                )}
                options={external_registration_feed_type_ddl}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="external_registration_feed_api_key">
                {" "}
                {T.translate("edit_summit.external_registration_feed_api_key")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("external_registration_feed_api_key")}
                id="external_registration_feed_api_key"
                value={entity.external_registration_feed_api_key}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="external_summit_id">
                {" "}
                {T.translate("edit_summit.external_registration_id")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("external_summit_id")}
                id="external_summit_id"
                value={entity.external_summit_id}
                onChange={this.handleChange}
              />
            </div>
          </div>
          {entity.id !== 0 && (
            <div className="form-group">
              <label htmlFor="add_registration_feed_metadata">
                {" "}
                {T.translate("edit_summit.registration_feed_metadata")}
              </label>
              <input
                type="button"
                id="add_registration_feed_metadata"
                onClick={this.handleRegFeedMetadataAdd}
                className="btn btn-primary pull-right"
                value={T.translate(
                  "edit_summit.add_registration_feed_metadata"
                )}
              />

              {regFeedMetadataListSettings?.regFeedMetadata?.length > 0 ? (
                <>
                  <Table
                    options={registration_feed_metadata_table_options}
                    data={regFeedMetadataListSettings.regFeedMetadata}
                    columns={registration_feed_metadata_table_columns}
                  />
                  <Pagination
                    bsSize="medium"
                    prev
                    next
                    first
                    last
                    ellipsis
                    boundaryLinks
                    maxButtons={10}
                    items={regFeedMetadataListSettings.lastPage}
                    activePage={regFeedMetadataListSettings.currentPage}
                    onSelect={this.handleFeedbackPageChange}
                  />
                </>
              ) : (
                <div className="no-items">
                  {T.translate("edit_summit.no_reg_feed_metadata")}
                </div>
              )}
            </div>
          )}
          <div className="row form-group">
            <div className="col-md-4">
              <label htmlFor="mux_token_id">
                {" "}
                {T.translate("edit_summit.mux_token_id")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("mux_token_id")}
                id="mux_token_id"
                value={entity.mux_token_id}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="mux_token_secret">
                {" "}
                {T.translate("edit_summit.mux_token_secret")}
              </label>
              <Input
                className="form-control"
                error={this.hasErrors("mux_token_secret")}
                id="mux_token_secret"
                value={entity.mux_token_secret}
                onChange={this.handleChange}
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="mux_allowed_domains">
                {" "}
                {T.translate("edit_summit.mux_allowed_domains")}
              </label>
              <FreeMultiTextInput
                isClearable
                isMulti
                id="mux_allowed_domains"
                value={entity.mux_allowed_domains}
                placeholder={T.translate(
                  "edit_summit.placeholders.mux_allowed_domains"
                )}
                onChange={this.handleChange}
              />
            </div>
          </div>
        </Panel>

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

export default SummitForm;
