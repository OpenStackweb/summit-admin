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
import { Table, FreeTextSearch } from 'openstack-uicore-foundation/lib/components';
import { Pagination } from 'react-bootstrap';
import { getSummitById }  from '../../actions/summit-actions';
import { getSponsors, deleteSponsor } from "../../actions/sponsor-actions";

class SponsorListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewSponsor = this.handleNewSponsor.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getSponsors();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getSponsors();
        }
    }

    handleEdit(sponsor_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/sponsors/${sponsor_id}`);
    }

    handleDelete(sponsorId) {
        let {deleteSponsor, sponsors} = this.props;
        let sponsor = sponsors.find(t => t.id == sponsorId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("sponsor_list.remove_warning") + ' ' + sponsor.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSponsor(sponsorId);
            }
        }).catch(swal.noop);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getSponsors(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        key = (key == 'name') ? 'last_name' : key;
        this.props.getSponsors(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getSponsors(term, page, perPage, order, orderDir);
    }

    handleNewSponsor(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/sponsors/new`);
    }

    render(){
        let {currentSummit, sponsors, lastPage, currentPage, term, order, orderDir, totalSponsors} = this.props;

        let columns = [
            { columnKey: 'sponsorship_name', value: T.translate("sponsor_list.sponsorship"), sortable: true },
            { columnKey: 'company_name', value: T.translate("sponsor_list.company") }
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
                <h3> {T.translate("sponsor_list.sponsor_list")} ({totalSponsors})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("sponsor_list.placeholders.search_sponsors")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewSponsor}>
                            {T.translate("sponsor_list.add_sponsor")}
                        </button>
                    </div>
                </div>

                {sponsors.length == 0 &&
                <div>{T.translate("sponsor_list.no_sponsors")}</div>
                }

                {sponsors.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={sponsors}
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

const mapStateToProps = ({ currentSummitState, currentSponsorListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentSponsorListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSponsors,
        deleteSponsor
    }
)(SponsorListPage);
