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
import { Table, Dropdown } from 'openstack-uicore-foundation/lib/components';
import { Pagination } from 'react-bootstrap';
import { getSummitById }  from '../../actions/summit-actions';
import { getSponsorsWithBadgeScans, getBadgeScans, exportBadgeScans } from "../../actions/sponsor-actions";
import {Breadcrumb} from "react-breadcrumbs";

class BadgeScansListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSponsorChange = this.handleSponsorChange.bind(this);
        this.handleExport = this.handleExport.bind(this);

        this.state = {}
    }

    componentDidMount() {
        let {currentSummit, sponsorId} = this.props;
        if(currentSummit !== null) {
            this.props.getSponsorsWithBadgeScans();

            if (sponsorId) {
                this.props.getBadgeScans(sponsorId);
            }
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit, sponsorId} = this.props;

        if (currentSummit != null && currentSummit.id !== newProps.currentSummit.id) {
            this.props.getSponsorsWithBadgeScans();

            if (sponsorId) {
                this.props.getBadgeScans(sponsorId);
            }
        }
    }

    handlePageChange(page) {
        let {sponsorId, order, orderDir, perPage} = this.props;
        this.props.getBadgeScans(sponsorId, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {sponsorId, page, perPage} = this.props;
        this.props.getBadgeScans(sponsorId, page, perPage, key, dir);
    }

    handleSponsorChange(ev) {
        let {order, orderDir, page, perPage} = this.props;
        let value = ev.target.value;
        this.props.getBadgeScans(value, page, perPage, order, orderDir);
    }

    handleExport(ev) {
        let {sponsorId, order, orderDir, allSponsors} = this.props;
        ev.preventDefault();

        let sponsor = allSponsors.find(s => s.id === sponsorId);

        this.props.exportBadgeScans(sponsor, order, orderDir);
    }

    render(){
        let {match, currentSummit, allSponsors, sponsorId, badgeScans, lastPage, currentPage, order, orderDir, totalBadgeScans} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("badge_scan_list.id"), sortable: true },
            { columnKey: 'scan_date', value: T.translate("badge_scan_list.created"), sortable: true },
            { columnKey: 'attendee_first_name', value: T.translate("badge_scan_list.first_name"), sortable: true},
            { columnKey: 'attendee_last_name', value: T.translate("badge_scan_list.last_name"), sortable: true },
            { columnKey: 'attendee_email', value: T.translate("badge_scan_list.email"), sortable: true },
            { columnKey: 'attendee_company', value: T.translate("badge_scan_list.company_name"), sortable: true },
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {}
        };

        if(!currentSummit.id) return (<div/>);

        let sponsors_ddl = allSponsors ? allSponsors.map(s => ({label: s.company.name, value: s.id})) : null;

        return(
            <>
                <Breadcrumb data={{ title: T.translate("badge_scan_list.badge_scans"), pathname: match.url }} />
                <div className="container">
                    <h3> {T.translate("badge_scan_list.badge_scan_list")} ({totalBadgeScans})</h3>
                    <div className="row">
                        <div className="col-md-6 col-md-offset-6 text-right">
                            <button className="btn btn-default right-space pull-right" onClick={this.handleExport}>
                                {T.translate("general.export")}
                            </button>
                            <div className="col-md-6 pull-right">
                                <Dropdown
                                    value={sponsorId}
                                    placeholder={T.translate("badge_scan_list.placeholders.select_sponsor")}
                                    options={sponsors_ddl}
                                    onChange={this.handleSponsorChange}
                                />
                            </div>
                        </div>
                    </div>

                    {badgeScans.length === 0 &&
                    <div>{T.translate("badge_scan_list.no_badge_scans")}</div>
                    }

                    {badgeScans.length > 0 &&
                    <div>
                        <Table
                            options={table_options}
                            data={badgeScans}
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
            </>
        )
    }
}

const mapStateToProps = ({ currentSummitState, badgeScansListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...badgeScansListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSponsorsWithBadgeScans,
        getBadgeScans,
        exportBadgeScans
    }
)(BadgeScansListPage);
