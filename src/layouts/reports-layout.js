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
import { Switch, Route, withRouter } from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';
import ReportListPage from '../pages/reports/report-list-page';
import NoMatchPage from "../pages/no-match-page";
import {
  RsvpReport,
  RsvpEventReport,
  RoomReport,
  PresentationVideoReport,
  FeedbackReport,
  FeedbackGroupReport,
  TagReport,
  SingleTagReport,
  SmartSpeakerReport,
  SmartPresentationReport,
  MetricsReport,
  AttendeeReport
} from "../components/reports"


class ReportsLayout extends React.Component {

    render(){
        const { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("reports.reports"), pathname: match.url }} />

                <Switch>
                    <Route strict exact path={match.url} component={ReportListPage}/>
                    <Route path={`${match.url}/rsvp_report`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("reports.rsvp_report"), pathname: match.url }} />
                                <Switch>
                                    <Route strict exact path={`${props.match.url}`} component={RsvpReport}/>
                                    <Route strict exact path={`${props.match.url}/:event_id(\\d+)`} component={RsvpEventReport}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={`${match.url}/room_report`} component={RoomReport}/>
                    <Route strict exact path={`${match.url}/presentation_video_report`} component={PresentationVideoReport}/>
                    <Route path={`${match.url}/feedback_report`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("reports.feedback_report"), pathname: match.url }} />
                                <Switch>
                                    <Route strict exact path={`${props.match.url}`} component={FeedbackReport}/>
                                    <Route strict exact path={`${props.match.url}/:group(track|speaker|presentation)/:group_id(\\d+)`} component={FeedbackGroupReport}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/tag_report`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("reports.tag_report"), pathname: match.url }} />
                                <Switch>
                                    <Route strict exact path={`${props.match.url}`} component={TagReport}/>
                                    <Route strict exact path={`${props.match.url}/:tag_id(\\d+)`} component={SingleTagReport}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={`${match.url}/speaker_report`} component={SmartSpeakerReport}/>
                    <Route strict exact path={`${match.url}/presentation_report`} component={SmartPresentationReport}/>
                    <Route strict exact path={`${match.url}/metrics_report`} component={MetricsReport}/>
                    <Route strict exact path={`${match.url}/attendee_report`} component={AttendeeReport}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default Restrict(withRouter(ReportsLayout), 'reports');


