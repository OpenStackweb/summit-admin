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
import '../styles/summit-dashboard-page.less'

class SummitDashboardPage extends React.Component {

    constructor(props){
        super(props);

        let localtime = moment().tz(this.props.currentSummit.time_zone.name);

        this.state = {
            localtime: localtime
        }
    }

    componentDidMount() {
        setInterval(this.localTimer.bind(this), 1000);
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

        return (
            <div className="container dashboard">
                <h3>{currentSummit.name} Summit</h3>
                <hr/>
                <h4>Dates & Times</h4>
                <div className="row">
                    <div className="col-md-3"> {currentSummit.time_zone.name} </div>
                    <div className="col-md-4"> {this.getFormattedTime(this.state.localtime / 1000)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Summit </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Submission </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.submission_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.submission_end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Voting </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.voting_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.voting_end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Selection </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.selection_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.selection_end_date)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Registration </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.registration_begin_date)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.registration_end_date)} </div>
                </div>
                <hr/>
                <h4>Events & Attendees</h4>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;Attendees&nbsp;
                        <strong>{currentSummit.attendees_count}</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;Speakers&nbsp;
                        <strong>{currentSummit.speakers_count}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-calendar-plus-o"></i>&nbsp;Submitted Events&nbsp;
                        <strong>{currentSummit.presentations_submitted_count}</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa-calendar-check-o"></i>&nbsp;Published Events&nbsp;
                        <strong>{currentSummit.published_events_count}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-building"></i>&nbsp;Venues&nbsp;
                        <strong>{currentSummit.locations.filter(l => l.class_name == 'SummitVenue').length}</strong>
                    </div>
                </div>
                <hr/>
                <h4>Voting</h4>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;Voters&nbsp;
                        <strong>{currentSummit.presentation_voters_count}</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa fa-thumbs-o-up"></i>&nbsp;Votes&nbsp;
                        <strong>{currentSummit.presentation_votes_count}</strong>
                    </div>
                </div>
                <hr/>
                <h4>Emails</h4>
                <div className="row">
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Accepted&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_accepted_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Rejected&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_rejected_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Alternate&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_alternate_count}</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Accepted Alternate&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_accepted_alternate_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Accepted Rejected&nbsp;
                        <strong>{currentSummit.speaker_announcement_email_accepted_rejected_count}</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Alternate Rejected&nbsp;
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

    }
)(SummitDashboardPage);
