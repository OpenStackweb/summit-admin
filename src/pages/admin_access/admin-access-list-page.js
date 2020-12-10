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
import Swal from "sweetalert2";
import { Pagination } from 'react-bootstrap';
import {FreeTextSearch, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getAdminAccesses, deleteAdminAccess } from "../../actions/admin-access-actions";

class AdminAccessListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewAdminAccess = this.handleNewAdminAccess.bind(this);
        this.handleDeleteAdminAccess = this.handleDeleteAdminAccess.bind(this);

        this.state = {
        }
    }

    componentDidMount() {
        this.props.getAdminAccesses();
    }

    handleEdit(admin_access_id) {
        let {history} = this.props;
        history.push(`/app/admin-access/${admin_access_id}`);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getAdminAccesses(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getAdminAccesses(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getAdminAccesses(term, page, perPage, order, orderDir);
    }

    handleNewAdminAccess(ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(`/app/admin-access/new`);
    }

    handleDeleteAdminAccess(accessId) {
        let {deleteAdminAccess, admin_accesses} = this.props;
        let admin_access = admin_accesses.find(t => t.id === accessId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("admin_access.delete_warning") + ' ' + admin_access.title,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteAdminAccess(accessId);
            }
        });
    }

    render(){
        let {admin_accesses, lastPage, currentPage, term, order, orderDir} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'title', value: T.translate("admin_access.title"), sortable: true },
            { columnKey: 'summits', value: T.translate("admin_access.summits") },
            { columnKey: 'members', value: T.translate("admin_access.members")},
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDeleteAdminAccess }
            }
        }

        return(
            <div className="container">
                <h3> {T.translate("admin_access.admin_access_list")}</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("admin_access.placeholders.search")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewAdminAccess}>
                            {T.translate("admin_access.add")}
                        </button>
                    </div>
                </div>

                {admin_accesses.length === 0 &&
                <div>{T.translate("admin_access.no_results")}</div>
                }

                {admin_accesses.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={admin_accesses}
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

const mapStateToProps = ({ directoryState, adminAccessListState }) => ({
    summits         : directoryState.summits,
    ...adminAccessListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAdminAccesses,
        deleteAdminAccess
    }
)(AdminAccessListPage);
