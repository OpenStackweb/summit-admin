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
import { getEmailTemplates, deleteEmailTemplate } from "../../actions/email-actions";

class EmailTemplateListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewEmailTemplate = this.handleNewEmailTemplate.bind(this);
        this.handleDeleteEmailTemplate = this.handleDeleteEmailTemplate.bind(this);

        this.state = {
        }
    }

    componentDidMount() {
        const {term, currentPage, perPage, order, orderDir} = this.props;
        this.props.getEmailTemplates(term, currentPage, perPage, order, orderDir);
    }

    handleEdit(template_id) {
        const {history} = this.props;
        history.push(`/app/emails/templates/${template_id}`);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getEmailTemplates(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getEmailTemplates(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getEmailTemplates(term, page, perPage, order, orderDir);
    }

    handleNewEmailTemplate(ev) {
        const {history} = this.props;
        ev.preventDefault();

        history.push(`/app/emails/templates/new`);
    }

    handleDeleteEmailTemplate(templateId) {
        const {deleteEmailTemplate, templates} = this.props;
        let template = templates.find(t => t.id === templateId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("emails.delete_template_warning") + ' ' + template.identifier,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteEmailTemplate(templateId);
            }
        });
    }

    render(){
        const {templates, lastPage, currentPage, term, order, orderDir, totalTemplates} = this.props;

        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'identifier', value: T.translate("emails.name"), sortable: true },
            { columnKey: 'subject', value: T.translate("emails.subject") },
            { columnKey: 'from_email', value: T.translate("emails.from_email")},
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDeleteEmailTemplate }
            }
        }

        return(
            <div className="container">
                <h3> {T.translate("emails.template_list")} ({totalTemplates})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("emails.placeholders.search_templates")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewEmailTemplate}>
                            {T.translate("emails.add_template")}
                        </button>
                    </div>
                </div>

                {templates.length === 0 &&
                <div>{T.translate("emails.no_templates")}</div>
                }

                {templates.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={templates}
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

const mapStateToProps = ({ directoryState, emailTemplateListState }) => ({
    summits         : directoryState.summits,
    ...emailTemplateListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEmailTemplates,
        deleteEmailTemplate
    }
)(EmailTemplateListPage);
