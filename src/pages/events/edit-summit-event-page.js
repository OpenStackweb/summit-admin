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

import React, {useEffect} from 'react'
import {connect} from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import EventForm from '../../components/forms/event-form';
import {
  saveEvent,
  attachFile,
  getEvents,
  removeImage,
  getEventFeedback,
  deleteEventFeedback,
  getEventFeedbackCSV,
  changeFlag,
  getActionTypes,
  getEventComments,
} from '../../actions/event-actions';
import {unPublishEvent} from '../../actions/summit-builder-actions';
import {deleteEventMaterial} from '../../actions/event-material-actions';
import {deleteEventComment} from '../../actions/event-comment-actions';
import { getSummitEventAuditLog, clearAuditLogParams } from '../../actions/audit-log-actions';
import {addQAMember, removeQAMember} from "../../actions/user-chat-roles-actions"

import '../../styles/edit-summit-event-page.less';
import '../../components/form-validation/validate.less';

const EditSummitEventPage = (props) => {

  useEffect(() => {
    if (props.entity.id && props.entity.selection_plan_id) {
      props.getActionTypes(props.entity.selection_plan_id)
    }
  }, [props.entity.id, props.entity.selection_plan_id])

  const goToEvent = async (next = true) => {
    const {currentSummit, history} = props;
    const {events, currentPage, lastPage} = props.allEventsData;
    let event = null;

    if (events.length === 0) {
      event = await props.getEvents().then(async data => {
        const {data: allEvents, current_page, last_page} = data;
        return next ?
          await getEventNextFromList(allEvents, current_page, last_page) :
          await getEventPrevFromList(allEvents, current_page, last_page);
      });
    } else {
      event = next ?
        await getEventNextFromList(events, currentPage, lastPage) :
        await getEventPrevFromList(events, currentPage, lastPage);
    }

    if (event) {
      history.push(`/app/summits/${currentSummit.id}/events/${event.id}`)
    }
  };

  const getEventNextFromList = async (data, current_page, last_page) => {
    const {entity} = props;
    const listLength = data.length;
    const idx = data.findIndex(ev => ev.id === entity.id);

    if (idx === -1) { // not found , return first
      return data[0];
    } else if (idx === -1 || idx === (listLength - 1)) { // last on page
      if (last_page > current_page) { // there are more pages
        return await props.getEvents(null, current_page + 1).then(async newData => {
          return newData.data[0];
        });
      } else { // last of last page
        if (last_page > 1) { // there is more than one page
          return await props.getEvents(null, 1).then(async newData => {
            return newData.data[0]; // return first event of first page
          });
        } else { // only one page, return first
          return data[0];
        }

      }
    } else {
      return data[idx + 1];
    }
  };

  const getEventPrevFromList = async (data, current_page, last_page) => {
    const {entity} = props;
    const idx = data.findIndex(ev => ev.id === entity.id);

    if (idx === -1) { // not found , return first
      return data[0];
    } else if (idx === 0) { // first on page
      if (current_page > 1) { // there are more pages
        return await props.getEvents(null, current_page - 1).then(async newData => {
          return newData.data[newData.data.length - 1];
        });
      } else { // first of first page
        if (last_page > 1) { // there is more than one page
          return await props.getEvents(null, last_page).then(async newData => {
            return newData.data[newData.data.length - 1]; // return last event of last page
          });
        } else { // only one page, return last
          return data[data.length - 1];
        }
      }
    } else {
      return data[idx - 1];
    }
  };

  const {
    currentSummit,
    entity,
    errors,
    levelOptions,
    rsvpTemplateOptions,
    extraQuestions,
    feedbackState,
    commentState,
    actionTypes,
    auditLogState,
    loading
  } = props;

  if(loading) return null;

  const header = !entity.id ? T.translate("general.summit_event") : `${entity.title} - ID ${entity.id}`;

  return (
    <div className="container">
      <h3>
        <div className="title">
          {header}
        </div>
        {!!entity.id &&
        <div className="next">
          <button className="btn btn-default prev" onClick={ev => goToEvent(false)}>
            {`<< Prev Event`}
          </button>
          <button className="btn btn-default next" onClick={ev => goToEvent(true)}>
            {`Next Event >>`}
          </button>
        </div>
        }
      </h3>
      <hr/>
      {currentSummit &&
      <EventForm
        history={props.history}
        extraQuestions={extraQuestions}
        currentSummit={currentSummit}
        levelOpts={levelOptions}
        trackOpts={currentSummit.tracks}
        typeOpts={currentSummit.event_types}
        locationOpts={currentSummit.locations}
        selectionPlansOpts={currentSummit.selection_plans}
        rsvpTemplateOpts={rsvpTemplateOptions}
        actionTypes={actionTypes}
        entity={entity}
        errors={errors}
        onSubmit={props.saveEvent}
        onAttach={props.attachFile}
        onUnpublish={props.unPublishEvent}
        onMaterialDelete={props.deleteEventMaterial}
        onRemoveImage={props.removeImage}
        onAddQAMember={props.addQAMember}
        onDeleteQAMember={props.removeQAMember}
        auditLogState={auditLogState}
        getSummitEventAuditLog={props.getSummitEventAuditLog}
        clearAuditLogParams={props.clearAuditLogParams}
        feedbackState={feedbackState}
        getEventFeedback={props.getEventFeedback}
        commentState={commentState}
        getEventComments={props.getEventComments}
        onCommentDelete={props.deleteEventComment}
        deleteEventFeedback={props.deleteEventFeedback}
        getEventFeedbackCSV={props.getEventFeedbackCSV}
        onFlagChange={props.changeFlag}
      />
      }
    </div>
  )
}

const mapStateToProps = ({ currentSummitState, currentSummitEventState, currentRsvpTemplateListState, currentEventListState, auditLogState }) => ({
    currentSummit: currentSummitState.currentSummit,
    loading: currentSummitState.loading,
    levelOptions: currentSummitEventState.levelOptions,
    rsvpTemplateOptions: currentRsvpTemplateListState.rsvpTemplates,
    entity: currentSummitEventState.entity,
    errors: currentSummitEventState.errors,
    extraQuestions: currentSummitEventState.extraQuestions,
    feedbackState: currentSummitEventState.feedbackState,
    commentState: currentSummitEventState.commentState,
    auditLogState: auditLogState,
    actionTypes: currentSummitEventState.actionTypes,
    allEventsData: currentEventListState
});

export default connect(
  mapStateToProps,
  {
    saveEvent,
    attachFile,
    unPublishEvent,
    deleteEventMaterial,
    getEvents,
    removeImage,
    addQAMember,
    removeQAMember,
    getEventFeedback,
    deleteEventFeedback,
    getEventFeedbackCSV,
    changeFlag,
    getActionTypes,
    getSummitEventAuditLog,
    clearAuditLogParams,
    getEventComments,
    deleteEventComment
  }

)(EditSummitEventPage);
