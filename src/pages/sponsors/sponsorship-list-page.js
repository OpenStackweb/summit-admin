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
import swal from "sweetalert2";
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getSponsorships, deleteSponsorship } from "../../actions/sponsor-actions";

class SponsorshipListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewSponsorship = this.handleNewSponsorship.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getSponsorships();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getSponsorships();
        }
    }

    handleEdit(sponsorship_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/sponsorships/${sponsorship_id}`);
    }

    handleDelete(sponsorshipId) {
        let {deleteSponsorship, sponsorships} = this.props;
        let sponsorship = sponsorships.find(t => t.id == sponsorshipId);

        swal({
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
        }).catch(swal.noop);
    }

    handleSort(index, key, dir, func) {
        this.props.getSponsorships(key, dir);
    }

    handleNewSponsorship(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/sponsorships/new`);
    }

    render(){
        let {currentSummit, sponsorships, order, orderDir, totalSponsorships} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("sponsorship_list.name"), sortable: true },
            { columnKey: 'label', value: T.translate("sponsorship_list.label") },
            { columnKey: 'size', value: T.translate("sponsorship_list.size") }
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div></div>);

        return(
            <div className="container">
                <h3> {T.translate("sponsorship_list.sponsorship_list")} ({totalSponsorships})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewSponsorship}>
                            {T.translate("sponsorship_list.add_sponsorship")}
                        </button>
                    </div>
                </div>

                {sponsorships.length == 0 &&
                <div>{T.translate("sponsorship_list.no_sponsorships")}</div>
                }

                {sponsorships.length > 0 &&
                    <Table
                        options={table_options}
                        data={sponsorships}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSponsorshipListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentSponsorshipListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSponsorships,
        deleteSponsorship
    }
)(SponsorshipListPage);
