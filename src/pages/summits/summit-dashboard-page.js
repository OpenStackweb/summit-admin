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
import { Breadcrumb } from 'react-breadcrumbs';
import Member from '../../models/member';
import { Pie } from 'react-chartjs-2';
import {Chart} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../../styles/summit-dashboard-page.less'

class SummitDashboardPage extends React.Component {

    constructor(props){
        super(props);

        this.interval = null;

        this.state = {
            localtime: moment(),
            dataTickets:null,
            dataTicketTypes:null,
            totalTicketTypes:0,
            dataBadgeTypes: null,
            totalBadgeTypes:0,
            dataAttendees: null,
            dataTicketsPerBadgeFeatures: null,
            dataCheckinsPerBadgeFeatures: null,
            collapseState: {
                'registration': true,
                'emails': true,
                'events': true,
                'voting': true,
            }
        }
        this.onCollapseChange = this.onCollapseChange.bind(this);
    }

    onCollapseChange(section){
        let newCollapseState= {...this.state.collapseState};
        newCollapseState[section] = !newCollapseState[section];
        this.setState({...this.state, collapseState:newCollapseState });
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        this.interval = setInterval(this.localTimer.bind(this), 1000);

        if(currentSummit){
            let localtime = moment().tz(currentSummit.time_zone.name);
            this.setState({...this.state,
                localtime: localtime,
                dataTickets : {
                    labels: ['Actives', 'Inactives'],
                    datasets: [
                        {
                            label: '# of Tickets',
                            data: [this.props.currentSummit.total_active_tickets, this.props.currentSummit.total_inactive_tickets],
                            backgroundColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 99, 132, 1)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 99, 132, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                dataTicketTypes : {
                    labels: this.props.currentSummit.total_tickets_per_type.map(tt => tt.type),
                    datasets: [
                        {
                            label: 'Ticket Types',
                            data: this.props.currentSummit.total_tickets_per_type.map(tt => parseInt(tt.qty)),
                            borderWidth: 1,
                            backgroundColor: this.props.currentSummit.total_tickets_per_type.map(tt => {
                                let r = Math.floor(Math.random() * 200);
                                let g = Math.floor(Math.random() * 200);
                                let b = Math.floor(Math.random() * 200);
                                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
                            })
                        },
                    ],
                },
                totalTicketTypes: this.props.currentSummit.total_tickets_per_type.reduce(function(accumulator, currentValue) {
                    return accumulator + parseInt(currentValue.qty);
                }, 0),
                dataBadgeTypes : {
                    labels: this.props.currentSummit.total_badges_per_type.map(tt => tt.type),
                    datasets: [
                        {
                            label: 'Badge Types',
                            data: this.props.currentSummit.total_badges_per_type.map(tt => parseInt(tt.qty)),
                            borderWidth: 1,
                            backgroundColor: this.props.currentSummit.total_badges_per_type.map(tt => {
                                let r = Math.floor(Math.random() * 200);
                                let g = Math.floor(Math.random() * 200);
                                let b = Math.floor(Math.random() * 200);
                                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
                            })
                        },
                    ],
                },
                totalBadgeTypes: this.props.currentSummit.total_badges_per_type.reduce(function(accumulator, currentValue) {
                    return accumulator + parseInt(currentValue.qty);
                }, 0),
                dataAttendees:{
                    labels: ['Checked In', 'Non Checked In', 'Virtual Check In'],
                    datasets: [
                        {
                            label: 'Attendees',
                            data: [
                                this.props.currentSummit.total_checked_in_attendees,
                                this.props.currentSummit.total_non_checked_in_attendees,
                                this.props.currentSummit.total_virtual_attendees
                            ],
                            backgroundColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 159, 64, 1)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                dataTicketsPerBadgeFeatures:{
                    labels: this.props.currentSummit.total_tickets_per_badge_feature.map(tt => tt.type),
                    datasets: [
                        {
                            label: 'Badge Features1',
                            data: this.props.currentSummit.total_tickets_per_badge_feature.map(tt => parseInt(tt.tickets_qty)),
                            borderWidth: 1,
                            backgroundColor: this.props.currentSummit.total_tickets_per_badge_feature.map(tt => {
                                let r = Math.floor(Math.random() * 200);
                                let g = Math.floor(Math.random() * 200);
                                let b = Math.floor(Math.random() * 200);
                                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
                            })
                        },
                    ],
                },
                dataCheckinsPerBadgeFeatures:{
                    labels: this.props.currentSummit.total_tickets_per_badge_feature.map(tt => tt.type),
                    datasets: [
                        {
                            label: 'Badge Features1',
                            data: this.props.currentSummit.total_tickets_per_badge_feature.map(tt => parseInt(tt.checkin_qty)),
                            borderWidth: 1,
                            backgroundColor: this.props.currentSummit.total_tickets_per_badge_feature.map(tt => {
                                let r = Math.floor(Math.random() * 200);
                                let g = Math.floor(Math.random() * 200);
                                let b = Math.floor(Math.random() * 200);
                                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
                            })
                        },
                    ],
                }
            });
        }
    }

    componentWillMount() {
        Chart.register(ChartDataLabels);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
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
        const { currentSummit, match, member } = this.props;
        let memberObj = new Member(member);
        let currentSummitTime = (new Date).getTime();
        let canEditSummit = memberObj.canEditSummit();

        if(!currentSummit.id) return(<div />);

        return (
            <div>
                <Breadcrumb data={{ title: T.translate("dashboard.dashboard"), pathname: match.url }} />
                <div className="container dashboard">
                    <h3>{currentSummit.name} {T.translate("general.summit")}</h3>
                    <hr/>
                    <h4>{T.translate("dashboard.dates")}</h4>
                    <div className="row">
                        <div className="col-md-6"> {currentSummit.time_zone.name} </div>
                        <div className="col-md-6"> {this.getFormattedTime(this.state.localtime / 1000)} </div>
                    </div>
                    <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                        <div className="col-md-2"> <i className="fa fa-calendar"/> {T.translate("general.summit")} </div>
                        <div className="col-md-4"> {this.getFormattedTime(currentSummit.start_date)} </div>
                        <div className="col-md-1"> <i className="fa fa-angle-double-right"/> </div>
                        <div className="col-md-4"> {this.getFormattedTime(currentSummit.end_date)} </div>
                    </div>
                    <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                        <div className="col-md-2"> <i className="fa fa-calendar"/> {T.translate("dashboard.registration")} </div>
                        <div className="col-md-4"> {this.getFormattedTime(currentSummit.registration_begin_date)} </div>
                        <div className="col-md-1"> <i className="fa fa-angle-double-right"/> </div>
                        <div className="col-md-4"> {this.getFormattedTime(currentSummit.registration_end_date)} </div>
                    </div>
                    {canEditSummit && currentSummit.selection_plans.map(sp => (
                        <div key={'seleplan_'+sp.id} className="selection-plan row">
                            <div className="col-md-12">{sp.name}</div>
                            <div className="col-md-12">
                                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                                    <div className="col-md-2"> <i className="fa fa-calendar"/> {T.translate("dashboard.submission")} </div>
                                    <div className="col-md-4"> {this.getFormattedTime(sp.submission_begin_date)} </div>
                                    <div className="col-md-1"> <i className="fa fa-angle-double-right"/> </div>
                                    <div className="col-md-4"> {this.getFormattedTime(sp.submission_end_date)} </div>
                                </div>
                                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                                    <div className="col-md-2"> <i className="fa fa-calendar"/> {T.translate("dashboard.voting")} </div>
                                    <div className="col-md-4"> {this.getFormattedTime(sp.voting_begin_date)} </div>
                                    <div className="col-md-1"> <i className="fa fa-angle-double-right"/> </div>
                                    <div className="col-md-4"> {this.getFormattedTime(sp.voting_end_date)} </div>
                                </div>
                                <div className={'row ' + this.getTimeClass(currentSummit.start_date, currentSummit.end_date)}>
                                    <div className="col-md-2"> <i className="fa fa-calendar"/> {T.translate("dashboard.selection")} </div>
                                    <div className="col-md-4"> {this.getFormattedTime(sp.selection_begin_date)} </div>
                                    <div className="col-md-1"> <i className="fa fa-angle-double-right"/> </div>
                                    <div className="col-md-4"> {this.getFormattedTime(sp.selection_end_date)} </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {canEditSummit &&
                    <div>
                        <hr/>
                        <h4>{T.translate("dashboard.registration_stats")}&nbsp;
                            {this.state.collapseState['registration'] && <i title={T.translate("dashboard.expand")} onClick={() => this.onCollapseChange('registration')} className="fa fa-plus-square clickable" aria-hidden="true"></i>}
                            {!this.state.collapseState['registration'] && <i title={T.translate("dashboard.collapse")} onClick={() => this.onCollapseChange('registration')} className="fa fa-minus-square clickable" aria-hidden="true"></i>}
                        </h4>
                        {! this.state.collapseState['registration'] &&
                            <div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <i className="fa fa-money"/>&nbsp;{T.translate("dashboard.payment_amount_collected")}&nbsp;
                                        <strong>$&nbsp;{currentSummit.total_payment_amount_collected}</strong>
                                    </div>
                                    <div className="col-md-6">
                                        {T.translate("dashboard.refund_amount_emitted")}&nbsp;
                                        <strong>$&nbsp;{currentSummit.total_refund_amount_emitted}</strong>
                                    </div>
                                </div>
                                <h5><i className="fa fa-ticket"/>&nbsp;{T.translate("dashboard.total_tickets")} ({currentSummit.total_active_tickets+currentSummit.total_inactive_tickets}) / {T.translate("dashboard.orders")} ({currentSummit.total_orders})</h5>
                                <div className="row">
                                    <div className="col-md-12">
                                        <Pie data={this.state.dataTickets}
                                             width={325}
                                             height={325}
                                             options = {{
                                                 maintainAspectRatio: false,
                                                 plugins: {
                                                     datalabels: {
                                                         formatter: (value, ctx) => {
                                                             let datasets = ctx.chart.data.datasets;
                                                             if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                                                                 let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                                                                 let percentage = Math.round((value / sum) * 100) + '%';
                                                                 return percentage;
                                                             } else {
                                                                 return percentage;
                                                             }
                                                         },
                                                         color: '#000000',
                                                     }
                                                 },
                                             }}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <h5>{T.translate("dashboard.ticket_types")} ({this.state.totalTicketTypes})</h5>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <Pie data={this.state.dataTicketTypes}
                                                     width={325}
                                                     height={325}
                                                     options = {{
                                                         maintainAspectRatio: false,
                                                         plugins: {
                                                             datalabels: {
                                                                 formatter: (value, ctx) => {
                                                                     let datasets = ctx.chart.data.datasets;
                                                                     if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                                                                         let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                                                                         let percentage = Math.round((value / sum) * 100) + '%';
                                                                         return percentage;
                                                                     } else {
                                                                         return percentage;
                                                                     }
                                                                 },
                                                                 color: '#fff',
                                                             }
                                                         },
                                                     }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>{T.translate("dashboard.badge_types")}  ({this.state.totalBadgeTypes})</h5>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <Pie data={this.state.dataBadgeTypes}
                                                     width={325}
                                                     height={325}
                                                     options = {{
                                                         maintainAspectRatio: false,
                                                         plugins: {
                                                             datalabels: {
                                                                 formatter: (value, ctx) => {
                                                                     let datasets = ctx.chart.data.datasets;
                                                                     if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                                                                         let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                                                                         let percentage = Math.round((value / sum) * 100) + '%';
                                                                         return percentage;
                                                                     } else {
                                                                         return percentage;
                                                                     }
                                                                 },
                                                                 color: '#fff',
                                                             }
                                                         },
                                                     }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <h5>{T.translate("dashboard.badge_features_tickets")}</h5>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <Pie data={this.state.dataTicketsPerBadgeFeatures}
                                                     width={325}
                                                     height={325}
                                                     options = {{
                                                         maintainAspectRatio: false,
                                                         plugins: {
                                                             datalabels: {
                                                                 formatter: (value, ctx) => {
                                                                     let datasets = ctx.chart.data.datasets;
                                                                     if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                                                                         let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                                                                         let percentage = Math.round((value / sum) * 100) + '%';
                                                                         return percentage;
                                                                     } else {
                                                                         return percentage;
                                                                     }
                                                                 },
                                                                 color: '#fff',
                                                             }
                                                         },
                                                     }}
                                            />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>{T.translate("dashboard.badge_features_checkins")}</h5>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <Pie data={this.state.dataCheckinsPerBadgeFeatures}
                                                     width={325}
                                                     height={325}
                                                     options = {{
                                                         maintainAspectRatio: false,
                                                         plugins: {
                                                             datalabels: {
                                                                 formatter: (value, ctx) => {
                                                                     let datasets = ctx.chart.data.datasets;
                                                                     if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                                                                         let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                                                                         let percentage = Math.round((value / sum) * 100) + '%';
                                                                         return percentage;
                                                                     } else {
                                                                         return percentage;
                                                                     }
                                                                 },
                                                                 color: '#fff',
                                                             }
                                                         },
                                                     }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h5><i className="fa fa-users"/>&nbsp;{T.translate("dashboard.attendees")} ({this.props.currentSummit.total_checked_in_attendees+
                                    this.props.currentSummit.total_non_checked_in_attendees+
                                    this.props.currentSummit.total_virtual_attendees})</h5>
                                <div className="row">
                                   <div className="col-md-12">
                                       <Pie data={this.state.dataAttendees}
                                            width={325}
                                            height={325}
                                            options = {{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    datalabels: {
                                                        formatter: (value, ctx) => {
                                                            let datasets = ctx.chart.data.datasets;
                                                            if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                                                                let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                                                                let percentage = Math.round((value / sum) * 100) + '%';
                                                                return percentage;
                                                            } else {
                                                                return percentage;
                                                            }
                                                        },
                                                        color: '#000',
                                                    }
                                                },
                                            }}
                                       />
                                   </div>
                                </div>
                            </div>
                        }
                        <hr/>
                        <h4>{T.translate("dashboard.events")}&nbsp;
                            {this.state.collapseState['events'] && <i title={T.translate("dashboard.expand")} onClick={() => this.onCollapseChange('events')} className="fa fa-plus-square clickable" aria-hidden="true"></i>}
                            {!this.state.collapseState['events'] && <i title={T.translate("dashboard.collapse")} onClick={() => this.onCollapseChange('events')} className="fa fa-minus-square clickable" aria-hidden="true"></i>}
                        </h4>
                        {!this.state.collapseState['events'] &&
                            <div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <i className="fa fa-users"/>&nbsp;{T.translate("general.speakers")}&nbsp;
                                        <strong>{currentSummit.speakers_count}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <i className="fa fa-calendar-plus-o"/>&nbsp;{T.translate("dashboard.submitted_events")}&nbsp;
                                        <strong>{currentSummit.presentations_submitted_count}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <i className="fa fa-calendar-check-o"/>&nbsp;{T.translate("dashboard.published_events")}&nbsp;
                                        <strong>{currentSummit.published_events_count}</strong>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <i className="fa fa-building"/>&nbsp;{T.translate("dashboard.venues")}&nbsp;
                                        <strong>{currentSummit.locations.filter(l => l.class_name === 'SummitVenue').length}</strong>
                                    </div>
                                </div>
                            </div>
                        }
                        <hr/>
                        <h4>{T.translate("dashboard.voting")}&nbsp;
                            {this.state.collapseState['voting'] && <i title={T.translate("dashboard.expand")} onClick={() => this.onCollapseChange('voting')} className="fa fa-plus-square clickable" aria-hidden="true"></i>}
                            {!this.state.collapseState['voting'] && <i title={T.translate("dashboard.collapse")} onClick={() => this.onCollapseChange('voting')} className="fa fa-minus-square clickable" aria-hidden="true"></i>}
                        </h4>
                        {!this.state.collapseState['voting'] &&
                        <div>
                            <div className="row">
                                <div className="col-md-6">
                                    <i className="fa fa-users"/>&nbsp;{T.translate("dashboard.voters")}&nbsp;
                                    <strong>{currentSummit.presentation_voters_count}</strong>
                                </div>
                                <div className="col-md-6">
                                    <i className="fa fa fa-thumbs-o-up"/>&nbsp;{T.translate("dashboard.votes")}&nbsp;
                                    <strong>{currentSummit.presentation_votes_count}</strong>
                                </div>
                            </div>
                        </div>
                        }
                        <hr/>
                        <h4>{T.translate("dashboard.emails")}&nbsp;
                            {this.state.collapseState['emails'] && <i title={T.translate("dashboard.expand")} onClick={() => this.onCollapseChange('emails')} className="fa fa-plus-square clickable" aria-hidden="true"></i>}
                            {!this.state.collapseState['emails'] && <i title={T.translate("dashboard.collapse")} onClick={() => this.onCollapseChange('emails')} className="fa fa-minus-square clickable" aria-hidden="true"></i>}
                        </h4>
                        {!this.state.collapseState['emails'] &&
                            <div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <i className="fa fa-paper-plane"/>&nbsp;{T.translate("dashboard.accepted")}&nbsp;
                                        <strong>{currentSummit.speaker_announcement_email_accepted_count}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <i className="fa fa-paper-plane"/>&nbsp;{T.translate("dashboard.rejected")}&nbsp;
                                        <strong>{currentSummit.speaker_announcement_email_rejected_count}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <i className="fa fa-paper-plane"/>&nbsp;{T.translate("dashboard.alternate")}&nbsp;
                                        <strong>{currentSummit.speaker_announcement_email_alternate_count}</strong>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4">
                                        <i className="fa fa-paper-plane"/>&nbsp;{T.translate("dashboard.accepted_alternate")}&nbsp;
                                        <strong>{currentSummit.speaker_announcement_email_accepted_alternate_count}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <i className="fa fa-paper-plane"/>&nbsp;{T.translate("dashboard.accepted_rejected")}&nbsp;
                                        <strong>{currentSummit.speaker_announcement_email_accepted_rejected_count}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <i className="fa fa-paper-plane"/>&nbsp;{T.translate("dashboard.alternate_rejected")}&nbsp;
                                        <strong>{currentSummit.speaker_announcement_email_alternate_rejected_count}</strong>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ currentSummitState, loggedUserState }) => ({
    currentSummit : currentSummitState.currentSummit,
    member: loggedUserState.member
})

export default connect (
    mapStateToProps,
    {
        getSummitById
    }
)(SummitDashboardPage);
