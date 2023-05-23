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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';

import '../../styles/report-list-page.less';

const ReportListPage = ({currentSummit, history}) => {
    const presentationTypeId = currentSummit?.event_types?.find(et => et.name === 'Presentation')?.id;
    const typeFilterQS = presentationTypeId ? `&type=${presentationTypeId}` : '';
    
    const handleClick = (reportName) => {
        history.push(`/app/summits/${currentSummit.id}/reports/${reportName}`);
    }
    
    return(
      <div className="container report-list">
          <h3> {T.translate("reports.reports")} </h3>
          
          <div className="row">
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('presentation_report')}>
                      {T.translate(`reports.presentation_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('speaker_report#published_in=true')}>
                      {T.translate(`reports.speaker_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('rsvp_report')}>
                      {T.translate(`reports.rsvp_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick(`room_report#sort=time&sortdir=1${typeFilterQS}`)}>
                      {T.translate(`reports.room_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('presentation_video_report')}>
                      {T.translate(`reports.presentation_video_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('feedback_report')}>
                      {T.translate(`reports.feedback_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('tag_report')}>
                      {T.translate(`reports.tag_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('metrics_report')}>
                      {T.translate(`reports.metrics_report`)}
                  </button>
              </div>
              <div className="col-md-6">
                  <button className="btn btn-default" onClick={() => handleClick('attendee_report')}>
                      {T.translate(`reports.attendee_report`)}
                  </button>
              </div>
          
          </div>
      
      </div>
    )
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit   : currentSummitState.currentSummit,
})

export default connect (
    mapStateToProps,
    {}
)(ReportListPage);
