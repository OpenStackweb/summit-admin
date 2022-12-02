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
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { Pagination } from 'react-bootstrap';
import { Table, SortableTable } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getSummitSponsorships, deleteSummitSponsorship, updateSummitSponsorhipOrder } from "../../actions/sponsor-actions";

class SummitSponsorshipListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleNewSponsorship = this.handleNewSponsorship.bind(this);

        this.state = {}

    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getSummitSponsorships();
        }
    }

    handleEdit(sponsorship_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/sponsorships/${sponsorship_id}`);
    }

    handleDelete(sponsorshipId) {
        const {deleteSummitSponsorship, sponsorships} = this.props;
        let sponsorship = sponsorships.find(t => t.id === sponsorshipId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("summit_sponsorship_list.remove_warning") + ' ' + sponsorship.type.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSummitSponsorship(sponsorshipId);
            }
        });
    }

    handleNewSponsorship(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/sponsorships/new`);
    }

    render(){
        const {currentSummit, sponsorships, currentPage, lastPage, order, orderDir, totalSponsorships} = this.props;

        const sortedSponsorships = sponsorships.sort((a, b) => a.order -b.order);

        const columns = [
            { columnKey: 'sponsorship_type', value: T.translate("summit_sponsorship_list.sponsorship_type") },
            { columnKey: 'label', value: T.translate("summit_sponsorship_list.label") },
            { columnKey: 'size', value: T.translate("summit_sponsorship_list.size") }
        ];

        const table_options = {            
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div className="container">
                <h3> {T.translate("summit_sponsorship_list.summit_sponsorship_list")} ({totalSponsorships})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewSponsorship}>
                            {T.translate("summit_sponsorship_list.add_sponsorship")}
                        </button>
                    </div>
                </div>

                {sortedSponsorships.length === 0 &&
                <div>{T.translate("summit_sponsorship_list.no_sponsorships")}</div>
                }

                {sortedSponsorships.length > 0 &&
                    <>
                        <SortableTable
                            options={table_options}
                            data={sortedSponsorships}
                            columns={columns}
                            dropCallback={this.props.updateSummitSponsorhipOrder}
                            orderField="order"
                        />
                    </>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSummitSponsorshipListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentSummitSponsorshipListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSummitSponsorships,
        deleteSummitSponsorship,
        updateSummitSponsorhipOrder
    }
)(SummitSponsorshipListPage);
