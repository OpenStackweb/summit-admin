/**
 * Copyright 2020 OpenStack Foundation
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
import { getPaymentProfiles, savePaymentProfile, deletePaymentProfile } from "../../actions/ticket-actions";
import {Table} from "openstack-uicore-foundation/lib/components";
import Swal from "sweetalert2";

class PaymentProfileListPage extends React.Component {

    constructor(props) {
        super(props);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewPaymentProfile = this.handleNewPaymentProfile.bind(this);
        this.state = {}
    }

    handleEdit(paymentProfileId) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/payment-profiles/${paymentProfileId}`);
    }

    handleDelete(paymentProfileId) {
        const {deletePaymentProfile, paymentProfiles} = this.props;
        let paymentProfile = paymentProfiles.find(pp => parseInt(pp.id) === parseInt(paymentProfileId));

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("payment_profiles.remove_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deletePaymentProfile(paymentProfileId);
            }
        });
    }

    handleSort(index, key, dir, func) {
        this.props.getPaymentProfiles(1, 100, key, dir);
    }

    handleNewPaymentProfile(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/payment-profiles/new`);
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getPaymentProfiles(1, 100);
        }
    }

    render(){

        const {currentSummit, paymentProfiles, order, orderDir, totalPaymentProfiles, match} = this.props;

        const columns = [
            { columnKey: 'id', value: T.translate("payment_profiles.id"), sortable: true },
            { columnKey: 'application_type', value: T.translate("payment_profiles.application_type") },
            { columnKey: 'provider', value: T.translate("payment_profiles.provider") },
            { columnKey: 'active_nice', value: T.translate("payment_profiles.active") }
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
                <h3> {T.translate("payment_profiles.payment_profiles_list")} ({totalPaymentProfiles})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewPaymentProfile}>
                            {T.translate("payment_profiles.add_payment_profile")}
                        </button>
                    </div>
                </div>

                {paymentProfiles.length === 0 &&
                <div>{T.translate("payment_profiles.no_payment_profiles")}</div>
                }

                {paymentProfiles.length > 0 &&
                <Table
                    options={table_options}
                    data={paymentProfiles}
                    columns={columns}
                    onSort={this.handleSort}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPaymentProfileListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentPaymentProfileListState
});

export default connect (
    mapStateToProps,
    {
        savePaymentProfile,
        deletePaymentProfile,
        getPaymentProfiles
    }
)(PaymentProfileListPage);
