/**
 * Copyright 2019 OpenStack Foundation
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

import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux';
import T from "i18n-react";
import {Pie} from "react-chartjs-2";
import {Chart} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {trim} from "../../utils/methods";
import {Breadcrumb} from "react-breadcrumbs";
import DateIntervalFilter from "../../components/filters/date-interval-filter";
import {getRegistrationStats} from "../../actions/summit-stats-actions";

const RegistrationStatsPage = ({currentSummit, summitStats, match, getRegistrationStats}) => {
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    Chart.register(ChartDataLabels);
    setChartLoaded(true);
  }, []);

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      tooltip:{
        callbacks: {
          label: (context) => {
            return context.label || '';
          }
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        maxWidth: 100,
        align: 'start',
      },
      datalabels: {
        formatter: (value, ctx) => {
          let datasets = ctx.chart.data.datasets;
          if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
            let sum = datasets[0].data.reduce((a, b) => a + b, 0);
            if(!sum) return '0%';
            return Math.round((value / sum) * 100) + '%';
          }
          return '';
        },
        color: '#FFFFFF',
      }
    },
  };

  const dataTicketTypes = {
    labels: summitStats.total_tickets_per_type.map(tt => `${trim(tt.type , 75)} : ${parseInt(tt.qty)}`),
      datasets: [
      {
        label: 'Ticket Types',
        data: summitStats.total_tickets_per_type.map(tt => parseInt(tt.qty)),
        borderWidth: 1,
        backgroundColor: summitStats.total_tickets_per_type.map(tt => {
          let r = Math.floor(Math.random() * 200);
          let g = Math.floor(Math.random() * 200);
          let b = Math.floor(Math.random() * 200);
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        })
      },
    ],
  };

  const dataTickets = {
    labels: [
      `Actives : ${summitStats.total_active_tickets}`,
      `Inactives : ${summitStats.total_inactive_tickets}`,
    ],
      datasets: [
      {
        label: '# of Tickets',
        data: [
          summitStats.total_active_tickets,
          summitStats.total_inactive_tickets
        ],
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
  };

  const totalTicketTypes = summitStats.total_tickets_per_type.reduce(function(accumulator, currentValue) {
    return accumulator + parseInt(currentValue.qty);
  }, 0);

  const dataBadgeTypes = {
    labels: summitStats.total_badges_per_type.map(tt => `${trim(tt.type, 75)} : ${parseInt(tt.qty)}`),
      datasets: [
      {
        label: 'Badge Types',
        data: summitStats.total_badges_per_type.map(tt => parseInt(tt.qty)),
        borderWidth: 1,
        backgroundColor: summitStats.total_badges_per_type.map(tt => {
          let r = Math.floor(Math.random() * 200);
          let g = Math.floor(Math.random() * 200);
          let b = Math.floor(Math.random() * 200);
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        })
      },
    ],
  };
  
  const totalBadgeTypes = summitStats.total_badges_per_type.reduce(function(accumulator, currentValue) {
    return accumulator + parseInt(currentValue.qty);
  }, 0);

  const dataAttendees = {
    labels: [`Checked In : ${summitStats.total_checked_in_attendees}`,
      `Non Checked In: ${summitStats.total_non_checked_in_attendees}`,
    ],
      datasets: [
      {
        label: 'Attendees',
        data: [
          summitStats.total_checked_in_attendees,
          summitStats.total_non_checked_in_attendees,
        ],
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
  };
  
  const dataVirtualAttendees = {
    labels: [
      `Virtual Check In ${summitStats.total_virtual_attendees}`,
      `Non Virtual Checked In: ${(summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees) - summitStats.total_virtual_attendees}`,
    ],
      datasets: [
      {
        label: 'Attendees',
        data: [
          summitStats.total_virtual_attendees,
          (summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees) - summitStats.total_virtual_attendees,
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const dataTicketsPerBadgeFeatures = {
    labels: summitStats.total_tickets_per_badge_feature.map(tt => `${tt.type} : ${parseInt(tt.tickets_qty)}`),
      datasets: [
      {
        label: 'Badge Features1',
        data: summitStats.total_tickets_per_badge_feature.map(tt => parseInt(tt.tickets_qty)),
        borderWidth: 1,
        backgroundColor: summitStats.total_tickets_per_badge_feature.map(tt => {
          let r = Math.floor(Math.random() * 200);
          let g = Math.floor(Math.random() * 200);
          let b = Math.floor(Math.random() * 200);
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        })
      },
    ],
  };
  
  const dataCheckinsPerBadgeFeatures = {
    labels: summitStats.total_tickets_per_badge_feature.map(tt => `${tt.type} : ${parseInt(tt.checkin_qty)}`),
      datasets: [
      {
        label: 'Badge Features1',
        data: summitStats.total_tickets_per_badge_feature.map(tt => parseInt(tt.checkin_qty)),
        borderWidth: 1,
        backgroundColor: summitStats.total_tickets_per_badge_feature.map(tt => {
          let r = Math.floor(Math.random() * 200);
          let g = Math.floor(Math.random() * 200);
          let b = Math.floor(Math.random() * 200);
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        })
      },
    ],
  };

  if (!chartLoaded) return null;

  return (
    <div className="container">
      <Breadcrumb data={{ title: T.translate("dashboard.registration_stats"), pathname: match.url }} />
      <div className="filters">
        <DateIntervalFilter onFilter={getRegistrationStats} timezone={currentSummit.time_zone_id} />
      </div>
      <div>
        <div className="row">
          <div className="col-md-6">
            <i className="fa fa-money"/>&nbsp;{T.translate("dashboard.payment_amount_collected")}&nbsp;
            <strong>$&nbsp;{parseFloat(summitStats.total_payment_amount_collected).toFixed(2)}</strong>
          </div>
          <div className="col-md-6">
            {T.translate("dashboard.refund_amount_emitted")}&nbsp;
            <strong>$&nbsp;{parseFloat(summitStats.total_refund_amount_emitted).toFixed(2)}</strong>
          </div>
        </div>
        {(summitStats.total_active_tickets + summitStats.total_inactive_tickets) > 0 &&
        <>
          <h5><i
            className="fa fa-ticket"/>&nbsp;{T.translate("dashboard.total_tickets")} ({summitStats.total_active_tickets + summitStats.total_inactive_tickets})
            / {T.translate("dashboard.orders")} ({summitStats.total_orders})</h5>
          <div className="row">
            <div className="col-md-12">
              <Pie data={dataTickets}
                   width={325}
                   height={325}
                   options={chartOptions}
              />
            </div>
          </div>
        </>
        }
        {totalTicketTypes > 0 &&
        <div className="row">
          <div className="col-md-6">
            <h5>{T.translate("dashboard.ticket_types")} ({totalTicketTypes})</h5>
            <div className="row">
              <div className="col-md-12">
                <Pie data={dataTicketTypes}
                     width={325}
                     height={325}
                     options={chartOptions}
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <h5>{T.translate("dashboard.badge_types")} ({totalBadgeTypes})</h5>
            <div className="row">
              <div className="col-md-12">
                <Pie data={dataBadgeTypes}
                     width={325}
                     height={325}
                     options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>
        }
        { summitStats.total_tickets_per_badge_feature.some(t => t.tickets_qty > 0) &&
        <div className="row">
          <div className="col-md-6">
            <h5>{T.translate("dashboard.badge_features_tickets")}</h5>
            <div className="row">
              <div className="col-md-12">
                <Pie data={dataTicketsPerBadgeFeatures}
                     width={325}
                     height={325}
                     options={chartOptions}
                />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <h5>{T.translate("dashboard.badge_features_checkins")}</h5>
            <div className="row">
              <div className="col-md-12">
                <Pie data={dataCheckinsPerBadgeFeatures}
                     width={325}
                     height={325}
                     options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>
        }
        {(summitStats.total_checked_in_attendees +
          summitStats.total_non_checked_in_attendees +
          summitStats.total_virtual_attendees) > 0 &&
        <>
          <h5>
            <i className="fa fa-users" />
            &nbsp;
            {T.translate("dashboard.attendees")} ({summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees})
          </h5>
          <div className="row">
            <div className="col-md-6">
              <Pie data={dataAttendees}
                   width={325}
                   height={325}
                   options={chartOptions}
              />
            </div>
            <div className="col-md-6">
              <Pie data={dataVirtualAttendees}
                   width={325}
                   height={325}
                   options={chartOptions}
              />
            </div>
          </div>
        </>
        }
      </div>
    </div>
  );
}

const mapStateToProps = ({currentSummitState, summitStatsState}) => ({
  currentSummit: currentSummitState.currentSummit,
  summitStats: summitStatsState
})

export default connect(
  mapStateToProps,
  {getRegistrationStats}
)(RegistrationStatsPage);
