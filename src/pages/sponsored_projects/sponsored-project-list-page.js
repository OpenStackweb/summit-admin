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
import { FreeTextSearch, Table } from 'openstack-uicore-foundation/lib/components';
import { getSponsoredProjects, deleteSponsoredProject } from "../../actions/sponsored-project-actions";

class SponsoredProjectListPage extends React.Component {

    constructor(props) {
        super(props);

        props.getSponsoredProjects();

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewSponsoredProject = this.handleNewSponsoredProject.bind(this);

        this.state = {}
    }

    handleEdit(id) {
        const {history} = this.props;
        history.push(`/app/sponsored-projects/${id}`);
    }

    handleDelete(id) {
        const {deleteSponsoredProject, sponsoredProjects} = this.props;
        let sponsoredProject = sponsoredProjects.find(s => s.id === id);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("sponsored_project_list.delete_warning") + ' ' + sponsoredProject.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSponsoredProject(id);
            }
        });
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getSponsoredProjects(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getSponsoredProjects(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getSponsoredProjects(term, page, perPage, order, orderDir);
    }

    handleNewSponsoredProject(ev) {
        const {history} = this.props;
        history.push(`/app/sponsored-projects/new`);
    }

    render(){
        const {sponsoredProjects, lastPage, currentPage, term, order, orderDir, totalSponsoredProjects } = this.props;

        const projects = sponsoredProjects.map(p => {
            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                parent_project: p.parent_project?.name
            }
        });

        const columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'name', value: T.translate("sponsored_project_list.name"), sortable: true },
            { columnKey: 'slug', value: T.translate("sponsored_project_list.slug"), sortable: true },
            { columnKey: 'parent_project', value: T.translate("sponsored_project_list.parent_project"), sortable: false },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: {onClick: this.handleDelete}
            }
        };

        return(
            <div className="container">
                <h3> {T.translate("sponsored_project_list.sponsored_project_list")} ({totalSponsoredProjects}) </h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("sponsored_project_list.placeholders.search")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary" onClick={this.handleNewSponsoredProject}>
                            {T.translate("sponsored_project_list.add")}
                        </button>
                    </div>
                </div>

                {projects.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={projects}
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

const mapStateToProps = ({ sponsoredProjectListState }) => ({
    ...sponsoredProjectListState
});

export default connect (
    mapStateToProps,
    {
        getSponsoredProjects,
        deleteSponsoredProject
    }
)(SponsoredProjectListPage);
