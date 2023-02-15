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
import {epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/utils/methods'
import {queryTrackGroups, queryEventTypes, queryMembers} from 'openstack-uicore-foundation/lib/utils/query-actions'
import {
  Input,
  DateTimePicker,
  SimpleLinkList,
  SortableTable,
  TextEditor,
  Panel,
  Table,
  Dropdown,
} from 'openstack-uicore-foundation/lib/components';
import {isEmpty, scrollToError, shallowEqual, stripTags} from "../../utils/methods";
import EmailTemplateInput from "../inputs/email-template-input";
import ImportModal from "../inputs/import-modal/index.jsx";
import {PresentationTypeClassName} from '../../utils/constants';
import Many2ManyDropDown from "../inputs/many-2-many-dropdown";
import {querySelectionPlanExtraQuestions} from '../../actions/selection-plan-actions';
import {querySummitProgressFlags} from '../../actions/track-chair-actions';
import {Pagination} from "react-bootstrap";
import {DEFAULT_ALLOWED_QUESTIONS} from "../../reducers/summits/selection-plan-reducer";

class SelectionPlanForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: {...props.entity},
      errors: props.errors,
      showSection: 'main',
      newMemberEmail: '',
      showImportModal: false,
      importFile: null,
    };

    this.handleTrackGroupLink = this.handleTrackGroupLink.bind(this);
    this.handleTrackGroupUnLink = this.handleTrackGroupUnLink.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEditExtraQuestion = this.handleEditExtraQuestion.bind(this);
    this.handleDeleteExtraQuestion = this.handleDeleteExtraQuestion.bind(this);
    this.handleNewExtraQuestion = this.handleNewExtraQuestion.bind(this);
    this.handleDeleteEventType = this.handleDeleteEventType.bind(this);
    this.handleAddEventType = this.handleAddEventType.bind(this);
    this.handleAddRatingType = this.handleAddRatingType.bind(this);
    this.handleDeleteRatingType = this.handleDeleteRatingType.bind(this);
    this.handleEditRatingType = this.handleEditRatingType.bind(this);
    this.handleAddProgressFlag = this.handleAddProgressFlag.bind(this);
    this.handleEditProgressFlag = this.handleEditProgressFlag.bind(this);
    this.handleRemoveProgressFlag = this.handleRemoveProgressFlag.bind(this);
    this.toggleSection = this.toggleSection.bind(this);
    this.handleNotificationEmailTemplateChange = this.handleNotificationEmailTemplateChange.bind(this);
    this.fetchSummitSelectionPlanExtraQuestions = this.fetchSummitSelectionPlanExtraQuestions.bind(this);
    this.fetchMembers = this.fetchMembers.bind(this);
    this.linkSummitSelectionPlanExtraQuestion = this.linkSummitSelectionPlanExtraQuestion.bind(this);
    this.fetchSummitPresentationActionTypes = this.fetchSummitPresentationActionTypes.bind(this);
    this.linkSummitProgressFlag = this.linkSummitProgressFlag.bind(this);
    this.handleAddAllowedMember = this.handleAddAllowedMember.bind(this);
    this.handleImportAllowedMembers = this.handleImportAllowedMembers.bind(this);
    this.handleDeleteAllowedMember = this.handleDeleteAllowedMember.bind(this);
    this.handleAllowedMembersPageChange = this.handleAllowedMembersPageChange.bind(this);
  }

  fetchSummitSelectionPlanExtraQuestions(input, callback) {
    let {currentSummit} = this.props;

    if (!input) {
      return Promise.resolve({options: []});
    }
    querySelectionPlanExtraQuestions(currentSummit.id, input, callback);
  }

  fetchMembers(input, callback) {
    if (!input) {
      return Promise.resolve({options: []});
    }
    queryMembers(input, callback);
  }

  linkSummitSelectionPlanExtraQuestion(question) {
    let {currentSummit} = this.props;
    this.props.onAssignExtraQuestion2SelectionPlan(currentSummit.id, this.state.entity.id, question.id);
  }

  handleEditExtraQuestion(questionId) {
    this.props.onEditExtraQuestion(questionId);
  }

  handleDeleteExtraQuestion(questionId) {
    this.props.onDeleteExtraQuestion(questionId);
  }

  handleNewExtraQuestion() {
    this.props.onAddNewExtraQuestion();
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

    if (ev.target.type === 'datetime') {
      value = value.valueOf() / 1000;
    }

    if(id.startsWith('cfp_')) {
      if(!entity['marketing_settings'].hasOwnProperty(id)){
        entity['marketing_settings'][id] = { value: ''};
      }
      entity['marketing_settings'][id].value = value;
    } else {
      errors[id] = '';
      entity[id] = value;
    }
    
    this.setState({entity: entity, errors: errors});
  }

  handleNotificationEmailTemplateChange(ev) {
    let entity = {...this.state.entity};
    let errors = {...this.state.errors};
    let {value, id} = ev.target;

    errors[id] = '';
    entity[id] = value;
    this.setState({...this.state, entity: entity, errors: errors});
  }

  handleSubmit(ev) {
    let entity = {...this.state.entity};
    ev.preventDefault();

    const marketing_settings = []
    
    Object.keys(entity.marketing_settings).map(m => {
      const mkt_setting = { id: entity.marketing_settings[m].id, type: 'TEXT', key: m.toUpperCase(), value: entity.marketing_settings[m].value, selection_plan_id: entity.id }
      marketing_settings.push(this.props.saveMarketingSettings(mkt_setting, null, entity.id))
    })

    this.props.onSubmit(this.state.entity).then(() => Promise.all(marketing_settings));
  }

  hasErrors(field) {
    let {errors} = this.state;
    if (field in errors) {
      return errors[field];
    }

    return '';
  }

  handleTrackGroupLink(value) {
    const {entity} = this.state;
    this.props.onTrackGroupLink(entity.id, value);
  }

  handleTrackGroupUnLink(valueId) {
    const {entity} = this.state;
    this.props.onTrackGroupUnLink(entity.id, valueId);
  }

  handleAddEventType(value) {
    const {entity} = this.state;
    this.props.onAddEventType(entity.id, value)
  }

  handleDeleteEventType(valueId) {
    const {entity} = this.state;
    this.props.onDeleteEventType(entity.id, valueId)
  }

  handleAddRatingType() {
    this.props.onAddRatingType();
  }

  handleEditRatingType(ratingTypeId) {
    this.props.onEditRatingType(ratingTypeId)
  }

  handleDeleteRatingType(ratingTypeId) {
    this.props.onDeleteRatingType(ratingTypeId)
  }

  fetchSummitPresentationActionTypes(input, callback) {
    let {currentSummit} = this.props;

    if (!input) {
      return Promise.resolve({options: []});
    }
    querySummitProgressFlags(currentSummit.id, input, callback);
  }

  linkSummitProgressFlag(progressFlag) {
    let {currentSummit} = this.props;
    this.props.onAssignProgressFlag2SelectionPlan(currentSummit.id, this.state.entity.id, progressFlag.id);
  }

  handleAddProgressFlag() {
    this.props.onAddProgressFlag();
  }

  handleEditProgressFlag(progressFlagId) {
    this.props.onEditProgressFlag(progressFlagId)
  }

  handleRemoveProgressFlag(progressFlagId) {
    this.props.onUnassignProgressFlag(progressFlagId)
  }

  handleImportAllowedMembers(importFile) {
    if (importFile) {
      this.props.onImportAllowedMembers(this.state.entity.id, importFile);
    }
    this.setState({...this.state, showImportModal: false});
  }

  handleAddAllowedMember() {
    const {entity, newMemberEmail} = this.state;
    this.props.onAllowedMemberAdd(entity.id, newMemberEmail);
  }

  handleDeleteAllowedMember(valueId) {
    const {entity} = this.state;
    this.props.onAllowedMemberDelete(entity.id, valueId);
  }

  handleAllowedMembersPageChange(page) {
    const {entity} = this.state;
    this.props.onAllowedMembersPageChange(entity.id, page);
  }

  toggleSection(section) {
    let {showSection} = this.state;
    let newShowSection = (showSection === section) ? 'main' : section;
    this.setState({showSection: newShowSection});
  }

  render() {
    const {entity, showSection, newMemberEmail, showImportModal} = this.state;
    const {
      currentSummit,
      extraQuestionsOrderDir,
      extraQuestionsOrder,
      actionTypesOrderDir,
      actionTypesOrder,
      allowedMembers
    } = this.props;

    let trackGroupsColumns = [
      {columnKey: 'name', value: T.translate("edit_selection_plan.name")},
      {columnKey: 'description', value: T.translate("edit_selection_plan.description")}
    ];

    let trackGroupsOptions = {
      valueKey: "name",
      labelKey: "name",
      defaultOptions: true,
      actions: {
        search: (input, callback) => {
          queryTrackGroups(currentSummit.id, input, callback);
        },
        delete: {onClick: this.handleTrackGroupUnLink},
        add: {onClick: this.handleTrackGroupLink}
      }
    };

    let eventTypesColumns = [
      {columnKey: 'name', value: T.translate("edit_selection_plan.name")},
    ];

    let eventTypesOptions = {
      valueKey: "name",
      labelKey: "name",
      defaultOptions: true,
      actions: {
        search: (input, callback) => {
          queryEventTypes(currentSummit.id, input, callback, PresentationTypeClassName);
        },
        delete: {onClick: this.handleDeleteEventType},
        add: {onClick: this.handleAddEventType}
      }
    };

    const extraQuestionColumns = [
      {columnKey: 'type', value: T.translate("order_extra_question_list.question_type")},
      {columnKey: 'label', value: T.translate("order_extra_question_list.visible_question")},
      {columnKey: 'name', value: T.translate("order_extra_question_list.question_id")}
    ];

    const extraQuestionsOptions = {
      sortCol: extraQuestionsOrder,
      sortDir: extraQuestionsOrderDir,
      actions: {
        edit: {onClick: this.handleEditExtraQuestion},
        delete: {onClick: this.handleDeleteExtraQuestion}
      }
    }

    const ratingTypesColumns = [
      {columnKey: 'name', value: T.translate("rating_type_list.name")},
      {columnKey: 'weight', value: T.translate("rating_type_list.weight")}
    ];

    let ratingTypesOptions = {
      actions: {
        edit: {onClick: this.handleEditRatingType},
        delete: {onClick: this.handleDeleteRatingType}
      }
    };

    const actionTypesColumns = [
      {columnKey: 'label', value: T.translate("progress_flags.label")},
    ];

    const actionTypesOptions = {
      sortCol: actionTypesOrder,
      sortDir: actionTypesOrderDir,
      actions: {
        edit: {onClick: this.handleEditProgressFlag},
        delete: {onClick: this.handleRemoveProgressFlag},
      }
    }

    let allowedMembersColumns = [
      {columnKey: 'id', value: T.translate("edit_selection_plan.id")},
      {columnKey: 'email', value: T.translate("edit_selection_plan.email")}
    ];

    let allowedMembersOptions = {
      sortCol: 'email',
      sortDir: 1,
      actions: {
        delete: {onClick: this.handleDeleteAllowedMember}
      }
    };

    return (
      <form className="selection-plan-form">
        <input type="hidden" id="id" value={entity.id}/>
        <div className="row form-group">
          <div className="col-md-3">
            <label> {T.translate("edit_selection_plan.name")} *</label>
            <Input
              id="name"
              className="form-control"
              error={this.hasErrors('name')}
              onChange={this.handleChange}
              value={entity.name}
            />
          </div>
          <div className="col-md-3">
            <label> {T.translate("edit_selection_plan.max_submissions")}</label>
            <Input
              className="form-control"
              type="number"
              error={this.hasErrors('max_submission_allowed_per_user')}
              id="max_submission_allowed_per_user"
              value={entity.max_submission_allowed_per_user}
              onChange={this.handleChange}
              min={0}
            />
          </div>
          <div className="col-md-2 checkboxes-div">
            <div className="form-check abc-checkbox">
              <input type="checkbox" id="is_enabled" checked={entity.is_enabled}
                     onChange={this.handleChange} className="form-check-input"/>
              <label className="form-check-label" htmlFor="is_enabled">
                {T.translate("edit_selection_plan.enabled")}
              </label>
            </div>
          </div>
          <div className="col-md-2 checkboxes-div">
            <div className="form-check abc-checkbox">
              <input type="checkbox" id="allow_proposed_schedules" checked={entity.allow_proposed_schedules}
                     onChange={this.handleChange} className="form-check-input"/>
              <label className="form-check-label" htmlFor="allow_proposed_schedules">
                {T.translate("edit_selection_plan.allow_proposed_schedules")}
              </label>
            </div>
          </div>          
          <div className="col-md-2 checkboxes-div">
            <div className="form-check abc-checkbox">
              <input type="checkbox" id="allow_new_presentations" checked={entity.allow_new_presentations}
                     onChange={this.handleChange} className="form-check-input"/>
              <label className="form-check-label" htmlFor="allow_new_presentations">
                {T.translate("edit_selection_plan.allow_new_presentations")}
              </label>
            </div>
          </div>
        </div>

        <div className="row form-group">
          <div className="col-md-6">
            <label> {T.translate("edit_selection_plan.submission_begin_date")} </label>
            <DateTimePicker
              id="submission_begin_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.submission_begin_date, currentSummit.time_zone_id)}
            />
          </div>
          <div className="col-md-6">
            <label> {T.translate("edit_selection_plan.submission_end_date")} </label>
            <DateTimePicker
              id="submission_end_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.submission_end_date, currentSummit.time_zone_id)}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-6">
            <label>
              {T.translate("edit_selection_plan.submission_lock_down_presentation_status_date")} &nbsp;
              <i className="fa fa-info-circle" aria-hidden="true"
                 title={T.translate("edit_selection_plan.submission_lock_down_presentation_status_date_info")}/>
            </label>
            <DateTimePicker
              id="submission_lock_down_presentation_status_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.submission_lock_down_presentation_status_date, currentSummit.time_zone_id)}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-6">
            <label> {T.translate("edit_selection_plan.voting_begin_date")} </label>
            <DateTimePicker
              id="voting_begin_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.voting_begin_date, currentSummit.time_zone_id)}
            />
          </div>
          <div className="col-md-6">
            <label> {T.translate("edit_selection_plan.voting_end_date")} </label>
            <DateTimePicker
              id="voting_end_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.voting_end_date, currentSummit.time_zone_id)}
            />
          </div>
        </div>
        <div className="row form-group">
          <div className="col-md-6">
            <label> {T.translate("edit_selection_plan.selection_begin_date")} </label>
            <DateTimePicker
              id="selection_begin_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.selection_begin_date, currentSummit.time_zone_id)}
            />
          </div>
          <div className="col-md-6">
            <label> {T.translate("edit_selection_plan.selection_end_date")} </label>
            <DateTimePicker
              id="selection_end_date"
              onChange={this.handleChange}
              format={{date: "YYYY-MM-DD", time: "HH:mm"}}
              timezone={currentSummit.time_zone_id}
              value={epochToMomentTimeZone(entity.selection_end_date, currentSummit.time_zone_id)}
            />
          </div>
        </div>

        <div className="row form-group">
          <div className="col-md-12">
            <label> {T.translate("edit_selection_plan.submission_period_disclaimer")} *</label>
            <TextEditor
              id="submission_period_disclaimer"
              value={entity.submission_period_disclaimer}
              onChange={this.handleChange}
              error={this.hasErrors('submission_period_disclaimer')}
            />
          </div>
        </div>

        <div className="row form-group">
          <div className="col-md-12">
            <label> {T.translate("edit_selection_plan.allowed_presentation_questions")} *</label>
            <Dropdown
              id="allowed_presentation_questions"
              value={entity.allowed_presentation_questions}
              placeholder={T.translate("edit_selection_plan.placeholders.allowed_presentation_questions")}
              onChange={this.handleChange}
              options={DEFAULT_ALLOWED_QUESTIONS}
              isMulti={true}
            />
          </div>
        </div>

        <hr/>

        {entity.id !== 0 &&
        <>
          <Panel
            show={showSection === 'track_groups'}
            title={T.translate("edit_selection_plan.track_groups")}
            handleClick={() => {
              this.toggleSection('track_groups')
            }}
          >
            <SimpleLinkList
              values={entity.track_groups}
              columns={trackGroupsColumns}
              options={trackGroupsOptions}
            />
          </Panel>
          <Panel
            show={showSection === 'event_types'}
            title={T.translate("edit_selection_plan.event_types")}
            handleClick={() => {
              this.toggleSection('event_types')
            }}
          >
            <SimpleLinkList
              values={entity.event_types}
              columns={eventTypesColumns}
              options={eventTypesOptions}
            />
          </Panel>
          <Panel
            show={showSection === 'extra_questions'}
            title={T.translate("edit_selection_plan.extra_questions")}
            handleClick={() => {
              this.toggleSection('extra_questions')
            }}
          >
            <div className={'row'}>
              <Many2ManyDropDown id="addAllowedExtraQuestions"
                                 isClearable={true}
                                 placeholder={T.translate("edit_selection_plan.placeholders.link_question")}
                                 fetchOptions={this.fetchSummitSelectionPlanExtraQuestions}
                                 onAdd={this.linkSummitSelectionPlanExtraQuestion}
              />
              <div className="col-md-6 text-right col-md-offset-6">
                <button className="btn btn-primary right-space" onClick={this.handleNewExtraQuestion}>
                  {T.translate("edit_selection_plan.add_extra_questions")}
                </button>
              </div>
            </div>
            {entity.extra_questions.length === 0 &&
            <div>{T.translate("edit_selection_plan.no_extra_questions")}</div>
            }
            {entity.extra_questions.length > 0 &&
            <SortableTable
              options={extraQuestionsOptions}
              data={entity.extra_questions.map((q) => {
                return {...q, label: stripTags(q.label)}
              })}
              columns={extraQuestionColumns}
              dropCallback={this.props.updateExtraQuestionOrder}
              orderField="order"
            />
            }
          </Panel>
          <Panel
            show={showSection === 'email_templates'}
            title={T.translate("edit_selection_plan.email_templates")}
            handleClick={() => {
              this.toggleSection('email_templates')
            }}
          >
            <div className="row form-group">
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.creator_notification_email_template")}</label>
                <EmailTemplateInput
                  id="presentation_creator_notification_email_template"
                  value={entity.presentation_creator_notification_email_template}
                  placeholder={T.translate("edit_selection_plan.placeholders.creator_notification_email_select_template")}
                  onChange={this.handleNotificationEmailTemplateChange}
                  isClearable={true}
                  plainValue
                />
              </div>
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.moderator_notification_email_template")}</label>
                <EmailTemplateInput
                  id="presentation_moderator_notification_email_template"
                  value={entity.presentation_moderator_notification_email_template}
                  placeholder={T.translate("edit_selection_plan.placeholders.moderator_notification_email_select_template")}
                  onChange={this.handleNotificationEmailTemplateChange}
                  isClearable={true}
                  plainValue
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.speaker_notification_email_template")}</label>
                <EmailTemplateInput
                  id="presentation_speaker_notification_email_template"
                  value={entity.presentation_speaker_notification_email_template}
                  placeholder={T.translate("edit_selection_plan.placeholders.speaker_notification_email_select_template")}
                  onChange={this.handleNotificationEmailTemplateChange}
                  isClearable={true}
                  plainValue
                />
              </div>
            </div>
          </Panel>
          <Panel
            show={showSection === 'rating_types'}
            title={T.translate("edit_rating_type.title")}
            handleClick={() => {
              this.toggleSection('rating_types')
            }}>

            <div className={'row'}>
              <div className="col-md-6 text-right col-md-offset-6">
                <button className="btn btn-primary right-space" onClick={this.handleAddRatingType}>
                  {T.translate("edit_rating_type.add_rating_type")}
                </button>
              </div>
            </div>
            <SortableTable
              options={ratingTypesOptions}
              data={entity.track_chair_rating_types}
              columns={ratingTypesColumns}
              dropCallback={this.props.onUpdateRatingTypeOrder}
              orderField="order"
            />
          </Panel>
          <Panel
            show={showSection === 'presentation_action_types'}
            title={T.translate("edit_selection_plan.presentation_action_types")}
            handleClick={() => {
              this.toggleSection('presentation_action_types')
            }}
          >
            <div className={'row'}>
              <Many2ManyDropDown id="addAllowedPresentationActionType"
                                 isClearable={true}
                                 placeholder={T.translate("edit_selection_plan.placeholders.link_presentation_action_type")}
                                 fetchOptions={this.fetchSummitPresentationActionTypes}
                                 onAdd={this.linkSummitProgressFlag}
              />
              <div className="col-md-6 text-right col-md-offset-6">
                <button className="btn btn-primary right-space" onClick={this.handleAddProgressFlag}>
                  {T.translate("edit_selection_plan.add_presentation_action_type")}
                </button>
              </div>
            </div>
            {entity.allowed_presentation_action_types.length === 0 &&
            <div>{T.translate("edit_selection_plan.no_presentation_action_types")}</div>
            }
            {entity.allowed_presentation_action_types.length > 0 &&
            <SortableTable
              options={actionTypesOptions}
              data={entity.allowed_presentation_action_types}
              columns={actionTypesColumns}
              dropCallback={this.props.onUpdateProgressFlagOrder}
              orderField="order"
            />
            }
          </Panel>
          <Panel
            show={showSection === 'allowed_members'}
            title={T.translate("edit_selection_plan.allowed_members")}
            handleClick={() => {
              this.toggleSection('allowed_members')
            }}
            className="allowed-members-panel"
          >
            <div className="allowed-members-header">
              <div className="pull-right input-group">
                <input className="form-control" onChange={ev => this.setState({newMemberEmail: ev.target.value})}
                       value={newMemberEmail}/>
                <span className="input-group-btn">
                                    <button type="button" className="btn btn-default add-button"
                                            onClick={this.handleAddAllowedMember} disabled={!newMemberEmail}>
                                        {T.translate("general.add")}
                                    </button>
                                </span>
              </div>

              <div className="pull-left input-group">
                <button type="button" className="btn btn-primary"
                        onClick={() => this.setState({showImportModal: true})}>
                  {T.translate("edit_selection_plan.import")}
                </button>
              </div>
            </div>

            <Table
              data={allowedMembers.data}
              columns={allowedMembersColumns}
              options={allowedMembersOptions}
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
              items={allowedMembers.lastPage}
              activePage={allowedMembers.currentPage}
              onSelect={this.handleAllowedMembersPageChange}
            />
          </Panel>
          <Panel
            show={showSection === 'cfp_settings'}
            title={T.translate("edit_selection_plan.cfp_settings")}
            handleClick={() => {
              this.toggleSection('cfp_settings')
            }}
          >
            <div className="row form-group">
              <div className="col-md-12">
                <label> {T.translate("edit_selection_plan.cfp_presentation_edition_custom_message")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentation_edition_custom_message_info")}/>
                </label>
                <TextEditor
                  id="cfp_presentation_edition_custom_message"
                  error={this.hasErrors('cfp_presentation_edition_custom_message')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentation_edition_custom_message?.value || ''}
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_speakers_singular_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_speakers_singular_label_info")}/>
                </label>
                <Input
                  id="cfp_speakers_singular_label"
                  className="form-control"
                  error={this.hasErrors('cfp_speakers_singular_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_speakers_singular_label?.value || ''}
                />
              </div>
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_speakers_plural_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_speakers_plural_label_info")}/>
                </label>
                <Input
                  id="cfp_speakers_plural_label"
                  className="form-control"
                  error={this.hasErrors('cfp_speakers_plural_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_speakers_plural_label?.value || ''}
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_presentations_singular_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentations_singular_label_info")}/>
                </label>
                <Input
                  id="cfp_presentations_singular_label"
                  className="form-control"
                  error={this.hasErrors('cfp_presentations_singular_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentations_singular_label?.value || ''}
                />
              </div>
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_presentations_plural_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentations_plural_label_info")}/>
                </label>
                <Input
                  id="cfp_presentations_plural_label"
                  className="form-control"
                  error={this.hasErrors('cfp_presentations_plural_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentations_plural_label?.value || ''}
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_presentation_summary_title_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentation_summary_title_label_info")}/>
                </label>
                <Input
                  id="cfp_presentation_summary_title_label"
                  className="form-control"
                  error={this.hasErrors('cfp_presentation_summary_title_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentation_summary_title_label?.value || ''}
                />
              </div>
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_presentation_summary_abstract_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentation_summary_abstract_label_info")}/>
                </label>
                <Input
                  id="cfp_presentation_summary_abstract_label"
                  className="form-control"
                  error={this.hasErrors('cfp_presentation_summary_abstract_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentation_summary_abstract_label?.value || ''}
                />
              </div>
            </div>
            <div className="row form-group">
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_presentation_summary_social_summary_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentation_summary_social_summary_label_info")}/>
                </label>
                <Input
                  id="cfp_presentation_summary_social_summary_label"
                  className="form-control"
                  error={this.hasErrors('cfp_presentation_summary_social_summary_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentation_summary_social_summary_label?.value || ''}
                />
              </div>
              <div className="col-md-6">
                <label> {T.translate("edit_selection_plan.cfp_presentation_summary_links_label")}&nbsp;
                  <i className="fa fa-info-circle" aria-hidden="true"
                    title={T.translate("edit_selection_plan.cfp_presentation_summary_links_label_info")}/>
                </label>
                <Input
                  id="cfp_presentation_summary_links_label"
                  className="form-control"
                  error={this.hasErrors('cfp_presentation_summary_links_label')}
                  onChange={this.handleChange}
                  value={entity.marketing_settings.cfp_presentation_summary_links_label?.value || ''}
                />
              </div>
            </div>            
          </Panel>
        </>
        }

        <div className="row">
          <div className="col-md-12 submit-buttons">
            <input type="button" onClick={this.handleSubmit}
                   className="btn btn-primary pull-right" value={T.translate("general.save")}/>
          </div>
        </div>

        <ImportModal
          title={T.translate("edit_selection_plan.import_allowed_members")}
          show={showImportModal}
          wrapperClass="allowed-members-import-upload-wrapper"
          onHide={() => this.setState({showImportModal: false})}
          onIngest={this.handleImportAllowedMembers}
        >
          * email ( text )<br/>
        </ImportModal>

      </form>
    );
  }
}

export default SelectionPlanForm;
