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

import React from 'react'
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicket, refundTicket, saveTicket, reassignTicket, addBadgeToTicket } from "../../actions/ticket-actions";
import TicketForm from "../../components/forms/ticket-form";
import BadgeForm from "../../components/forms/badge-form";
import {getBadgeFeatures, getBadgeTypes, deleteBadge, addFeatureToBadge, removeFeatureFromBadge, changeBadgeType, printBadge} from "../../actions/badge-actions";
import Swal from "sweetalert2";
import NoMatchPage from "../no-match-page";
import { Input } from 'openstack-uicore-foundation/lib/components'


//import '../../styles/edit-ticket-page.less';

class EditTicketPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            refund_amount: 0
        };

        this.handlePrintBadge = this.handlePrintBadge.bind(this);
        this.handleAddBadgeToTicket = this.handleAddBadgeToTicket.bind(this);
        this.handleDeleteBadge = this.handleDeleteBadge.bind(this);
        this.handleRefundTicket = this.handleRefundTicket.bind(this);
        this.handleRefundChange = this.handleRefundChange.bind(this);
    }

    componentWillMount () {
        let {currentSummit} = this.props;
        let new_ticket_id = this.props.match.params.ticket_id;

        this.props.getTicket(new_ticket_id);

        if (!currentSummit.badge_features) this.props.getBadgeFeatures();
        if (!currentSummit.badge_types) this.props.getBadgeTypes();
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = newProps;
        let oldId = this.props.match.params.ticket_id;
        let newId = newProps.match.params.ticket_id;

        if (oldId != newId) {
            this.props.getTicket(newId);
        }

        //if (!currentSummit.badge_features) this.props.getBadgeFeatures();
        //if (!currentSummit.badge_types) this.props.getBadgeTypes();
    }

    handlePrintBadge(ev) {
        let {entity} = this.props;
        ev.preventDefault();

        this.props.printBadge(entity.id);
    }

    handleRefundChange(ev) {
        let value = parseInt(ev.target.value);
        this.setState({refund_amount: value});
    }

    handleRefundTicket(ticket, ev) {
        let {refundTicket} = this.props;
        let {refund_amount} = this.state;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_ticket.refund_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("edit_ticket.yes_refund")
        }).then(function(result){
            if (result.value) {
                refundTicket(ticket.id, refund_amount);
            }
        });
    }

    handleDeleteBadge(ticketId, ev) {
        let {deleteBadge} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_ticket.remove_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteBadge(ticketId);
            }
        });
    }

    handleAddBadgeToTicket(ev) {
        ev.preventDefault();
        this.props.addBadgeToTicket(this.props.entity.id);
    }

    render(){
        let {currentSummit, currentOrder, loading,  entity, errors, match} = this.props;
        let {refund_amount} = this.state;

        let breadcrumb = `...${entity.number.slice(-20)}`;

        if (!entity || !entity.id) return (<div></div>);
        if (entity.order_id != currentOrder.id && !loading) return (<NoMatchPage />)

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>
                    {T.translate("edit_ticket.ticket")}

                    {entity.status != 'Cancelled' &&
                    <div className="pull-right form-inline">
                        <input
                            className="form-control"
                            type="number"
                            min="0"
                            value={refund_amount}
                            onChange={this.handleRefundChange}
                        />
                        <button className="btn btn-sm btn-primary pull-right"
                                onClick={this.handleRefundTicket.bind(this, entity)}>
                            {T.translate("edit_ticket.refund_ticket")}
                        </button>
                    </div>
                    }
                </h3>
                <hr/>

                <TicketForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onReassing={this.props.reassignTicket}
                    onSaveTicket={this.props.saveTicket}
                />

                <br/>
                <br/>
                <br/>

                {!entity.badge &&
                    <button className="btn btn-primary" onClick={this.handleAddBadgeToTicket}>
                        {T.translate("edit_ticket.add_badge")}
                    </button>
                }

                {entity.badge &&
                    <div>
                        <h3>
                            {T.translate("edit_ticket.badge")}
                            <button className="btn btn-sm btn-danger pull-right" onClick={this.handleDeleteBadge.bind(this, entity.id)}>
                                {T.translate("edit_ticket.delete_badge")}
                            </button>
                        </h3>

                        <hr/>


                        <BadgeForm
                            history={this.props.history}
                            currentSummit={currentSummit}
                            entity={entity.badge}
                            canPrint={entity.owner && entity.badge}
                            onPrintBadge={this.handlePrintBadge}
                            onTypeChange={this.props.changeBadgeType}
                            onFeatureLink={this.props.addFeatureToBadge}
                            onFeatureUnLink={this.props.removeFeatureFromBadge}
                        />
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = ({ baseState, currentSummitState, currentPurchaseOrderState, currentTicketState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentOrder: currentPurchaseOrderState.entity,
    loading : baseState.loading,
    ...currentTicketState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTicket,
        refundTicket,
        saveTicket,
        reassignTicket,
        deleteBadge,
        getBadgeFeatures,
        getBadgeTypes,
        addFeatureToBadge,
        removeFeatureFromBadge,
        changeBadgeType,
        addBadgeToTicket,
        printBadge
    }
)(EditTicketPage);
