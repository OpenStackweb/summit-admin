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
import {Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import { getSummitById }  from '../../actions/summit-actions';
import { getTicket, saveTicket, reassignTicket,
    addBadgeToTicket, reSendTicketEmail, activateTicket, refundTicket, cancelRefundTicket } from "../../actions/ticket-actions";
import TicketForm from "../../components/forms/ticket-form";
import BadgeForm from "../../components/forms/badge-form";
import {getBadgeFeatures, getBadgeTypes, deleteBadge,
    addFeatureToBadge, removeFeatureFromBadge, changeBadgeType,
    printBadge} from "../../actions/badge-actions";
import Swal from "sweetalert2";
import {Table} from "openstack-uicore-foundation/lib/components";


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
        this.handleRefundChange = this.handleRefundChange.bind(this);
        this.handleRefundTicket = this.handleRefundTicket.bind(this);
        this.handleRejectRefundRequest = this.handleRejectRefundRequest.bind(this);
        this.shouldDisplayRejectRefundRequest = this.shouldDisplayRejectRefundRequest.bind(this);

        this.state = {
            refundAmount: '',
            refundNotes: '',
            showRefundModal: false,
            showRefundRejectModal:false,
            refundRejectNotes: ''
        };
    }

    shouldDisplayRejectRefundRequest(id){
        const {entity} = this.props;
        const request = entity.refund_requests.find(r => r.id === id);
        return request.status == 'Requested';
    }

    handleRefundChange(ev) {
        let val = ev.target.value;
        if(val != '' ){
            if(!/^\d*(\.\d{0,2})?$/.test(val)) return;
        }
        this.setState({refundAmount: isNaN(val) ? 0.00: parseFloat(val)});
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

    handleRejectRefundRequest(ticket, ev){

        const { cancelRefundTicket, entity, currentOrder} = this.props;
        const { refundRejectNotes} = this.state;

        this.setState({...this.state,
            refundRejectNotes: '',
            showRefundRejectModal: false
        });

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_ticket.cancel_refund_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("edit_ticket.yes_cancel_refund")
        }).then(function (result) {
            if (result.value) {
                cancelRefundTicket(currentOrder.id, entity.id, refundRejectNotes);
            }
        });
    }

    handleRefundTicket(ticket, ev) {

        const { refundAmount, refundNotes} = this.state;
        const { refundTicket, entity} = this.props;

        if(refundAmount > 0 && refundAmount <= entity.raw_cost) {

            this.setState({...this.state,
                refundAmount: '',
                refundNotes: '',
                showRefundModal: false
            });

            Swal.fire({
                title: T.translate("general.are_you_sure"),
                text: T.translate("edit_ticket.refund_warning"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: T.translate("edit_ticket.yes_refund")
            }).then(function (result) {
                if (result.value) {
                    refundTicket(entity.id, refundAmount, refundNotes);
                }
            });
        }
    }

    render(){
        const {currentSummit, currentOrder, loading,  entity, errors, match} = this.props;

        const breadcrumb = `...${entity.number.slice(-20)}`;

        if (!entity || !entity.id) return (<div />);
        if (entity.order_id !== currentOrder.id) return (<div />);

        const refundRequestColumns = [
            { columnKey: 'id', value: T.translate("edit_ticket.refund_request_id") },
            { columnKey: 'requested_by_fullname', value: T.translate("edit_ticket.refund_request_requested_by") },
            { columnKey: 'action_by_fullname', value: T.translate("edit_ticket.refund_request_action_by") },
            { columnKey: 'action_date', value: T.translate("edit_ticket.refund_request_action_date") },
            { columnKey: 'status', value: T.translate("edit_ticket.refund_request_status") },
            { columnKey: 'refunded_amount_formatted', value: T.translate("edit_ticket.refunded_amount") },
            { columnKey: 'notes', value: T.translate("edit_ticket.refund_request_notes") },
        ];

        const refundRequestOptions = {
            actions: {
                custom: [
                    {
                        name: 'Reject',
                        tooltip: T.translate("edit_ticket.cancel_refund"),
                        icon: <i className="fa fa-ban"/>,
                        onClick: _ => this.setState({...this.state, showRefundRejectModal: true}),
                        display: this.shouldDisplayRejectRefundRequest
                    }

                ],
            }
        };

        return(
           <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{T.translate("edit_ticket.ticket")}
                    {entity.id !== 0 &&
                    <div className="pull-right form-inline">

                        {entity.status === 'Paid' &&
                            <button className="btn btn-sm btn-primary right-space" onClick={() => this.setState({showRefundModal : true})}>
                                {T.translate("edit_ticket.refund")}
                            </button>
                        }
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

               { entity?.refund_requests?.length > 0 &&
                   <div>
                       <h3>
                           {T.translate("edit_ticket.refund_requests")}
                       </h3>
                       <hr/>
                       <Table
                           options={refundRequestOptions}
                           data={entity?.refund_requests}
                           columns={refundRequestColumns}
                       />
                   </div>
               }
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
                <Modal show={this.state.showRefundModal} onHide={() => this.setState({showRefundModal:false})} >
                    <Modal.Header closeButton>
                        <Modal.Title>{T.translate("edit_ticket.refund_modal_title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <input className="form-control" type="number" min="0"
                                       step=".01"
                                       placeholder="0.00"
                                       value={this.state.refundAmount}
                                       onChange={this.handleRefundChange} />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-md-12">
                                <textarea className="form-control"
                                          id="refundNotes"
                                          placeholder={T.translate("edit_ticket.placeholders.refund_notes")}
                                          value={this.state.refundNotes}
                                          onChange={(ev) => this.setState({...this.state, refundNotes:ev.target.value}) } />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-primary" onClick={ (ev) => this.handleRefundTicket(entity, ev)}>
                            {T.translate("edit_ticket.refund")}
                        </button>
                    </Modal.Footer>
                </Modal>
               <Modal show={this.state.showRefundRejectModal} onHide={() => this.setState({showRefundRejectModal:false})} >
                   <Modal.Header closeButton>
                       <Modal.Title>{T.translate("edit_ticket.refund_reject_modal_title")}</Modal.Title>
                   </Modal.Header>
                   <Modal.Body>
                       <div className="row form-group">
                           <div className="col-md-12">
                                <textarea className="form-control"
                                          id="refundRejectNotes"
                                          placeholder={T.translate("edit_ticket.placeholders.refund_reject_notes")}
                                          value={this.state.refundRejectNotes}
                                          onChange={(ev) => this.setState({...this.state, refundRejectNotes:ev.target.value}) } />
                           </div>
                       </div>
                   </Modal.Body>
                   <Modal.Footer>
                       <button className="btn btn-primary" onClick={ (ev) => this.handleRejectRefundRequest(entity, ev)}>
                           {T.translate("edit_ticket.refund_reject")}
                       </button>
                   </Modal.Footer>
               </Modal>
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
        refundTicket,
        cancelRefundTicket
    }
)(EditTicketPage);
