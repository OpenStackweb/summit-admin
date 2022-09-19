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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch, Table } from 'openstack-uicore-foundation/lib/components';
import { getPurchaseOrders } from "../../actions/order-actions";
import QrReaderInput from '../../components/inputs/qr-reader-input';
import { getTicket } from '../../actions/ticket-actions'
import Swal from "sweetalert2";
import {getTicketFromQR} from "../../utils/methods";


class PurchaseOrderListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleQRScan = this.handleQRScan.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewOrder = this.handleNewOrder.bind(this);


        this.state = {};
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getPurchaseOrders();
        }
    }

    handleQRScan(qrCode) {
        const {currentSummit, history} = this.props;
        const {ticketNumber, qrPrefix} = getTicketFromQR(qrCode, currentSummit);

        if (ticketNumber) {
            this.props.getTicket(ticketNumber).then(
                (data) => {
                    history.push(`/app/summits/${currentSummit.id}/purchase-orders/${data.order_id}/tickets/${data.id}`);
                }
            );
        } else {
            Swal.fire(T.translate("purchase_order_list.wrong_qr_title"), `Ticket prefix ${qrPrefix} does not match this show.`, "warning");
        }
    }

    handleEdit(purchaseOrderId) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/${purchaseOrderId}`);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getPurchaseOrders(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        key = (key === 'name') ? 'last_name' : key;
        this.props.getPurchaseOrders(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getPurchaseOrders(term, page, perPage, order, orderDir);
    }

    handleNewOrder(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/purchase-orders/new`);
    }

    render(){
        const {currentSummit, purchaseOrders, lastPage, currentPage, term, order, orderDir, totalPurchaseOrders} = this.props;

        const columns = [
            { columnKey: 'number', value: T.translate("purchase_order_list.number")},
            { columnKey: 'owner_id', value: T.translate("purchase_order_list.owner_id")},
            { columnKey: 'owner_name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'owner_email', value: T.translate("general.email") },
            { columnKey: 'company', value: T.translate("purchase_order_list.company") },
            { columnKey: 'bought_date', value: T.translate("purchase_order_list.bought_date") },
            { columnKey: 'amount', value: T.translate("purchase_order_list.price") },
            { columnKey: 'payment_method', value: T.translate("purchase_order_list.payment_method") },
            { columnKey: 'status', value: T.translate("purchase_order_list.status") },
        ];

        const table_options = {
            sortCol: (order === 'last_name') ? 'name' : order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div className="container large">
                <h3> {T.translate("purchase_order_list.purchase_orders")} ({totalPurchaseOrders})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("purchase_order_list.placeholders.search_orders")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-2">
                        <QrReaderInput onScan={this.handleQRScan} />
                    </div>
                    <div className="col-md-4 text-right">
                        <button className="btn btn-primary" onClick={this.handleNewOrder}>
                            {T.translate("purchase_order_list.add_order")}
                        </button>
                    </div>
                </div>

                {purchaseOrders.length === 0 &&
                <div>{T.translate("purchase_order_list.no_orders")}</div>
                }

                {purchaseOrders.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={purchaseOrders}
                        columns={columns}
                        onSort={this.handleSort}
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
                        onSelect={this.handlePageChange}
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPurchaseOrderListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentPurchaseOrderListState
})

export default connect (
    mapStateToProps,
    {
        getPurchaseOrders,
        getTicket
    }
)(PurchaseOrderListPage);
