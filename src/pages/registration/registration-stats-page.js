/**
 * Copyright 2022 OpenStack Foundation
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

import React, {useEffect, useState, useMemo} from 'react'
import {connect} from 'react-redux';
import T from "i18n-react";
import {Pie} from "react-chartjs-2";
import {Chart} from 'chart.js';
import {trim} from "../../utils/methods";
import {Breadcrumb} from "react-breadcrumbs";
import DateIntervalFilter from "../../components/filters/date-interval-filter";
import {getRegistrationStats} from "../../actions/summit-stats-actions";

const DATA_POOLING_INTERVAL = 5000;

function createDonnutCanvas(arc, percent) {
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');

  newCanvas.width = 100;
  newCanvas.height = 55;

  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${percent}%`, 32, 28);

  ctx.beginPath()
  ctx.fillStyle = arc?.options?.backgroundColor;
  ctx.arc(32, 25, 20, 0, (2 * Math.PI * percent / 100), false); // outer (filled)
  ctx.arc(32, 25, 14, (2 * Math.PI * percent / 100), 0, true); // inner (unfills it)
  ctx.fill();

  ctx.beginPath()
  ctx.arc(32, 25, 20, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.beginPath()
  ctx.arc(32, 25, 14, 0, Math.PI * 2, true);
  ctx.stroke();

  return newCanvas;
};


const trimString = (str, length = 75) => {
  return trim(str.replace(/ *\([^)]*\) */g, ""), length)
};


const RegistrationStatsPage = ({currentSummit, summitStats, match, getRegistrationStats}) => {
  const [chartLoaded, setChartLoaded] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    setChartLoaded(true);
  }, []);

  useEffect(() => {
    // initial load
    getRegistrationStats(fromDate, toDate);

    // pooling
    const interval = setInterval(() => {
      getRegistrationStats(fromDate, toDate, false);
    }, DATA_POOLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fromDate, toDate]);

  const chartOptions = {
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 80,
        left: 80,
        right: 80,
        bottom: 80
      }
    },
    parsing: {
      key: 'value'
    },
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return context.label || '';
          }
        }
      },
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        maxWidth: 400,
        labels: {
          usePointStyle: true,
          font: {size: 12, lineHeight: 2.5},
          padding: 35,
          boxHeight: 50,
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];

            return chart.data.labels.map((label, i) => {
              const dataItem = dataset.data[i];
              const color = dataset.backgroundColor[i];
              const arc = chart.getDatasetMeta(0).data[i];
              let percent = Math.round((dataItem.value / dataItem.total) * 100);

              if (typeof dataItem.portion !== 'undefined') {
                percent = Math.round((dataItem.portion / dataItem.value) * 100);
              }

              return {
                text: dataItem.label || label,
                fillStyle: color,
                fontColor: color,
                strokeStyle: color,
                hidden: chart._hiddenIndices[i],
                index: i,
                pointStyle: createDonnutCanvas(arc, percent),
              };
            }, this);
          }
        }
      }
    }
  };

  const totalTickets = summitStats.total_active_tickets + summitStats.total_inactive_tickets;

  const dataTickets = useMemo(() => (
    {
      labels: [
        `Actives : ${summitStats.total_active_tickets} / ${totalTickets}`,
        `Inactives : ${summitStats.total_inactive_tickets} / ${totalTickets}`,
      ],
      datasets: [
        {
          label: '# of Tickets',
          data: [
            {value: summitStats.total_active_tickets, total: totalTickets},
            {value: summitStats.total_inactive_tickets, total: totalTickets}
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    }
  ), [summitStats.total_active_tickets, summitStats.total_inactive_tickets]);

  const dataTicketTypesBackgroundColor = useMemo(() => summitStats.total_tickets_per_type.map(tt => {
    let r = Math.floor(Math.random() * 200);
    let g = Math.floor(Math.random() * 200);
    let b = Math.floor(Math.random() * 200);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }), [summitStats.total_tickets_per_type?.length]);

  const totalTicketTypes = summitStats.total_tickets_per_type.reduce(function (accumulator, currentValue) {
    return accumulator + parseInt(currentValue.tickets_qty);
  }, 0);

  const sortedTicketTypes = summitStats.total_tickets_per_type.sort((a,b) => b.tickets_qty - a.tickets_qty);

  const dataTicketTypes = useMemo(() => {
    const labels = sortedTicketTypes.map(tt => {
      const percent = Math.round(tt.tickets_qty / totalTicketTypes * 100);
      return `${trimString(tt.type)}: ${percent}%`
    });

    return ({
      labels: labels,
      datasets: [
        {
          label: 'Ticket Types',
          data: sortedTicketTypes.map(tt => ({
            value: parseInt(tt.tickets_qty),
            portion: parseInt(tt.checkin_qty),
            total: totalTicketTypes,
            label: `${trimString(tt.type)} : ${tt.checkin_qty}/ ${tt.tickets_qty}`
          })),
          backgroundColor: dataTicketTypesBackgroundColor,
          borderColor: "#fff",
          borderWidth: 1,
        },
      ]
    })
  }, [summitStats.total_tickets_per_type]);

  const dataBadgeTypesBackgroundColor = useMemo(() => summitStats.total_badges_per_type.map(tt => {
    let r = Math.floor(Math.random() * 200);
    let g = Math.floor(Math.random() * 200);
    let b = Math.floor(Math.random() * 200);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }), [summitStats.total_badges_per_type?.length]);

  const totalBadgeTypes = summitStats.total_badges_per_type.reduce(function (accumulator, currentValue) {
    return accumulator + parseInt(currentValue.badges_qty);
  }, 0);

  const sortedBadgeTypes = summitStats.total_badges_per_type.sort((a,b) => b.badges_qty - a.badges_qty);

  const dataBadgeTypes = useMemo(() => {
    const labels = sortedBadgeTypes.map(tt => {
      const percent = Math.round(tt.badges_qty / totalBadgeTypes * 100);
      return `${trimString(tt.type)}: ${percent}%`
    });

    return ({
      labels: labels,
      datasets: [
        {
          label: 'Badge Types',
          data: sortedBadgeTypes.map(tt => ({
            value: parseInt(tt.badges_qty),
            portion: parseInt(tt.checkin_qty),
            total: totalBadgeTypes,
            label: `${trimString(tt.type)} : ${tt.checkin_qty}/ ${tt.badges_qty}`
          })),
          backgroundColor: dataBadgeTypesBackgroundColor,
          borderColor: "#fff",
          borderWidth: 1,
        },
      ]
    })
  }, [summitStats.total_badges_per_type]);

  const dataTicketsPerBadgeFeaturesBackgroundColor = useMemo(() =>
    summitStats.total_tickets_per_badge_feature.map(tt => {
      let r = Math.floor(Math.random() * 200);
      let g = Math.floor(Math.random() * 200);
      let b = Math.floor(Math.random() * 200);
      return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }), [summitStats.total_tickets_per_badge_feature?.length]);

  const totalTicketsPerBadgeFeature = summitStats.total_tickets_per_badge_feature.reduce(function (accumulator, currentValue) {
    return accumulator + parseInt(currentValue.tickets_qty);
  }, 0);

  const sortedTicketsPerBadgeFeature = summitStats.total_tickets_per_badge_feature.sort((a,b) => b.tickets_qty - a.tickets_qty);

  const dataTicketsPerBadgeFeatures = useMemo(() => {
    const labels = sortedTicketsPerBadgeFeature.map(tt => {
      const percent = Math.round(tt.tickets_qty / totalTicketsPerBadgeFeature * 100);
      return `${trimString(tt.type)}: ${percent}%`
    });

    return ({
      labels: labels,
      datasets: [
        {
          label: 'Badge Features1',
          data: sortedTicketsPerBadgeFeature.map(tt => ({
            value: parseInt(tt.tickets_qty),
            portion: parseInt(tt.checkin_qty),
            total: totalTicketsPerBadgeFeature,
            label: `${trimString(tt.type)} : ${tt.checkin_qty}/ ${tt.tickets_qty}`
          })),
          backgroundColor: dataTicketsPerBadgeFeaturesBackgroundColor,
          borderColor: "#fff",
          borderWidth: 1,
        },
      ]
    })
  }, [summitStats.total_tickets_per_badge_feature]);

  const totalAttendees = summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees;

  const dataAttendees = {
    labels: [
      `Checked In : ${summitStats.total_checked_in_attendees} / ${totalAttendees}`,
      `Non Checked In: ${summitStats.total_non_checked_in_attendees} / ${totalAttendees}`,
    ],
    datasets: [
      {
        label: 'In Person Attendees',
        data: [
          {value: summitStats.total_checked_in_attendees, total: totalAttendees},
          {value: summitStats.total_non_checked_in_attendees, total: totalAttendees},
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ]
  };

  const totalVirtualAttendees = summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees;

  const dataVirtualAttendees = {
    labels: [
      `Virtual Check In ${summitStats.total_virtual_attendees} / ${totalVirtualAttendees}`,
      `Non Virtual Checked In: ${summitStats.total_virtual_non_checked_in_attendees} / ${totalVirtualAttendees}`,
    ],
    datasets: [
      {
        label: 'Virtual Attendees',
        data: [
          {value: summitStats.total_virtual_attendees, total: totalVirtualAttendees},
          {value: summitStats.total_virtual_non_checked_in_attendees, total: totalVirtualAttendees},
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ]
  };

  if (!chartLoaded) return null;

  return (
    <div className="container">
      <Breadcrumb data={{title: T.translate("dashboard.registration_stats"), pathname: match.url}}/>
      <div className="filters">
        <DateIntervalFilter onFilter={(from, to) => {
          setFromDate(from);
          setToDate(to);
          getRegistrationStats(from, to)
        }} timezone={currentSummit.time_zone_id}/>
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
        <div className="graph-wrapper">
          <h5>
            <i className="fa fa-ticket"/>&nbsp;
            {T.translate("dashboard.total_tickets")} ({summitStats.total_active_tickets + summitStats.total_inactive_tickets})
            / {T.translate("dashboard.orders")} ({summitStats.total_orders})
          </h5>

          <div>
            <Pie data={dataTickets}
                 width={600}
                 height={600}
                 options={chartOptions}
            />
          </div>
        </div>
        }

        {totalTicketTypes > 0 &&
        <>
          <div className="graph-wrapper">
            <h5>{T.translate("dashboard.ticket_types")} ({totalTicketTypes})</h5>
            <div>
              <Pie data={dataTicketTypes}
                   width={600}
                   height={600}
                   options={chartOptions}
              />
            </div>
          </div>
          <div className="graph-wrapper">
            <h5>{T.translate("dashboard.badge_types")} ({totalBadgeTypes})</h5>
            <div>
              <Pie data={dataBadgeTypes}
                   width={600}
                   height={600}
                   options={chartOptions}
              />
            </div>
          </div>
        </>
        }

        {summitStats.total_tickets_per_badge_feature.some(t => t.tickets_qty > 0) &&
        <div className="graph-wrapper">
          <h5>{T.translate("dashboard.badge_features_tickets")}</h5>
          <div>
            <Pie data={dataTicketsPerBadgeFeatures}
                 width={600}
                 height={600}
                 options={chartOptions}
            />
          </div>
        </div>
        }

        {(summitStats.total_checked_in_attendees +
          summitStats.total_non_checked_in_attendees +
          summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees) > 0 &&
        <>
          <div className="graph-wrapper">
            <h5>
              <i className="fa fa-users"/>
              &nbsp;
              {T.translate("dashboard.in_person_attendees")} ({summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees})
            </h5>
            <div>
              <Pie data={dataAttendees}
                   width={600}
                   height={600}
                   options={chartOptions}
              />
            </div>
          </div>
          <div className="graph-wrapper">
            <h5>
              <i className="fa fa-users"/>
              &nbsp;
              {T.translate("dashboard.virtual_attendees")} ({summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees})
            </h5>
            <div>
              <Pie data={dataVirtualAttendees}
                   width={600}
                   height={600}
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
