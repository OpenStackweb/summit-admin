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
import { getPurchaseOrder, savePurchaseOrder, refundPurchaseOrder, deletePurchaseOrder } from "../../actions/order-actions";
import PurchaseOrderForm from "../../components/forms/purchase-order-form";
import Swal from "sweetalert2";

//import '../../styles/edit-purchase-order-page.less';

class EditPurchaseOrderPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            refund_amount: 0
        };

        this.handleDeleteOrder = this.handleDeleteOrder.bind(this);
        this.handleRefundOrder = this.handleRefundOrder.bind(this);
        this.handleRefundChange = this.handleRefundChange.bind(this);

    }

    handleRefundChange(ev) {
        let value = parseInt(ev.target.value);
        this.setState({refund_amount: value});
    }

    handleDeleteOrder(order, ev) {
        let {deletePurchaseOrder} = this.props;

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
        let {refundPurchaseOrder} = this.props;
        let {refund_amount} = this.state;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_purchase_order.refund_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("edit_purchase_order.yes_refund")
        }).then(function(result){
            if (result.value) {
                refundPurchaseOrder(order.id, refund_amount);
            }
        });
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let {refund_amount} = this.state;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>
                    {title} {T.translate("edit_purchase_order.purchase_order")}
                    {entity.id != 0 &&
                    <div className="pull-right form-inline">
                        <input
                            className="form-control"
                            type="number"
                            min="0"
                            value={refund_amount}
                            onChange={this.handleRefundChange}
                        />
                        <button className="btn btn-sm btn-primary right-space" onClick={this.handleRefundOrder.bind(this, entity)}>
                            {T.translate("edit_purchase_order.refund")}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={this.handleDeleteOrder.bind(this, entity)}>
                            {T.translate("edit_purchase_order.delete_order")}
                        </button>
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
        deletePurchaseOrder
    }
)(EditPurchaseOrderPage);
