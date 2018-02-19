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
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { getSummitById }  from '../../actions/summit-actions'
import T from "i18n-react/dist/i18n-react"
import '../../styles/summit-dashboard-page.less'

class SummitDashboardPage extends React.Component {

    constructor(props){
        super(props);

        this.interval = null;

        this.state = {
            localtime: moment()
        }
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }
    }

    componentDidMount() {
        this.interval = setInterval(this.localTimer.bind(this), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentWillReceiveProps(nextProps) {
        let {currentSummit} = nextProps;

        if(currentSummit){
            let localtime = moment().tz(currentSummit.time_zone.name);
            this.setState({
                localtime: localtime
            });
        }
    }

    localTimer() {
        this.setState({
           localtime: this.state.localtime.add(1, 'second')
        });
    }

    getFormattedTime(atime) {
        atime = atime * 1000;
        return moment(atime).tz(this.props.currentSummit.time_zone.name).format('MMMM Do YYYY, h:mm:ss a');
    }

    getTimeClass(start_time, end_time) {
        if (this.state.localtime.isBefore(moment(start_time))) return 'future';
        if (this.state.localtime.isAfter(moment(end_time))) return 'past';
        return 'present';
    }

    render() {
        let { currentSummit } = this.props;
        let currentSummitTime = (new Date).getTime();

        if(currentSummit == null) return (<div></div>);

        return (
            <div className="container dashboard">
                <h3>{currentSummit.name} {T.translate("general.summit")}</h3>
                <hr/>
                <h4>{T.translate("dashboard.dates")}</h4>
                <div className="row">
                    <div className="col-md-3"> {currentSummit.time_zone.name} </div>
                    <div className="col-md-4"> {this.getFormattedTime(this.state.localtime / 1000)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> {T.translate("general.summit")} </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> {T.translate("dashboard.submission")} </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.submission_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.submission_end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> {T.translate("dashboard.voting")} </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.voting_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.voting_end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> {T.translate("dashboard.selection")} </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.selection_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.selection_end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> {T.translate("dashboard.registration")} </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.registration_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.registration_end_date)} </div>
                </div>
                <hr/>
                <h4>{T.translate("dashboard.events")}</h4>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;{T.translate("dashboard.attendees")}&nbsp;
                        <strong>{currentSummit.attendees_count}</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;{T.translate("general.speakers")}&nbsp;
                        <strong>{currentSummit.speakers_count}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-calendar-plus-o"></i>&nbsp;{T.translate("dashboard.submitted_events")}&nbsp;
                        <strong>{currentSummit.presentations_submitted_count}</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa-calendar-check-o"></i>&nbsp;{T.translate("dashboard.published_events")}&nbsp;
                        <strong>{currentSummit.published_events_count}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-building"></i>&nbsp;{T.translate("dashboard.venues")}&nbsp;
                        <strong>{currentSummit.locations.filter(l => l.class_name == 'SummitVenue').length}</strong>
                    </div>
                </div>
                <hr/>
                <h4>{T.translate("dashboard.voting")}</h4>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;{T.translate("dashboard.voters")}&nbsp;
                        <strong>{currentSummit.presentation_voters_count}</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa fa-thumbs-o-up"></i>&nbsp;{T.translate("dashboard.votes")}&nbsp;
                        <strong>{currentSummit.presentation_votes_count}</strong>
                    </div>
                </div>
                <hr/>
                <h4>{T.translate("dashboard.emails")}</h4>
                <div className="row">
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;{T.translate("dashboard.accepted")}&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_accepted_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;{T.translate("dashboard.rejected")}&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_rejected_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;{T.translate("dashboard.alternate")}&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_alternate_count}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;{T.translate("dashboard.accepted_alternate")}&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_accepted_alternate_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;{T.translate("dashboard.accepted_rejected")}&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_accepted_rejected_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;{T.translate("dashboard.alternate_rejected")}&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_alternate_rejected_count}</strong>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit : currentSummitState.currentSummit,
})

export default connect (
    mapStateToProps,
    {
        getSummitById
    }
)(SummitDashboardPage);
