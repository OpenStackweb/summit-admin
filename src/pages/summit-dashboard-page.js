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

    getFormattedTime(atime, in_seconds) {
        atime = (in_seconds) ? atime * 1000 : atime;
        return moment(atime).format('MMMM Do YYYY, h:mm:ss a');
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
                    <div className="col-md-2"> {currentSummit.time_zone.name} </div>
                    <div className="col-md-4"> {this.getFormattedTime(this.state.localtime)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Summit </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date, true)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date, true)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Submission </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date, true)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date, true)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Voting </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date, true)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date, true)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Selection </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date, true)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date, true)} </div>
                </div>
                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                    <div className="col-md-2"> <i className="fa fa-calendar"></i> Registration </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date, true)} </div>
                    <div className="col-md-1"> <i className="fa fa-angle-double-right"></i> </div>
                    <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date, true)} </div>
                </div>
                <hr/>
                <h4>Events & Attendees</h4>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;Attendees&nbsp;
                        <strong>1428</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa-users"></i>&nbsp;Speakers&nbsp;
                        <strong>521</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-calendar-plus-o"></i>&nbsp;Submitted Events&nbsp;
                        <strong>1237</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa-calendar-check-o"></i>&nbsp;Published Events&nbsp;
                        <strong>521</strong>
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
                        <strong>3067</strong>
                    </div>
                    <div className="col-md-6">
                        <i className="fa fa fa-thumbs-o-up"></i>&nbsp;Votes&nbsp;
                        <strong>16173</strong>
                    </div>
                </div>
                <hr/>
                <h4>Emails</h4>
                <div className="row">
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Accepted&nbsp;
                        <strong>155</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Rejected&nbsp;
                        <strong>887</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Alternate&nbsp;
                        <strong>56</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Accepted Alternate&nbsp;
                        <strong>21</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Accepted Rejected&nbsp;
                        <strong>96</strong>
                    </div>
                    <div className="col-md-4">
                        <i className="fa fa-paper-plane"></i>&nbsp;Alternate Rejected&nbsp;
                        <strong>38</strong>
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
