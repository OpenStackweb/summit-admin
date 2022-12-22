/**
 * Copyright 2022 OpenStack Foundation
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
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch, Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitAuditLog, clearAuditLogParams } from "../../actions/audit-log-actions";

class AuditLogPage extends React.Component {

    constructor(props) {
        super(props);

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSort = this.handleSort.bind(this);
    }

    componentDidMount() {
        const {term, currentPage, perPage, order, orderDir} = this.props;
        this.props.clearAuditLogParams();
        this.props.getSummitAuditLog(term, currentPage, perPage, order, orderDir);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getSummitAuditLog(term, page, perPage, order, orderDir);
    }

    handleSearch(newTerm) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getSummitAuditLog(newTerm, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getSummitAuditLog(term, page, perPage, key, dir);
    }

    render(){
        const {logEntries, lastPage, currentPage, order, orderDir, term, totalLogEntries} = this.props;

        const columns = [
            { columnKey: 'created', value: T.translate("audit_log.date"), sortable: true },
            { columnKey: 'action', value: T.translate("audit_log.action"), sortable: false },
            { columnKey: 'event_id', value: T.translate("audit_log.event"), sortable: true },
            { columnKey: 'user', value: T.translate("audit_log.user"), sortable: false }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: { }
        }        

        return(
            <div className="container">
                <h3> {T.translate("audit_log.log_entries")} ({totalLogEntries})</h3>
                <div className={'row'}>
                    <div className={'col-md-8'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("audit_log.placeholders.search_log")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                </div>
                
                {logEntries.length === 0 &&
                <div>{T.translate("audit_log.no_log_entries")}</div>
                }

                {logEntries.length > 0 &&
                <>
                    <Table
                        options={table_options}
                        data={logEntries}
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

const mapStateToProps = ({ auditLogState }) => ({
    ...auditLogState
})

export default connect (
    mapStateToProps,
    {
        getSummitAuditLog,
        clearAuditLogParams
    }
)(AuditLogPage);
