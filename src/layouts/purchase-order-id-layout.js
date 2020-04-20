/**
 * Copyright 2017 OpenStack Foundation
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
import {connect} from "react-redux";
import { Switch, Route, withRouter } from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';
import EditPurchaseOrderPage from '../pages/orders/edit-purchase-order-page'
import NoMatchPage from "../pages/no-match-page";
import EditTicketPage from "../pages/orders/edit-ticket-page";

import {resetPurchaseOrderForm, getPurchaseOrder, getOrderExtraQuestions} from "../actions/order-actions";

class PurchaseOrderIdLayout extends React.Component {

    componentWillMount () {
        let {currentSummit} = this.props;
        let orderId = this.props.match.params.purchase_order_id;

        if (!orderId) {
            this.props.resetPurchaseOrderForm();
        } else {
            this.props.getPurchaseOrder(orderId);
        }

        if (!currentSummit.order_extra_questions) {
            this.props.getOrderExtraQuestions();
        }

    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.purchase_order_id;
        let newId = newProps.match.params.purchase_order_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetPurchaseOrderForm();
            } else {
                this.props.getPurchaseOrder(newId);
            }
        }
    }

    render() {
        let {match, currentPurchaseOrder} = this.props;
        let orderId = match.params.purchase_order_id;
        let breadcrumb = currentPurchaseOrder.id ? `...${currentPurchaseOrder.number.slice(-20)}` : T.translate("general.new");

        if (orderId && !currentPurchaseOrder.id) return (<div></div>);

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <Switch>
                    <Route path={`${match.url}/tickets`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("purchase_order_list.tickets"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/:ticket_id(\\d+)`} component={EditTicketPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={match.url} component={EditPurchaseOrderPage} />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitState, currentPurchaseOrderState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentPurchaseOrder   : currentPurchaseOrderState.entity
});

export default Restrict(connect (
    mapStateToProps,
    {
        getPurchaseOrder,
        resetPurchaseOrderForm,
        getOrderExtraQuestions
    }
)(PurchaseOrderIdLayout), 'orders');



