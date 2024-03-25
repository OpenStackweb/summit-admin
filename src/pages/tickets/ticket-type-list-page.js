/**
 * Copyright 2018 OpenStack Foundation
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

import React, {useEffect} from 'react'
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {ActionDropdown, Dropdown, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicketTypes, deleteTicketType, seedTicketTypes, changeTicketTypesCurrency } from "../../actions/ticket-actions";
import {Pagination} from "react-bootstrap";

const TicketTypeListPage = ({ ticketTypes, currentSummit, order , orderDir, currentPage, perPage, lastPage, audienceFilter, totalTicketTypes, ...props }) => {

    useEffect(() => {
        if (currentSummit) {
            props.getTicketTypes(currentSummit, order, orderDir, currentPage, perPage, {audienceFilter});
        }
    }, [currentSummit?.id]);


    const handlePageChange = (page) => {
        props.getTicketTypes(currentSummit, order, orderDir, page, perPage, {audienceFilter});
    }

    const handleEdit = (ticket_type_id) => {
        props.history.push(`/app/summits/${currentSummit.id}/ticket-types/${ticket_type_id}`);
    }

    const handleSeedTickets = (ev) => {
        ev.preventDefault();
        props.seedTicketTypes();
    }

    const handleChangeAudienceFilter = (ev) => {
        const { value: newAudienceFilter } = ev.target;
        props.getTicketTypes(currentSummit, order, orderDir, currentPage, perPage, {audienceFilter: newAudienceFilter});
    }

    const handleDelete = (ticketTypeId) => {
        let ticketType = ticketTypes.find(t => t.id === ticketTypeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("ticket_type_list.remove_warning") + ' ' + ticketType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                props.deleteTicketType(ticketTypeId);
            }
        });
    }

    const handleSort = (index, key, dir, func) => {
        props.getTicketTypes(currentSummit, key, dir, currentPage, perPage, {audienceFilter});
    }

    const handleNewTicketType = (ev) => {
        props.history.push(`/app/summits/${currentSummit.id}/ticket-types/new`);
    }

    const handleChangeCurrency = (currency) => {

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("ticket_type_list.change_currency_warning") + ' ' + currency,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: T.translate("ticket_type_list.yes_change")
        }).then(function(result){
            if (result.value) {
                props.changeTicketTypesCurrency(currency);
            }
        });
    }

    const columns = [
        { columnKey: 'id', value: T.translate("ticket_type_list.id"), sortable: true },
        { columnKey: 'name', value: T.translate("ticket_type_list.name"), sortable: true },
        { columnKey: 'audience', value: T.translate("ticket_type_list.audience"), sortable: true },
        { columnKey: 'badge_type_name', value: T.translate("ticket_type_list.badge_type_name") },
        { columnKey: 'external_id', value: T.translate("ticket_type_list.external_id") }
    ];

    const table_options = {
        sortCol: order,
        sortDir: orderDir,
        actions: {
            edit: { onClick: handleEdit },
            delete: { onClick: handleDelete }
        }
    }

    const audienceDDL = [
        { label: 'All', value: 'All' },
        { label: 'With Invitation', value: 'WithInvitation' },
        { label: 'Without Invitation', value: 'WithoutInvitation' },
    ];

    const currencyOptions = currentSummit.supported_currencies.map(c => ({value: c, label: c}));
    const defaultCurrency = currentSummit.default_ticket_type_currency || ticketTypes?.[0]?.currency || 'USD';

    if (!currentSummit.id) return (<div />);

    return(
        <div className="container">
            <h3> {T.translate("ticket_type_list.ticket_type_list")} ({totalTicketTypes})</h3>
            <div className={'row'}>
                <div className="col-md-4">
                    <Dropdown
                      id="audienceFilter"
                      value={audienceFilter}
                      onChange={handleChangeAudienceFilter}
                      options={audienceDDL}
                      isClearable={true}
                      placeholder={"Filter By Audience"}
                      isMulti
                    />
                </div>
                <div className="col-md-8 text-right">
                    {ticketTypes?.length > 0 && 
                    <span className="right-space">
                        <ActionDropdown
                          value={{value: defaultCurrency, label: defaultCurrency}}
                          options={currencyOptions}
                          actionLabel={T.translate("ticket_type_list.apply")}
                          placeholder={T.translate("ticket_type_list.placeholders.select_currency")}
                          onClick={handleChangeCurrency}
                        />
                    </span>
                    }
                    <button className="btn btn-primary right-space" onClick={handleNewTicketType}>
                        {T.translate("ticket_type_list.add_ticket_type")}
                    </button>
                    { currentSummit.external_registration_feed_type == 'Eventbrite' &&
                        <button className="btn btn-default" onClick={handleSeedTickets}>
                            {T.translate("ticket_type_list.seed_tickets")}
                        </button>
                    }
                </div>
            </div>

            {ticketTypes.length === 0 &&
            <div>{T.translate("ticket_type_list.no_ticket_types")}</div>
            }

            {ticketTypes.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={ticketTypes}
                        columns={columns}
                        onSort={handleSort}
                    />
                    <Pagination
                    bsSize="medium"
                    prev
                    next
                    first
                    last
                    ellipsis
                    boundaryLinks
                    maxButtons={10}
                    items={lastPage}
                    activePage={currentPage}
                    onSelect={handlePageChange}
                    />
                </div>
            }

        </div>
    )
}

const mapStateToProps = ({ currentSummitState, currentTicketTypeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentTicketTypeListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTicketTypes,
        deleteTicketType,
        seedTicketTypes,
        changeTicketTypesCurrency
    }
)(TicketTypeListPage);
