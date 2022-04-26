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
import { FreeTextSearch, Table, CompanyInput } from 'openstack-uicore-foundation/lib/components';
import { getSummitById } from '../../actions/summit-actions';
import { getRegistrationCompanies, addRegistrationCompany, deleteRegistrationCompany } from '../../actions/registration-companies-actions';

class RegistrationCompaniesListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleAddCompany = this.handleAddCompany.bind(this);
        this.handleDeleteCompany = this.handleDeleteCompany.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);

        this.state = {
            searchTerm: '',
            dropdownCompany: null
        }

    }

    componentDidMount() {
        const { currentSummit } = this.props;
        if (currentSummit) {
            this.props.getRegistrationCompanies();
        }
    }

    handleChange(ev) {
        this.setState({ dropdownCompany: ev.target.value })
    }

    handleAddCompany(company) {
        this.props.addRegistrationCompany(company);
        this.setState({ dropdownCompany: null });
    }

    handleDeleteCompany(companyId) {
        const { deleteRegistrationCompany, companies } = this.props;
        let company = companies.find(t => t.id === companyId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("registration_companies.remove_warning") + ' ' + company.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function (result) {
            if (result.value) {
                deleteRegistrationCompany(companyId);
            }
        });
    }

    handleSearch(term) {
        this.props.getRegistrationCompanies(term);
    }

    handlePageChange(page) {
        const { term, order, orderDir, perPage } = this.props;
        this.props.getRegistrationCompanies(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const { term, page, perPage } = this.props;
        this.props.getRegistrationCompanies(term, page, perPage, key, dir);
    }

    render() {

        let { currentSummit, companies, order, orderDir, lastPage, currentPage, totalCompanies } = this.props;

        let { searchTerm, dropdownCompany } = this.state;

        const columns = [
            { columnKey: 'name', value: T.translate("registration_companies.name"), sortable: true },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                delete: { onClick: this.handleDeleteCompany }
            }
        }

        if (!currentSummit.id) return (<div />);

        return (
            <div className="container">
                <h3> {T.translate("registration_companies.registration_companies_list")} ({totalCompanies})</h3>
                <div className={'row'}>
                    <div className={'col-md-4'}>
                        <FreeTextSearch
                            value={searchTerm ?? ''}
                            placeholder={T.translate("registration_companies.placeholders.search_companies")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-4 text-right col-md-offset-3">
                        <CompanyInput
                            id="registration-company"
                            value={dropdownCompany}
                            onChange={this.handleChange}
                            summitId={currentSummit.id}
                        />
                    </div>
                    <div className="col-md-1 text-right">
                        <button onClick={() => this.handleAddCompany(dropdownCompany)} className="btn btn-default">Add</button>
                    </div>
                </div>

                {companies.length === 0 &&
                    <div>{T.translate("registration_companies.no_registration_companies")}</div>
                }

                {companies.length > 0 &&
                    <>
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
                    </>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRegistrationCompanyListState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentRegistrationCompanyListState
})

export default connect(
    mapStateToProps,
    {
        getSummitById,
        getRegistrationCompanies,
        addRegistrationCompany,
        deleteRegistrationCompany,
    }
)(RegistrationCompaniesListPage);
