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
import {trim} from "../../utils/methods";
import {Breadcrumb} from "react-breadcrumbs";
import DateIntervalFilter from "../../components/filters/date-interval-filter";
import {getRegistrationStats} from "../../actions/summit-stats-actions";
import Graph from "../../components/graphs/registration";

const DATA_POOLING_INTERVAL = 5000;

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

  const totalTickets = summitStats.total_active_tickets + summitStats.total_inactive_tickets;

  const totalTicketsAvailable = summitStats.total_tickets_per_type.reduce((res, it) => res + parseInt(it.available_qty), 0);

  const totalTicketsSold = summitStats.total_tickets_per_type.reduce((res, it) => res + parseInt(it.sold_qty), 0);

  const totalTicketsCheckedIn = summitStats.total_tickets_per_type.reduce((res, it) => res + parseInt(it.checkin_qty), 0);

  const sortedTicketTypes = summitStats.total_tickets_per_type.sort((a, b) => b.sold_qty - a.sold_qty);

  const totalTicketsSoldWBadgeFeature = summitStats.total_tickets_per_badge_feature.reduce((res, it) => res + parseInt(it.sold_qty), 0);

  const totalTicketsCheckedInWBadgeFeature = summitStats.total_tickets_per_badge_feature.reduce((res, it) => res + parseInt(it.checkin_qty), 0);

  const sortedTicketsPerBadgeFeature = summitStats.total_tickets_per_badge_feature.sort((a, b) => b.sold_qty - a.sold_qty);

  const totalRealAttendees = summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees;

  const totalVirtualAttendees = summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees;

  const totalAttendees = totalRealAttendees + totalVirtualAttendees;

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

        {/* Tickets sold / unsold */}
        {totalTickets > 0 &&
        <Graph
          title={T.translate("dashboard.orders")}
          subtitle={[`Total orders: ${summitStats.total_orders}`, `Total tickets: ${totalTickets}`]}
          data={[
            {value: summitStats.total_active_tickets, total: totalTickets},
            {value: summitStats.total_inactive_tickets, total: totalTickets}
          ]}
          labels={[
            `Actives : ${summitStats.total_active_tickets} / ${totalTickets}`,
            `Inactives : ${summitStats.total_inactive_tickets} / ${totalTickets}`,
          ]}
          colors={[
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ]}
        />
        }

        {/* Tickets sold per ticket type, badge type and badge features */}
        {totalTicketsAvailable > 0 &&
        <>
          <Graph
            title="Active tickets sold per ticket type"
            subtitle={[`Tickets sold: ${totalTicketsSold}`, `Tickets available: ${totalTicketsAvailable}`]}
            legendTitle="Sold / Available per ticket type"
            data={sortedTicketTypes.map(tt => ({
              value: parseInt(tt.sold_qty),
              divider: parseInt(tt.available_qty),
              total: totalTicketsSold,
              label: `${trimString(tt.type)} : ${tt.sold_qty} / ${tt.available_qty}`
            }))}
            labels={sortedTicketTypes.map(tt => {
              const percent = Math.round(tt.sold_qty / totalTicketsSold * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={0}
          />
          <Graph
            title="Active tickets sold per badge type"
            subtitle={[`Tickets sold: ${totalTicketsSold}`, `Tickets available: ${totalTicketsAvailable}`]}
            legendTitle="Sold / Available per badge type"
            data={sortedTicketTypes.map(tt => ({
              value: parseInt(tt.sold_qty),
              divider: parseInt(tt.available_qty),
              total: totalTicketsAvailable,
              label: `${trimString(tt.badge_type)} : ${tt.sold_qty} / ${tt.available_qty}`
            }))}
            labels={sortedTicketTypes.map(tt => {
              const percent = Math.round(tt.sold_qty / totalTicketsAvailable * 100);
              return `${trimString(tt.badge_type)}: ${percent}%`
            })}
            colorPalette={1}
          />
          <Graph
            title="Active tickets sold per badge feature"
            subtitle={[`Tickets sold with badge features applied: ${totalTicketsSoldWBadgeFeature}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Tickets sold w/ badge features / Tickets sold"
            data={sortedTicketsPerBadgeFeature.map(tt => ({
              value: parseInt(tt.sold_qty),
              divider: parseInt(totalTicketsSoldWBadgeFeature),
              total: totalTicketsSoldWBadgeFeature,
              label: `${trimString(tt.type)} : ${tt.sold_qty} / ${totalTicketsSoldWBadgeFeature}`
            }))}
            labels={sortedTicketsPerBadgeFeature.map(tt => {
              const percent = Math.round(tt.sold_qty / totalTicketsSoldWBadgeFeature * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={2}
          />
        </>
        }

        {/* Check Ins per ticket type, badge type and badge feature */}
        {totalAttendees > 0 &&
        <>
          <Graph
            title="Checked in per ticket type"
            subtitle={[`Tickets checked in: ${totalTicketsCheckedIn}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Checked in / Sold per ticket type"
            data={sortedTicketTypes.map(tt => ({
              value: parseInt(tt.checkin_qty),
              divider: parseInt(tt.sold_qty),
              total: totalTicketsCheckedIn,
              label: `${trimString(tt.type)} : ${tt.checkin_qty} / ${tt.sold_qty}`
            }))}
            labels={sortedTicketTypes.map(tt => {
              const percent = Math.round(tt.checkin_qty / totalTicketsCheckedIn * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={3}
          />
          <Graph
            title="Checked in per badge type"
            subtitle={[`Tickets checked in: ${totalTicketsCheckedIn}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Checked in / Sold per badge type"
            data={sortedTicketTypes.map(tt => ({
              value: parseInt(tt.checkin_qty),
              divider: parseInt(tt.sold_qty),
              total: totalTicketsCheckedIn,
              label: `${trimString(tt.badge_type)} : ${tt.checkin_qty} / ${tt.sold_qty}`
            }))}
            labels={sortedTicketTypes.map(tt => {
              const percent = Math.round(tt.checkin_qty / totalTicketsCheckedIn * 100);
              return `${trimString(tt.badge_type)}: ${percent}%`
            })}
            colorPalette={4}
          />
          <Graph
            title="Checked in per badge feature"
            subtitle={[`Tickets checked in with badge features applied: ${totalTicketsCheckedInWBadgeFeature}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Tickets checked in w/ badge features / Tickets checked in"
            data={sortedTicketsPerBadgeFeature.map(tt => ({
              value: parseInt(tt.checkin_qty),
              divider: parseInt(totalTicketsCheckedInWBadgeFeature),
              total: totalTicketsCheckedInWBadgeFeature,
              label: `${trimString(tt.type)} : ${tt.checkin_qty} / ${totalTicketsCheckedInWBadgeFeature}`
            }))}
            labels={sortedTicketsPerBadgeFeature.map(tt => {
              const percent = Math.round(tt.checkin_qty / totalTicketsCheckedInWBadgeFeature * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={5}
          />
        </>
        }

        {/* Check Ins per Virtual / In Person */}
        {totalAttendees > 0 &&
        <>
          <Graph
            title={<>
              <i className="fa fa-users"/>
              &nbsp;
              {T.translate("dashboard.in_person_attendees")} ({summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees})
            </>}
            data={[
              {value: summitStats.total_checked_in_attendees, total: totalRealAttendees},
              {value: summitStats.total_non_checked_in_attendees, total: totalRealAttendees},
            ]}
            labels={[
              `Checked In : ${summitStats.total_checked_in_attendees} / ${totalRealAttendees}`,
              `Non Checked In: ${summitStats.total_non_checked_in_attendees} / ${totalRealAttendees}`,
            ]}
            colors={[
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
            ]}
          />
          <Graph
            title={<>
              <i className="fa fa-users"/>
              &nbsp;
              {T.translate("dashboard.virtual_attendees")} ({summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees})
            </>}
            data={[
              {value: summitStats.total_virtual_attendees, total: totalVirtualAttendees},
              {value: summitStats.total_virtual_non_checked_in_attendees, total: totalVirtualAttendees},
            ]}
            labels={[
              `Virtual Check In ${summitStats.total_virtual_attendees} / ${totalVirtualAttendees}`,
              `Non Virtual Checked In: ${summitStats.total_virtual_non_checked_in_attendees} / ${totalVirtualAttendees}`,
            ]}
            colors={[
              'rgba(255, 159, 64, 1)',
              'rgba(255, 99, 132, 1)',
            ]}
          />

        </>
        }

        {/*{summitStats.total_tickets_per_badge_feature.some(t => t.tickets_qty > 0) &&
        <Graph
          title={T.translate("dashboard.badge_features_tickets")}
          data={}
          labels={}
        />
        }*/}


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
