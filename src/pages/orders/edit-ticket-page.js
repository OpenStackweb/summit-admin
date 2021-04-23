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
import { getTicket, saveTicket, reassignTicket,
    addBadgeToTicket, reSendTicketEmail, activateTicket } from "../../actions/ticket-actions";
import TicketForm from "../../components/forms/ticket-form";
import BadgeForm from "../../components/forms/badge-form";
import {getBadgeFeatures, getBadgeTypes, deleteBadge,
    addFeatureToBadge, removeFeatureFromBadge, changeBadgeType,
    printBadge} from "../../actions/badge-actions";
import Swal from "sweetalert2";


//import '../../styles/edit-ticket-page.less';

class EditTicketPage extends React.Component {

    constructor(props) {
        const {currentSummit, match} = props;
        const new_ticket_id = match.params.ticket_id;
        super(props);

        props.getTicket(new_ticket_id);

        if (!currentSummit.badge_features) props.getBadgeFeatures();
        if (!currentSummit.badge_types) props.getBadgeTypes();

        this.handlePrintBadge = this.handlePrintBadge.bind(this);
        this.handleAddBadgeToTicket = this.handleAddBadgeToTicket.bind(this);
        this.handleDeleteBadge = this.handleDeleteBadge.bind(this);
        this.handleResendEmail = this.handleResendEmail.bind(this);
        this.handleActivateDeactivate = this.handleActivateDeactivate.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.ticket_id;
        const newId = this.props.match.params.ticket_id;

        if (oldId !== newId) {
            this.props.getTicket(newId);
        }
    }

    handlePrintBadge(ev) {
        const {entity} = this.props;
        ev.preventDefault();

        this.props.printBadge(entity.id);
    }

    handleResendEmail(ticket, ev){
        ev.preventDefault();
        this.props.reSendTicketEmail(ticket.order_id, ticket.id);
    }

    handleActivateDeactivate(ticket, ev){
        ev.preventDefault();
        let activate = !ticket.is_active;
        let {activateTicket, currentOrder} = this.props;
        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: activate ? T.translate("edit_ticket.activate_warning") : T.translate("edit_ticket.deactivate_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                activateTicket(currentOrder.id, ticket.id, activate);
            }
        });

    }

    handleDeleteBadge(ticketId, ev) {
        const {deleteBadge} = this.props;

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
        const {currentSummit, currentOrder, loading,  entity, errors, match} = this.props;

        const breadcrumb = `...${entity.number.slice(-20)}`;

        if (!entity || !entity.id) return (<div />);
        if (entity.order_id !== currentOrder.id) return (<div />);

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{T.translate("edit_ticket.ticket")}
                    {entity.id !== 0 &&
                    <div className="pull-right form-inline">
                        { entity.status === 'Paid' && entity.is_active &&
                        <button className="btn btn-sm btn-primary left-space"
                                onClick={(ev) => this.handleResendEmail(entity, ev) }>
                            {T.translate("edit_ticket.resend_email")}
                        </button>
                        }
                        <button className={"btn btn-sm left-space " + ( entity.is_active ? "btn-danger":"btn-primary")}
                                onClick={(ev) => {this.handleActivateDeactivate(entity, ev)}}>
                            { entity.is_active ? T.translate("edit_ticket.deactivate"): T.translate("edit_ticket.activate")}
                        </button>
                    </div>
                    }
                </h3>
                <hr/>

                <TicketForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    order={currentOrder}
                    errors={errors}
                    onReassing={this.props.reassignTicket}
                    onSaveTicket={this.props.saveTicket}
                />
                <br/>
                <br/>
                <br/>

                { entity.is_active && !entity.badge &&
                    <button className="btn btn-primary" onClick={this.handleAddBadgeToTicket}>
                        {T.translate("edit_ticket.add_badge")}
                    </button>
                }

                { entity.is_active && entity.badge &&
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
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getTicket,
        saveTicket,
        reassignTicket,
        deleteBadge,
        getBadgeFeatures,
        getBadgeTypes,
        addFeatureToBadge,
        removeFeatureFromBadge,
        changeBadgeType,
        addBadgeToTicket,
        printBadge,
        reSendTicketEmail,
        activateTicket,
    }
)(EditTicketPage);
