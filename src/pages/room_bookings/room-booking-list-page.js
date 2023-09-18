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
import { Modal } from 'react-bootstrap';
import { Pagination } from 'react-bootstrap';
import { Table, FreeTextSearch } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import {epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/utils/methods'
import { getRoomBookings, exportRoomBookings, deleteRoomBooking, refundRoomBooking } from "../../actions/room-booking-actions";

class RoomBookingListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDeleteBooking = this.handleDeleteBooking.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleRefundClick = this.handleRefundClick.bind(this);
        this.handleRefund = this.handleRefund.bind(this);
        this.handleRefundChange = this.handleRefundChange.bind(this);
        this.hasPaid = this.hasPaid.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);

        this.state = {
            showModal: false,
            modalBooking: null,
            modalAmount: 0
        }

    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getRoomBookings();
        }
    }

    handleEdit(room_booking_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/room-bookings/${room_booking_id}`);
    }

    handleDeleteBooking(bookingId) {
        const {deleteRoomBooking, roomBookings} = this.props;
        let roomBooking = roomBookings.find(rb => rb.id === bookingId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("room_booking_list.delete_booking_warning") + ' ' + roomBooking.owner_name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRoomBooking(bookingId);
            }
        });
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getRoomBookings(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getRoomBookings(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getRoomBookings(term, page, perPage, order, orderDir);
    }

    handleExport(ev) {
        const {term, order, orderDir} = this.props;
        ev.preventDefault();

        this.props.exportRoomBookings(term, order, orderDir);
    }

    handleRefundClick(bookingId) {
        const {roomBookings} = this.props;
        let roomBooking = roomBookings.find(rb => rb.id === bookingId);

        this.setState({
            showModal: true,
            modalBooking: roomBooking
        });
    }

    hasPaid(bookingId) {
        const {roomBookings} = this.props;
        let roomBooking = roomBookings.find(rb => rb.id === bookingId);

        return roomBooking.status === 'Paid' && roomBooking.amount > 0;
    }

    onCloseModal() {
        this.setState({showModal: false})
    }

    handleRefund() {
        const {modalBooking, modalAmount} = this.state;

        this.setState({
            showModal: false,
        });

        this.props.refundRoomBooking(modalBooking.room_id, modalBooking.id, modalAmount);
    }

    handleRefundChange(ev) {
        const {value, id} = ev.target;
        this.setState({modalAmount: parseInt(value)});
    }

    render(){
        const {currentSummit, roomBookings, lastPage, currentPage, term, order, orderDir, totalRoomBookings} = this.props;
        const {showModal, modalBooking, modalAmount} = this.state;

        const roomBookingsFormatted = roomBookings.map(rb => {
            let start_datetime = epochToMomentTimeZone(rb.start_datetime, currentSummit.time_zone_id).format('YYYY-MM-DD h:mm a');
            let end_datetime   = epochToMomentTimeZone(rb.end_datetime, currentSummit.time_zone_id).format('YYYY-MM-DD h:mm a');
            return {...rb, start_datetime: start_datetime, end_datetime: end_datetime}
        });

        const columns = [
            { columnKey: 'created', value: T.translate("room_booking_list.created"), sortable: true },
            { columnKey: 'room_name', value: T.translate("room_booking_list.room"), sortable: true },
            { columnKey: 'start_datetime', value: T.translate("room_booking_list.start"), sortable: true },
            { columnKey: 'end_datetime', value: T.translate("room_booking_list.end"), sortable: true },
            { columnKey: 'owner_name', value: T.translate("room_booking_list.owner"), sortable: true },
            { columnKey: 'status', value: T.translate("room_booking_list.status"), sortable: true },
            { columnKey: 'amount_str', value: T.translate("room_booking_list.paid") },
            { columnKey: 'refunded_amount_str', value: T.translate("room_booking_list.refunded") },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                custom: [
                    {
                        name: 'refund',
                        tooltip: 'refund',
                        icon: <i className="fa fa-money"/>,
                        onClick: this.handleRefundClick,
                        display: this.hasPaid
                    }
                ]
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div className="container">
                <h3> {T.translate("room_booking_list.room_booking_list")} ({totalRoomBookings})</h3>

                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("room_booking_list.placeholders.search_bookings")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-default right-space" onClick={this.handleExport}>
                            {T.translate("general.export")}
                        </button>
                    </div>
                </div>

                {roomBookings.length === 0 &&
                <div>{T.translate("room_booking_list.no_room_bookings")}</div>
                }

                {roomBookings.length > 0 &&
                    <div>
                        <Table
                            options={table_options}
                            data={roomBookingsFormatted}
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

                {modalBooking &&
                <Modal show={showModal} onHide={this.onCloseModal} dialogClassName="refund-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>REFUND {modalBooking.owner_name} for room {modalBooking.room_name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="room-booking-form">
                            <input type="hidden" id="id" value={modalBooking.id}/>
                            <div className="row">
                                <div className="col-md-12">
                                    <strong>User Payed: </strong>{modalBooking.amount_str} {modalBooking.currency}
                                </div>
                                <br />
                                <div className="col-md-12">
                                    <label> Refund </label>
                                    <input type="number" min="0" id="amount" value={modalAmount} className="form-control"
                                           onChange={this.handleRefundChange}/>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12 submit-buttons">
                                    <input type="button" onClick={this.handleRefund}
                                           className="btn btn-primary pull-right"
                                           value={T.translate("room_booking_list.refund")}/>
                                </div>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomBookingListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentRoomBookingListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRoomBookings,
        exportRoomBookings,
        refundRoomBooking,
        deleteRoomBooking
    }
)(RoomBookingListPage);
