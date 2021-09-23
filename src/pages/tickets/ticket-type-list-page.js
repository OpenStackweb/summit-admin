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

import React from 'react'
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicketTypes, deleteTicketType, seedTicketTypes } from "../../actions/ticket-actions";

class TicketTypeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewTicketType = this.handleNewTicketType.bind(this);
        this.handleSeedTickets = this.handleSeedTickets.bind(this);

        this.state = {}

    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getTicketTypes(currentSummit);
        }
    }

    handleEdit(ticket_type_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/ticket-types/${ticket_type_id}`);
    }

    handleSeedTickets(ev) {
        ev.preventDefault();

        this.props.seedTicketTypes();
    }

    handleDelete(ticketTypeId) {
        const {deleteTicketType, ticketTypes} = this.props;
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
                deleteTicketType(ticketTypeId);
            }
        });
    }

    handleSort(index, key, dir, func) {
        this.props.getTicketTypes(this.props.currentSummit,key, dir);
    }

    handleNewTicketType(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/ticket-types/new`);
    }

    render(){
        const {currentSummit, ticketTypes, order, orderDir, totalTicketTypes} = this.props;

        const columns = [
            { columnKey: 'name', value: T.translate("ticket_type_list.name"), sortable: true },
            { columnKey: 'badge_type_name', value: T.translate("ticket_type_list.badge_type_name") },
            { columnKey: 'external_id', value: T.translate("ticket_type_list.external_id") }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div className="container">
                <h3> {T.translate("ticket_type_list.ticket_type_list")} ({totalTicketTypes})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewTicketType}>
                            {T.translate("ticket_type_list.add_ticket_type")}
                        </button>
                        <button className="btn btn-default" onClick={this.handleSeedTickets}>
                            {T.translate("ticket_type_list.seed_tickets")}
                        </button>
                    </div>
                </div>

                {ticketTypes.length === 0 &&
                <div>{T.translate("ticket_type_list.no_ticket_types")}</div>
                }

                {ticketTypes.length > 0 &&
                    <Table
                        options={table_options}
                        data={ticketTypes}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
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
        seedTicketTypes
    }
)(TicketTypeListPage);
