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
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getSponsorships, deleteSponsorship } from "../../actions/sponsorship-actions";

class SponsorshipListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleNewSponsorship = this.handleNewSponsorship.bind(this);

        this.state = {}

    }

    componentDidMount() {
        const {currentPage, perPage, order, orderDir} = this.props;
        this.props.getSponsorships(currentPage, perPage, order, orderDir);
    }

    handleEdit(sponsorship_id) {
        const {history} = this.props;
        history.push(`/app/sponsorship-types/${sponsorship_id}`);
    }

    handlePageChange(page) {
        const {order, orderDir, perPage} = this.props;
        this.props.getSponsorships(page, perPage, order, orderDir);
    }

    handleDelete(sponsorshipId) {
        const {deleteSponsorship, sponsorships} = this.props;
        let sponsorship = sponsorships.find(t => t.id === sponsorshipId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("sponsorship_list.remove_warning") + ' ' + sponsorship.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSponsorship(sponsorshipId);
            }
        });
    }

    handleSort(index, key, dir, func) {
        const {perPage, page} = this.props;
        this.props.getSponsorships(page, perPage, key, dir);
    }

    handleNewSponsorship(ev) {
        const {history} = this.props;
        history.push(`/app/sponsorship-types/new`);
    }

    render(){
        const {sponsorships, lastPage, currentPage, order, orderDir, totalSponsorships} = this.props;

        const columns = [
            { columnKey: 'name', value: T.translate("sponsorship_list.name"), sortable: true },
            { columnKey: 'label', value: T.translate("sponsorship_list.label"), sortable: true },
            { columnKey: 'size', value: T.translate("sponsorship_list.size"), sortable: true }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }        

        return(
            <div className="container">
                <h3> {T.translate("sponsorship_list.sponsorship_types_list")} ({totalSponsorships})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewSponsorship}>
                            {T.translate("sponsorship_list.add_sponsorship")}
                        </button>
                    </div>
                </div>

                {sponsorships.length === 0 &&
                <div>{T.translate("sponsorship_list.no_sponsorships")}</div>
                }

                {sponsorships.length > 0 &&
                <>
                    <Table
                        options={table_options}
                        data={sponsorships}
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
                </>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSponsorshipListState }) => ({
    ...currentSponsorshipListState
})

export default connect (
    mapStateToProps,
    {
        getSponsorships,
        deleteSponsorship
    }
)(SponsorshipListPage);
