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
import { getCompanies, deleteCompany } from "../../actions/company-actions";


class CompanyListPage extends React.Component {

    constructor(props) {
        super(props);

        props.getCompanies();

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewCompany = this.handleNewCompany.bind(this);

        this.state = {}
    }

    handleEdit(company_id) {
        let {history} = this.props;
        history.push(`/app/companies/${company_id}`);
    }

    handleDelete(companyId) {
        let {deleteCompany, companies} = this.props;
        let company = companies.find(s => s.id === companyId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("company_list.delete_company_warning") + ' ' + company.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteCompany(companyId);
            }
        });
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getCompanies(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getCompanies(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getCompanies(term, page, perPage, order, orderDir);
    }

    handleNewCompany(ev) {
        let {history} = this.props;
        history.push(`/app/companies/new`);
    }

    render(){
        let {companies, lastPage, currentPage, term, order, orderDir, totalCompanies } = this.props;

        let columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'name', value: T.translate("general.name"), sortable: true },
            { columnKey: 'contact_email', value: T.translate("general.email")},
            { columnKey: 'member_level', value: T.translate("company_list.member_level")}
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: {onClick: this.handleDelete}
            }
        };

        return(
            <div className="container">
                <h3> {T.translate("company_list.company_list")} ({totalCompanies}) </h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("company_list.placeholders.search_companies")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary" onClick={this.handleNewCompany}>
                            {T.translate("company_list.add_company")}
                        </button>
                    </div>
                </div>

                {companies.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={companies}
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

const mapStateToProps = ({ currentCompanyListState }) => ({
    ...currentCompanyListState
});

export default connect (
    mapStateToProps,
    {
        getCompanies,
        deleteCompany
    }
)(CompanyListPage);
