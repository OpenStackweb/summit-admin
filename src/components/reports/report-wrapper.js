import React from 'react';
import {connect} from "react-redux";
import { compose } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch } from 'openstack-uicore-foundation/lib/components'
import {exportReport, getReport} from "../../actions/report-actions";
import T from "i18n-react/dist/i18n-react";
import FragmentParser from "../../utils/fragmen-parser";
import {TrackFilter, RoomFilter, PublishedFilter, StatusFilter} from '../filters'


const wrapReport = (ReportComponent, specs) => {
    class ReportBase extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                searchTerm: null,
                sortKey: null,
                sortDir: null,
            };

            this.fragmentParser     = new FragmentParser();
            this.buildQuery         = this.buildQuery.bind(this);
            this.handleSort         = this.handleSort.bind(this);
            this.handlePageChange   = this.handlePageChange.bind(this);
            this.handleSearch       = this.handleSearch.bind(this);
            this.handleExportReport = this.handleExportReport.bind(this);
            this.handleReload       = this.handleReload.bind(this);
            this.handleGetReport    = this.handleGetReport.bind(this);
            this.renderFilters      = this.renderFilters.bind(this);
        }

        componentDidMount () {
            if (!this.props.currentSummit) return;

            this.handleGetReport(1);
        }

        buildQuery(page, forExport=false) {
            let {perPage, currentSummit} = this.props;
            let {searchTerm, sortKey, sortDir} = this.state;
            let queryFilters = {};
            let listFilters = {};
            let filters = this.fragmentParser.getParams();

            if (!forExport && specs.pagination) {
                queryFilters = {limit: perPage};
                if (page != 1) {
                    queryFilters.offset = (page - 1) * perPage;
                }
            }

            if (sortKey) {
                let order = (sortDir == 1) ? '' : '-';
                queryFilters.ordering = order + '' + sortKey;
            }

            if (searchTerm) {
                listFilters.search = searchTerm;
            }

            if (filters) {
                listFilters = {...listFilters, ...filters}
            }

            let query = this.refs.childCmp.buildReportQuery(queryFilters, listFilters);

            return "{ reportData: "+ query + " }";
        }

        handleReload() {
            this.handleGetReport(1);
        }

        handlePageChange(page) {
            this.handleGetReport(page);
        }

        handleSearch(term) {
            this.setState({searchTerm: term}, () => {
                this.handleGetReport(1);
            });
        }

        handleSort(index, key, dir, func) {

            this.setState({sortKey: key, sortDir: dir}, () => {
                this.handleGetReport(1);
            });

        }

        handleExportReport(ev) {
            ev.preventDefault();

            let query = this.buildQuery(1, true);
            let name = this.refs.childCmp.getName();
            this.props.exportReport(query, name, this.refs.childCmp.preProcessData);
        }

        handleGetReport(page) {
            let query = this.buildQuery(page);
            let name = this.refs.childCmp.getName();
            this.props.getReport(query, name, page);
        }

        handleFilterChange(filter, value) {
            let multiFilters = ['track', 'room'];
            let theValue = null;

            if (multiFilters.includes(filter)) {
                theValue = value.join(',');
            } else {
                theValue = value;
            }

            this.fragmentParser.setParam(filter, theValue);
            window.location.hash   = this.fragmentParser.serialize();
            this.handleReload()

        }

        renderFilters() {
            let {currentSummit} = this.props;
            let filterHtml = [];
            let filters = this.fragmentParser.getParams();

            if (specs.filters.includes('track')) {
                let filterValue = filters.hasOwnProperty('track') ? filters.track : null;
                filterHtml.push(
                    <div className="col-md-4" key="track-filter">
                        <TrackFilter value={filterValue} tracks={currentSummit.tracks} onChange={(value) => {this.handleFilterChange('track',value)}} isMulti/>
                    </div>
                );
            }

            if (specs.filters.includes('room')) {
                let filterValue = filters.hasOwnProperty('room') ? filters.room : null;
                filterHtml.push(
                    <div className="col-md-4" key="room-filter">
                        <RoomFilter value={filterValue} rooms={currentSummit.locations.filter(l => l.class_name == 'SummitVenueRoom')} onChange={(value) => {this.handleFilterChange('room',value)}} isMulti/>
                    </div>
                );
            }

            if (specs.filters.includes('published')) {
                let filterValue = filters.hasOwnProperty('published') ? filters.published : null;
                filterHtml.push(
                    <div className="col-md-4" key="published-filter">
                        <PublishedFilter value={filterValue} onChange={(value) => {this.handleFilterChange('published',value)}} />
                    </div>
                );
            }

            if (specs.filters.includes('status')) {
                let filterValue = filters.hasOwnProperty('status') ? filters.status : null;
                filterHtml.push(
                    <div className="col-md-4" key="status-filter">
                        <StatusFilter value={filterValue} onChange={(value) => {this.handleFilterChange('status',value)}} />
                    </div>
                );
            }

            return filterHtml;
        }

        render() {
            let { match, currentPage, totalCount, perPage, currentSummit} = this.props;
            let {searchTerm, sortKey, sortDir} = this.state;
            let pageCount = Math.ceil(totalCount / perPage);
            let reportName = this.refs.childCmp ? this.refs.childCmp.getName() : 'report';

            return (
                <div className="container large">
                    <Breadcrumb data={{ title:reportName, pathname: match.url }} ></Breadcrumb>
                    <div className="row">
                        <div className="col-md-8">
                            <h3>{reportName}</h3>
                        </div>

                    </div>
                    <hr/>
                    <div className={'row'}>
                        <div className={'col-md-6'}>
                            <FreeTextSearch
                                value={searchTerm}
                                placeholder={T.translate("reports.placeholders.search")}
                                onSearch={this.handleSearch}
                            />
                        </div>
                        <div className="col-md-6 text-right">
                            <button className="btn btn-primary right-space" onClick={this.handleExportReport}>
                                {T.translate("reports.export")}
                            </button>
                        </div>
                    </div>
                    <hr/>

                    {specs.filters &&
                        <div>
                            <div className="row report-filters">
                                {this.renderFilters()}
                            </div>
                            <hr/>
                        </div>
                    }

                    <div className="report-container">
                        <ReportComponent
                            ref="childCmp"
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={this.handleSort}
                            onReload={this.handleReload}
                            data={this.props.data}
                            {...this.props}
                        />
                    </div>

                    {specs.pagination &&
                        <Pagination
                            bsSize="medium"
                            prev
                            next
                            ellipsis={false}
                            boundaryLinks={false}
                            maxButtons={10}
                            items={pageCount}
                            activePage={currentPage}
                            onSelect={this.handlePageChange}
                        />
                    }

                </div>

            );
        }
    }

    return ReportBase;
};

const mapStateToProps = ({ currentSummitState, currentReportState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentReportState
});

const composedReportWrapper = compose(
    connect(mapStateToProps, {getReport, exportReport}),
    wrapReport
)

export default composedReportWrapper;
