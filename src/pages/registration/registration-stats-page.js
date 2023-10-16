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

import React, {useEffect, useState} from 'react'
import {connect} from 'react-redux';
import T from "i18n-react";
import {trim} from "../../utils/methods";
import {formatCurrency} from "../../helpers/formatCurrency";
import {Breadcrumb} from "react-breadcrumbs";
import DateIntervalFilter from "../../components/filters/date-interval-filter";
import {getRegistrationData, changeTimeUnit} from "../../actions/summit-stats-actions";
import PieGraph from "../../components/graphs/registration-pie-graph";
import {AjaxLoader, SteppedSelect} from "openstack-uicore-foundation/lib/components";
import LineGraph from "../../components/graphs/registration-line-graph";

const DATA_POOLING_INTERVAL = 20000;

const trimString = (str, length = 75) => {
  return trim(str.replace(/ *\([^)]*\) */g, ""), length)
};

const RegistrationStatsPage = ({currentSummit, match, loading, ...props}) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const timeOptions = [ 'Minute','Hour','Day'].map(op => ({value: op, label: op}));

  useEffect(() => {
    // initial load
    if (!props.loadingData) {
      props.getRegistrationData(fromDate, toDate);
    }

    // pooling
    const interval = setInterval(() => {
      props.getRegistrationData(fromDate, toDate, false);
    }, DATA_POOLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fromDate, toDate]);

  const totalTickets = props.total_active_tickets + props.total_inactive_tickets;

  const totalTicketsSold = props.total_active_tickets;

  const totalTicketsAvailable = props.total_tickets_per_type.reduce((res, it) => res + parseInt(it.available_qty), 0);

  const hasInfiniteTicketsAvailable = props.total_tickets_per_type.some(it => it.available_qty === 0);

  const totalTicketsCheckedIn = props.total_tickets_per_type.reduce((res, it) => res + parseInt(it.checkin_qty), 0);

  const sortedTicketTypes = props.total_tickets_per_type.sort((a, b) => b.sold_qty - a.sold_qty);

  const sortedTicketPerBadgeTypes = props.total_badges_per_type.sort((a, b) => b.badges_qty - a.badges_qty);

  const totalTicketsWBadgeType = props.total_badges_per_type.reduce((res, it) => res + parseInt(it.badges_qty), 0);

  const totalTicketsSoldWBadgeFeature = props.total_tickets_per_badge_feature.reduce((res, it) => res + parseInt(it.sold_qty), 0);

  const totalTicketsCheckedInWBadgeFeature = props.total_tickets_per_badge_feature.reduce((res, it) => res + parseInt(it.checkin_qty), 0);

  const sortedTicketsPerBadgeFeature = props.total_tickets_per_badge_feature.sort((a, b) => b.sold_qty - a.sold_qty);

  const totalRealAttendees = props.total_checked_in_attendees + props.total_non_checked_in_attendees;

  const totalVirtualAttendees = props.total_virtual_attendees + props.total_virtual_non_checked_in_attendees;

  const totalAttendees = totalRealAttendees + totalVirtualAttendees;
  
  const onFilterDate = (from, to) => {
    setFromDate(from);
    setToDate(to);
    props.getRegistrationData(from, to);
  };
  
  const onUnitChange = (unit, collection) => {
    props.changeTimeUnit(unit, fromDate, toDate, collection);
  };

  return (
    <div className="container">
      <Breadcrumb data={{title: T.translate("dashboard.registration_stats"), pathname: match.url}}/>
      <div className="filters">
        <DateIntervalFilter onFilter={onFilterDate} timezone={currentSummit.time_zone_id}/>
      </div>
      <div>
        <div className="row">
          <div className="col-md-4">
            <i className="fa fa-money"/>&nbsp;{T.translate("dashboard.payment_amount_collected")}&nbsp;
            <strong>{formatCurrency(props.total_payment_amount_collected, { locale: 'en-US'})}</strong>
          </div>
          <div className="col-md-4">
            {T.translate("dashboard.refund_amount_emitted")}&nbsp;
            <strong>{formatCurrency(props.total_refund_amount_emitted, { locale: 'en-US'})}</strong>
          </div>
          <div className="col-md-4">
            <i className="fa fa-money"/>&nbsp;{T.translate("dashboard.payment_net_amount_collected")}&nbsp;
            <strong>{formatCurrency(parseFloat(props.total_payment_amount_collected) - parseFloat(props.total_refund_amount_emitted), { locale: 'en-US'})}</strong>
          </div>
        </div>

        {/* Tickets sold / unsold */}
        {totalTickets > 0 &&
        <PieGraph
          title={T.translate("dashboard.orders")}
          subtitle={[`Total orders: ${props.total_orders}`, `Total tickets: ${totalTickets}`]}
          data={[
            {value: totalTicketsSold, total: totalTickets},
            {value: props.total_inactive_tickets, total: totalTickets}
          ]}
          labels={[
            `Actives : ${totalTicketsSold} / ${totalTickets}`,
            `Inactives : ${props.total_inactive_tickets} / ${totalTickets}`,
          ]}
          colors={[
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ]}
        />
        }

        {/* Tickets sold per ticket type, badge type and badge features */}
        {(totalTicketsAvailable > 0 || hasInfiniteTicketsAvailable) &&
          <PieGraph
            title="Active tickets sold per ticket type"
            subtitle={[`Tickets sold: ${totalTicketsSold}`, `Tickets available: ${hasInfiniteTicketsAvailable ? '∞' : totalTicketsAvailable}`]}
            legendTitle="Sold / Available per ticket type"
            data={sortedTicketTypes.map(tt => ({
              value: parseInt(tt.sold_qty),
              divider: parseInt(tt.available_qty || tt.sold_qty),
              label: `${trimString(tt.type)} : ${tt.sold_qty} / ${tt.available_qty || '∞'}`
            }))}
            labels={sortedTicketTypes.map(tt => {
              const percent = Math.round(tt.sold_qty / totalTicketsSold * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={0}
          />
          }
        {totalTicketsSold > 0 &&
          <PieGraph
            title="Active tickets sold per badge type"
            subtitle={[`Tickets w/ Badge type: ${totalTicketsWBadgeType}`, `Tickets active: ${totalTicketsSold}`]}
            legendTitle="Sold / Active per badge type"
            data={sortedTicketPerBadgeTypes.map(tt => ({
              value: parseInt(tt.badges_qty),
              divider: parseInt(totalTicketsSold),
              label: `${trimString(tt.type)} : ${tt.badges_qty} / ${totalTicketsSold}`
            }))}
            labels={sortedTicketPerBadgeTypes.map(tt => {
              const percent = Math.round(tt.badges_qty / totalTicketsSold * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={1}
          />
        }
        {totalTicketsSold > 0 &&
          <PieGraph
            title="Active tickets sold per badge feature"
            subtitle={[`Tickets sold with badge features applied: ${totalTicketsSoldWBadgeFeature}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Tickets sold w/ badge features / Tickets sold"
            data={sortedTicketsPerBadgeFeature.map(tt => ({
              value: parseInt(tt.sold_qty),
              divider: parseInt(totalTicketsSoldWBadgeFeature),
              label: `${trimString(tt.type)} : ${tt.sold_qty} / ${totalTicketsSoldWBadgeFeature}`
            }))}
            labels={sortedTicketsPerBadgeFeature.map(tt => {
              const percent = Math.round(tt.sold_qty / totalTicketsSoldWBadgeFeature * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={2}
          />
        }

        {/* Check Ins per ticket type, badge type and badge feature */}
        {totalAttendees > 0 &&
        <>
          <PieGraph
            title="Checked in per ticket type"
            subtitle={[`Tickets checked in: ${totalTicketsCheckedIn}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Checked in / Sold per ticket type"
            data={sortedTicketTypes.map(tt => ({
              value: parseInt(tt.checkin_qty),
              divider: parseInt(tt.sold_qty),
              label: `${trimString(tt.type)} : ${tt.checkin_qty} / ${tt.sold_qty}`
            }))}
            labels={sortedTicketTypes.map(tt => {
              const percent = Math.round(tt.checkin_qty / totalTicketsCheckedIn * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={3}
          />
          <PieGraph
            title="Checked in per badge type"
            subtitle={[`Tickets checked in: ${totalTicketsCheckedIn}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Checked in / Sold per badge type"
            data={sortedTicketPerBadgeTypes.map(tt => ({
              value: parseInt(tt.checkin_qty),
              divider: parseInt(tt.badges_qty),
              label: `${trimString(tt.type)} : ${tt.checkin_qty} / ${tt.badges_qty}`
            }))}
            labels={sortedTicketPerBadgeTypes.map(tt => {
              const percent = Math.round(tt.checkin_qty / totalTicketsCheckedIn * 100);
              return `${trimString(tt.type)}: ${percent}%`
            })}
            colorPalette={4}
          />
          <PieGraph
            title="Checked in per badge feature"
            subtitle={[`Tickets checked in with badge features applied: ${totalTicketsCheckedInWBadgeFeature}`, `Tickets sold: ${totalTicketsSold}`]}
            legendTitle="Tickets checked in / Tickets sold, per badge feature"
            data={sortedTicketsPerBadgeFeature.map(tt => ({
              value: parseInt(tt.checkin_qty),
              divider: parseInt(tt.sold_qty),
              label: `${trimString(tt.type)} : ${tt.checkin_qty} / ${tt.sold_qty}`
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
        {totalRealAttendees > 0 &&
        <PieGraph
          title={<>
            <i className="fa fa-users"/>
            &nbsp;
            {T.translate("dashboard.in_person_attendees")} ({props.total_checked_in_attendees + props.total_non_checked_in_attendees})
          </>}
          data={[
            {value: props.total_checked_in_attendees, total: totalRealAttendees},
            {value: props.total_non_checked_in_attendees, total: totalRealAttendees},
          ]}
          labels={[
            `Checked In : ${props.total_checked_in_attendees} / ${totalRealAttendees}`,
            `Non Checked In: ${props.total_non_checked_in_attendees} / ${totalRealAttendees}`,
          ]}
          colors={[
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ]}
        />
        }
        {totalVirtualAttendees > 0 &&
        <PieGraph
          title={<>
            <i className="fa fa-users"/>
            &nbsp;
            {T.translate("dashboard.virtual_attendees")} ({props.total_virtual_attendees + props.total_virtual_non_checked_in_attendees})
          </>}
          data={[
            {value: props.total_virtual_attendees, total: totalVirtualAttendees},
            {value: props.total_virtual_non_checked_in_attendees, total: totalVirtualAttendees},
          ]}
          labels={[
            `Virtual Check In ${props.total_virtual_attendees} / ${totalVirtualAttendees}`,
            `Non Virtual Checked In: ${props.total_virtual_non_checked_in_attendees} / ${totalVirtualAttendees}`,
          ]}
          colors={[
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
          ]}
        />
        }
  
        <div style={{position: 'relative', minHeight: 400}}>
          <AjaxLoader show={props.loadingData} relative size={ 60 }>
            Loading Attendees
          </AjaxLoader>
          <LineGraph
            title={`Attendees check-ins per ${props.attendeeTimeUnit}`}
            legend="Attendees checked-in"
            data={props.attendee_checkins.map(grp => grp.qty)}
            labels={props.attendee_checkins.map(grp => grp.label)}
            colorPalette={5}
          >
            <SteppedSelect
              value={props.attendeeTimeUnit}
              onChange={val => onUnitChange(val, 'attendees')}
              options={timeOptions}
              style={{display: 'inline-block', marginLeft: 10}}
            />
          </LineGraph>
        </div>

        <div style={{position: 'relative', minHeight: 400}}>
          <AjaxLoader show={props.loadingData} relative size={ 60 }>
            Loading Tickets
          </AjaxLoader>
          <LineGraph
            title={`Tickets purchased per ${props.ticketsTimeUnit}`}
            legend="Tickets purchased"
            data={props.tickets_sold.map(grp => grp.qty)}
            labels={props.tickets_sold.map(grp => grp.label)}
            colorPalette={5}
          >
            <SteppedSelect
              value={props.ticketsTimeUnit}
              onChange={val => onUnitChange(val, 'tickets')}
              options={timeOptions}
              style={{display: 'inline-block', marginLeft: 10}}
            />
          </LineGraph>
        </div>

      </div>
    </div>
  );
}

const mapStateToProps = ({currentSummitState, baseState, summitStatsState}) => ({
  currentSummit: currentSummitState.currentSummit,
  loading : baseState.loading,
  ...summitStatsState
})

export default connect(
  mapStateToProps,
  {getRegistrationData, changeTimeUnit}
)(RegistrationStatsPage);
