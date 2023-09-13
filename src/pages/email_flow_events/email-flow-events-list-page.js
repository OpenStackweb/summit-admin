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
import {FreeTextSearch, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getEmailFlowEvents } from "../../actions/email-flows-events-actions";
import {Pagination} from "react-bootstrap";

class EmailFlowEventListPage extends React.Component {

    constructor(props) {
        super(props);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.state = {}

    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getEmailFlowEvents(term, page, perPage, order, orderDir);
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getEmailFlowEvents();
        }
    }

    handleEdit(event_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/email-flow-events/${event_id}`);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getEmailFlowEvents(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        this.props.getEmailFlowEvents(key, dir);
    }

    render(){
        const {currentSummit, emailFlowEvents, order, orderDir, totalEmailFlowEvents, lastPage, currentPage, term} = this.props;

        const columns = [
            { columnKey: 'flow_name', value: T.translate("email_flow_event_list.flow_name"), sortable: true },
            { columnKey: 'event_type_name', value: T.translate("email_flow_event_list.event_type_name"), title: true },
            { columnKey: 'email_template_identifier', value: T.translate("email_flow_event_list.email_template_identifier"), title: true }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
            }
        }

        if(!currentSummit.id) return (<div />);

        return(
            <div className="container">
                <h3> {T.translate("email_flow_event_list.email_flow_event_list")} ({totalEmailFlowEvents})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("email_flow_event_list.placeholders.search")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                </div>

                {emailFlowEvents.length === 0 &&
                <div>{T.translate("email_flow_event_list.no_email_flow_events")}</div>
                }

                {emailFlowEvents.length > 0 &&
                <div className='email-flow-table-wrapper'>
                    <Table
                        options={table_options}
                        data={emailFlowEvents}
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

const mapStateToProps = ({ currentSummitState, emailFlowEventsListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...emailFlowEventsListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEmailFlowEvents,
    }
)(EmailFlowEventListPage);
