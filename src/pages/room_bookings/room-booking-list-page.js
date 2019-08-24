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
import {epochToMomentTimeZone} from 'openstack-uicore-foundation/lib/methods'
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
        this.hasPayed = this.hasPayed.bind(this);
        this.onCloseModal = this.onCloseModal.bind(this);

        this.state = {
            showModal: false,
            modalBooking: null,
            modalAmount: 0
        }

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getRoomBookings();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getRoomBookings();
        }
    }

    handleEdit(room_booking_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/room-bookings/${room_booking_id}`);
    }

    handleDeleteBooking(bookingId) {
        let {deleteRoomBooking, roomBookings} = this.props;
        let roomBooking = roomBookings.find(rb => rb.id == bookingId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("room_booking_list.delete_booking_warning") + ' ' + roomBooking.owner,
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
        let {term, order, orderDir, perPage} = this.props;
        this.props.getRoomBookings(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getRoomBookings(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getRoomBookings(term, page, perPage, order, orderDir);
    }

    handleExport(ev) {
        let {term, order, orderDir} = this.props;
        ev.preventDefault();

        this.props.exportRoomBookings(term, order, orderDir);
    }

    handleRefundClick(bookingId) {
        let {roomBookings} = this.props;
        let roomBooking = roomBookings.find(rb => rb.id == bookingId);

        this.setState({
            showModal: true,
            modalBooking: roomBooking
        });
    }

    hasPayed(bookingId) {
        let {roomBookings} = this.props;
        let roomBooking = roomBookings.find(rb => rb.id == bookingId);

        return roomBooking.status == 'Payed';
    }

    onCloseModal() {
        this.setState({showModal: false})
    }

    handleRefund() {
        let {modalBooking, modalAmount} = this.state;

        this.setState({
            showModal: false,
        });

        this.props.refundRoomBooking(modalBooking.room_id, modalBooking.id, modalAmount);
    }

    handleRefundChange(ev) {
        let {value, id} = ev.target;
        this.setState({modalAmount: parseInt(value)});
    }

    render(){
        let {currentSummit, roomBookings, lastPage, currentPage, term, order, orderDir, totalRoomBookings} = this.props;
        let {showModal, modalBooking, modalAmount} = this.state;

        roomBookings = roomBookings.map(rb => {
            let startDate = epochToMomentTimeZone(rb.start_datetime, currentSummit.time_zone_id).format('YYYY-MM-DD h:mm a');
            let endDate = epochToMomentTimeZone(rb.end_datetime, currentSummit.time_zone_id).format('YYYY-MM-DD h:mm a');

            return {...rb, start_date: startDate, end_date: endDate}
        })

        let columns = [
            { columnKey: 'room_name', value: T.translate("room_booking_list.room"), sortable: true },
            { columnKey: 'start_date', value: T.translate("room_booking_list.start"), sortable: true },
            { columnKey: 'end_date', value: T.translate("room_booking_list.end") },
            { columnKey: 'owner', value: T.translate("room_booking_list.owner") },
            { columnKey: 'status', value: T.translate("room_booking_list.status") },
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                custom: [
                    {
                        name: 'refund',
                        tooltip: 'refund',
                        icon: <i className="fa fa-money"></i>,
                        onClick: this.handleRefundClick,
                        display: this.hasPayed
                    }
                ]
            }
        }

        if(!currentSummit.id) return (<div></div>);

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

                {roomBookings.length == 0 &&
                <div>{T.translate("room_booking_list.no_room_bookings")}</div>
                }

                {roomBookings.length > 0 &&
                    <div>
                        <Table
                            options={table_options}
                            data={roomBookings}
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
                        <Modal.Title>REFUND {modalBooking.owner} for room {modalBooking.room}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="room-booking-form">
                            <input type="hidden" id="id" value={modalBooking.id}/>
                            <div className="row">
                                <div className="col-md-12">
                                    <label> {T.translate("room_booking_list.amount")}</label>
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
