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
  MemberInput,
  UploadInput,
  Input,
  Panel
} from "openstack-uicore-foundation/lib/components";
import { TextEditorV3 } from "openstack-uicore-foundation/lib/components/inputs/editor-input-v3";
import { AffiliationsTable } from "../tables/affiliationstable";
import {
  isEmpty,
  isEmptyString,
  scrollToError,
  shallowEqual,
  stripTags
} from "../../utils/methods";
import { mustReplaceSpeakerFieldsWithMemberInfo } from "../../models/app-config";
import CopyClipboard from "../buttons/copy-clipboard";

class SpeakerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: { ...props.entity },
      errors: props.errors,
      showSummit: null
    };

    this.getPresentations = this.getPresentations.bind(this);
    this.getAttendance = this.getAttendance.bind(this);
    this.getPromocodes = this.getPromocodes.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleUploadPic = this.handleUploadPic.bind(this);
    this.handleUploadBigPic = this.handleUploadBigPic.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleSummit = this.toggleSummit.bind(this);
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
    let { value, id } = ev.target;

    if (ev.target.type === "checkbox") {
      value = ev.target.checked;
    }

    if (ev.target.type === "memberinput") {
      entity.email = "";
      if (value && mustReplaceSpeakerFieldsWithMemberInfo()) {
        entity.affiliations = [...value.affiliations];
        entity.first_name = !isEmptyString(value.first_name)
          ? value.first_name
          : entity.first_name;
        entity.last_name = !isEmptyString(value.last_name)
          ? value.last_name
          : entity.last_name;
        entity.bio = !isEmptyString(stripTags(value.bio))
          ? value.bio
          : entity.bio;
        entity.irc = !isEmptyString(value.irc) ? value.irc : entity.irc;
        entity.twitter = !isEmptyString(value.twitter)
          ? value.twitter
          : entity.twitter;
        entity.company = !isEmptyString(value.company)
          ? value.company
          : entity.company;
        entity.company = !isEmptyString(value.phone_number)
          ? value.phone_number
          : entity.company;
      }
    }

    errors[id] = "";
    entity[id] = value;
    this.setState({ entity, errors });
  }

  handleUploadPic(file) {
    const formData = new FormData();
    formData.append("file", file);
    this.props.onAttach(this.state.entity, formData, "profile");
  }

  handleUploadBigPic(file) {
    const formData = new FormData();
    formData.append("file", file);
    this.props.onAttach(this.state.entity, formData, "big");
  }

  handleRemoveFile(picAttr) {
    const entity = { ...this.state.entity };

    entity[picAttr] = "";
    this.setState({ entity });
  }

  handleSubmit(publish, ev) {
    ev.preventDefault();

    this.props.onSubmit(this.state.entity);
  }

  handlePresentationLink(summit, event_id, ev) {
    ev.preventDefault();
    const event_detail_url = summit.schedule_event_detail_url
      .replace(":event_id", event_id)
      .replace(":event_title", "");
    window.open(event_detail_url, "_blank");
  }

  hasErrors(field) {
    const { errors } = this.state;
    if (field in errors) {
      return errors[field];
    }

    return "";
  }

  getPresentations(summitId) {
    const presentations = this.state.entity.all_presentations.filter(
      (p) => p.summit_id === summitId
    );
    const speakerId = this.state.entity.id;
    const { history } = this.props;

    return (
      <div className="summit-data-section">
        Presentations:
        {presentations.map((p) => {
          let participation = "";
          if (p.speakers.includes(speakerId)) {
            participation = "Speaker";
          }

          if (p.moderator_speaker_id === speakerId) {
            participation += participation ? " & Moderator" : "Moderator";
          }

          return (
            <li key={`pres${p.id}`}>
              <a
                href=""
                onClick={() => {
                  history.push(`/app/summits/${summitId}/events/${p.id}`);
                }}
              >
                {p.title}
              </a>
              <i> - {participation}</i>
            </li>
          );
        })}
        <button
          className="btn btn-xs btn-default"
          onClick={() => {
            history.push(`/app/summits/${summitId}/events/new`);
          }}
        >
          Add new presentation
        </button>
      </div>
    );
  }

  getAttendance(summitId) {
    const assistances = this.state.entity.summit_assistances.filter(
      (a) => a.summit_id === summitId
    );
    const { history } = this.props;

    if (assistances.length === 0) return <div />;

    return (
      <div className="summit-data-section">
        Attendance:
        {assistances.map((a) => (
          <li key={`ass${a.id}`}>
            <a
              href=""
              onClick={() => {
                history.push(
                  `/app/summits/${summitId}/speaker-attendances/${a.id}`
                );
              }}
            >
              Ph:{a.on_site_phone ? a.on_site_phone : "-"}
              {a.registered ? <i> - Registered </i> : ""}
              {a.checked_in ? <i> - Checked in </i> : ""}
              {a.is_confirmed ? <i> - Confirmed </i> : ""}
            </a>
          </li>
        ))}
        <button
          className="btn btn-xs btn-default"
          onClick={() => {
            history.push(`/app/summits/${summitId}/speaker-attendances/new`);
          }}
        >
          Add new attendance
        </button>
      </div>
    );
  }

  getPromocodes(summitId) {
    const promocodes = this.state.entity.registration_codes.filter(
      (r) => r.summit_id === summitId
    );
    const { history } = this.props;

    return (
      <div className="summit-data-section">
        Promocodes:
        {promocodes.map((p) => (
          <li key={`prom${p.id}`}>
            <a
              href=""
              onClick={() => {
                history.push(`/app/summits/${summitId}/promocodes/${p.id}`);
              }}
            >
              {p.code}
            </a>
            {p.email_sent ? <i> - Email Sent </i> : ""}
            {p.redeemed ? <i> - Redeemed </i> : ""}
          </li>
        ))}
        <button
          className="btn btn-xs btn-default"
          onClick={() => {
            history.push(`/app/summits/${summitId}/promocodes/new`);
          }}
        >
          Add new promocode
        </button>
      </div>
    );
  }

  toggleSummit(summitId, ev) {
    const { showSummit } = this.state;
    const newShowSummit = showSummit === summitId ? null : summitId;
    ev.preventDefault();

    this.setState({ showSummit: newShowSummit });
  }

  render() {
    const { entity, showSummit } = this.state;
    const { summits } = this.props;
    const allPresentations = entity.all_presentations;
    const lastThree = -3;

    const lastSummits = summits
      .filter(
        (s) => allPresentations.filter((p) => p.summit_id === s.id).length > 0
      )
      .sort((a, b) => a.start_date - b.start_date)
      .slice(lastThree);

    return (
      <form className="summit-speaker-form">
        <input type="hidden" id="id" value={entity.id} />
        <div className="row form-group">
          <div className="col-md-4">
            <label> {T.translate("general.member")} *</label>
            <MemberInput
              id="member"
              value={entity.member}
              getOptionLabel={(member) =>
                `${member.first_name} ${member.last_name} (${member.email})`
              }
              onChange={this.handleChange}
              isClearable
            />
          </div>
          <div className="col-md-4">
            <label>
              {" "}
              {T.translate("general.email")}
              <CopyClipboard
                text={entity.email}
                tooltipText={T.translate("edit_speaker.copy_email")}
              />
            </label>
            <Input
              className="form-control"
              id="email"
              disabled={entity.id !== 0 || entity.member != null}
              value={entity.email}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-4">
            <label> {T.translate("edit_speaker.title")} *</label>
            <Input
              className="form-control"
              id="title"
              value={entity.title}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label> {T.translate("general.first_name")} *</label>
            <Input
              className="form-control"
              id="first_name"
              value={entity.first_name}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label> {T.translate("general.last_name")} *</label>
            <Input
              className="form-control"
              id="last_name"
              value={entity.last_name}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-4">
            <label> {T.translate("edit_speaker.twitter")} </label>
            <Input
              className="form-control"
              id="twitter"
              value={decodeURIComponent(entity.twitter)}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-4">
            <label> {T.translate("edit_speaker.irc")} </label>
            <Input
              className="form-control"
              id="irc"
              value={entity.irc}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-6">
            <label> {T.translate("edit_speaker.company")} </label>
            <Input
              className="form-control"
              id="company"
              value={entity.company}
              onChange={this.handleChange}
            />
          </div>
          <div className="col-md-6">
            <label> {T.translate("edit_speaker.phone_number")} </label>
            <Input
              className="form-control"
              id="phone_number"
              value={entity.phone_number}
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-12">
            <label> {T.translate("edit_speaker.bio")} </label>
            <TextEditorV3
              id="bio"
              value={entity.bio}
              onChange={this.handleChange}
              license={process.env.JODIT_LICENSE_KEY}
            />
          </div>
        </div>
        {entity.id !== 0 &&
          entity.member &&
          this.props.entity.member &&
          entity.member.id === this.props.entity.member.id && (
            <div className="row form-group">
              <div className="col-md-12">
                <label> {T.translate("edit_speaker.affiliations")} </label>
                <AffiliationsTable
                  ownerId={entity.member.id}
                  data={entity.affiliations}
                />
              </div>
            </div>
          )}
        <div className="row form-group">
          <div className="col-md-6">
            <label> {T.translate("edit_speaker.profile_pic")} </label>
            <UploadInput
              value={entity.pic}
              handleUpload={this.handleUploadPic}
              handleRemove={() => this.handleRemoveFile("pic")}
              className="dropzone col-md-6"
              multiple={false}
              accept="image/*"
            />
            <div>
              &nbsp;
              <br />
              <span>{T.translate("edit_speaker.profile_pic_size")}</span>
              <br />
              <span>{T.translate("edit_speaker.profile_pic_format")}</span>
            </div>
          </div>
          <div className="col-md-6">
            <label> {T.translate("edit_speaker.big_pic")} </label>
            <UploadInput
              value={entity.big_pic}
              handleUpload={this.handleUploadBigPic}
              handleRemove={() => this.handleRemoveFile("big_pic")}
              className="dropzone col-md-6"
              multiple={false}
              accept="image/*"
            />
            <div>
              &nbsp;
              <br />
              <span>{T.translate("edit_speaker.big_pic_size")}</span>
              <br />
              <span>{T.translate("edit_speaker.big_pic_format")}</span>
            </div>
          </div>
        </div>
        <br />
        <hr />
        {entity.id !== 0 &&
          lastSummits.map((s) => (
            <Panel
              key={`last-summits-${s.id}`}
              className="summit-data"
              show={showSummit === s.id}
              title={s.name}
              handleClick={this.toggleSummit.bind(this, s.id)}
            >
              {this.getPresentations(s.id)}
              {this.getAttendance(s.id)}
              {this.getPromocodes(s.id)}
            </Panel>
          ))}

        <div className="row">
          <div className="col-md-12 submit-buttons">
            <input
              type="button"
              onClick={this.handleSubmit.bind(this, false)}
              className="btn btn-primary pull-right"
              value={T.translate("general.save")}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default SpeakerForm;
