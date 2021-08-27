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
import { getSummitById }  from '../../actions/summit-actions';
import { getPurchaseOrder, savePurchaseOrder, refundPurchaseOrder, deletePurchaseOrder, reSendOrderEmail, cancelRefundPurchaseOrder } from "../../actions/order-actions";
import PurchaseOrderForm from "../../components/forms/purchase-order-form";
import Swal from "sweetalert2";

//import '../../styles/edit-purchase-order-page.less';

class EditPurchaseOrderPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            refund_amount: ''
        };

        this.handleDeleteOrder = this.handleDeleteOrder.bind(this);
        this.handleRefundOrder = this.handleRefundOrder.bind(this);
        this.handleRefundChange = this.handleRefundChange.bind(this);
        this.handleResendEmail = this.handleResendEmail.bind(this);
        this.handleCancelRefundOrder = this.handleCancelRefundOrder.bind(this);
    }

    handleRefundChange(ev) {
        let val = ev.target.value;
        if(val != '' ){
            if(!/^\d*(\.\d{0,2})?$/.test(val)) return;
        }
        this.setState({refund_amount: parseFloat(ev.target.value)});
    }

    handleCancelRefundOrder(order, ev){
        const {cancelRefundPurchaseOrder} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_purchase_order.cancel_refund_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("edit_purchase_order.yes_cancel_refund")
        }).then(function(result){
            if (result.value) {
                cancelRefundPurchaseOrder(order.id);
            }
        });
    }

    handleResendEmail(order, ev){
        this.props.reSendOrderEmail(order.id);
    }

    handleDeleteOrder(order, ev) {
        const {deletePurchaseOrder} = this.props;
        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_purchase_order.remove_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deletePurchaseOrder(order.id);
            }
        });
    }

    handleRefundOrder(order, ev) {
        const {refundPurchaseOrder} = this.props;
        const {refund_amount} = this.state;
        if(refund_amount > 0 && refund_amount <= order.raw_amount) {
            Swal.fire({
                title: T.translate("general.are_you_sure"),
                text: T.translate("edit_purchase_order.refund_warning"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: T.translate("edit_purchase_order.yes_refund")
            }).then(function (result) {
                if (result.value) {
                    refundPurchaseOrder(order.id, refund_amount);
                }
            });
        }
    }

    render(){
        const {currentSummit, entity, errors, match} = this.props;
        const {refund_amount} = this.state;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>
                    {title} {T.translate("edit_purchase_order.purchase_order")}
                    {entity.id !== 0 &&
                    <div className="pull-right form-inline">
                        {(entity.status === 'RefundRequested' || entity.status === 'Paid') &&
                            <>
                                <input className="form-control" type="number" min="0"
                                       step=".01"
                                       placeholder="0.00"
                                       value={refund_amount} onChange={this.handleRefundChange} />
                                <button className="btn btn-sm btn-primary right-space"
                                        onClick={this.handleRefundOrder.bind(this, entity)}>
                                    {T.translate("edit_purchase_order.refund")}
                                </button>
                            </>
                        }
                        {
                            entity.status === 'RefundRequested' &&
                            <button className="btn btn-sm btn-primary right-space" onClick={this.handleCancelRefundOrder.bind(this, entity)}>
                                {T.translate("edit_purchase_order.cancel_refund")}
                            </button>
                        }
                        <button className="btn btn-sm btn-danger" onClick={this.handleDeleteOrder.bind(this, entity)}>
                            {T.translate("edit_purchase_order.delete_order")}
                        </button>
                        { entity.status === 'Paid' &&
                        <button className="btn btn-sm btn-primary left-space"
                                onClick={this.handleResendEmail.bind(this, entity)}>
                            {T.translate("edit_purchase_order.resend_order_email")}
                        </button>
                        }
                    </div>
                    }
                </h3>
                <hr/>

                <PurchaseOrderForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.savePurchaseOrder}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPurchaseOrderState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentPurchaseOrderState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getPurchaseOrder,
        savePurchaseOrder,
        refundPurchaseOrder,
        deletePurchaseOrder,
        reSendOrderEmail,
        cancelRefundPurchaseOrder
    }
)(EditPurchaseOrderPage);
