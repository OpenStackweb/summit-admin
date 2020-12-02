import React from 'react';
import {connect} from "react-redux";
import { compose } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch } from 'openstack-uicore-foundation/lib/components'
import {exportReport, getReport} from "../../actions/report-actions";
import T from "i18n-react/dist/i18n-react";
import FragmentParser from "../../utils/fragmen-parser";
import { getMembersForEventCSV } from '../../actions/member-actions'
import {TrackFilter, RoomFilter, PublishedFilter, PublishedInFilter, StatusFilter, AttendanceFilter, MediaFilter} from '../filters'
import ExportData from '../export'


const wrapReport = (ReportComponent, specs) => {
    class ReportBase extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
            };

            this.fragmentParser         = new FragmentParser();
            this.buildQuery             = this.buildQuery.bind(this);
            this.handleSort             = this.handleSort.bind(this);
            this.handlePageChange       = this.handlePageChange.bind(this);
            this.handleSearch           = this.handleSearch.bind(this);
            this.handleExportReport     = this.handleExportReport.bind(this);
            this.handleReload           = this.handleReload.bind(this);
            this.handleGetReport        = this.handleGetReport.bind(this);
            this.renderFilters          = this.renderFilters.bind(this);
        }

        componentDidMount () {
            if (!this.props.currentSummit) return;

            this.handleGetReport(1);
        }

        buildFiltersForQuery(filters, summitId) {
            let {exclude_attendance, only_media, published_in, ...otherFilters} = filters;

            if (exclude_attendance) {
                let queryFilters = exclude_attendance.split(',').forEach(val => {
                    let filterQS = val + 'ForSummit';
                    otherFilters[filterQS] = `${summitId},false`;
                });
            }

            if (only_media) {
                otherFilters['attendingMediaForSummit'] = `${summitId},true`;
            }

            if (published_in) {
                otherFilters['publishedIn'] = summitId;
            }

            return otherFilters;
        }

        buildQuery(page, forExport=false) {
            let {perPage, currentSummit} = this.props;
            let {sort, sortdir, search, ...filters} = this.fragmentParser.getParams();
            let queryFilters = {};
            let listFilters = {};

            if (!forExport && specs.pagination) {
                queryFilters = {limit: perPage};
                if (page != 1) {
                    queryFilters.offset = (page - 1) * perPage;
                }
            }

            if (search) {
                listFilters.search = decodeURIComponent(search);
            }

            if (filters) {
                let queryFilters = this.buildFiltersForQuery(filters, currentSummit.id);
                listFilters = {...listFilters, ...queryFilters}
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
            this.fragmentParser.setParam('search', term);
            window.location.hash   = this.fragmentParser.serialize();
            this.handleGetReport(1);
        }

        handleSort(index, key, dir, func) {

            this.fragmentParser.setParam('sort', key);
            this.fragmentParser.setParam('sortdir', dir);
            window.location.hash   = this.fragmentParser.serialize();

            this.handleGetReport(1);
        }

        handleExportReport(ev) {
            ev.preventDefault();
            let grouped = specs.hasOwnProperty('grouped') ? true : false;
            let query = this.buildQuery(1, true);
            let name = this.refs.childCmp.getName();

            this.props.exportReport(query, name, grouped, this.refs.childCmp.preProcessData);
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
            let {sort, sortdir, search, ...filters} = this.fragmentParser.getParams();

            if (specs.filters.includes('track')) {
                let filterValue = filters.hasOwnProperty('track') ? filters.track : null;
                filterHtml.push(
                    <div className="col-md-3" key="track-filter">
                        <TrackFilter value={filterValue} tracks={currentSummit.tracks} onChange={(value) => {this.handleFilterChange('track',value)}} isMulti/>
                    </div>
                );
            }

            if (specs.filters.includes('room')) {
                let filterValue = filters.hasOwnProperty('room') ? filters.room : null;
                filterHtml.push(
                    <div className="col-md-3" key="room-filter">
                        <RoomFilter value={filterValue} rooms={currentSummit.locations.filter(l => l.class_name == 'SummitVenueRoom')} onChange={(value) => {this.handleFilterChange('room',value)}} isMulti/>
                    </div>
                );
            }

            if (specs.filters.includes('published')) {
                let filterValue = filters.hasOwnProperty('published') ? filters.published : null;
                filterHtml.push(
                    <div className="col-md-3" key="published-filter">
                        <PublishedFilter value={filterValue} onChange={(value) => {this.handleFilterChange('published',value)}} />
                    </div>
                );
            }

            if (specs.filters.includes('published_in')) {
                let filterValue = filters.hasOwnProperty('published_in') ? filters.published_in : null;
                filterHtml.push(
                    <div className="col-md-3" key="published-in-filter">
                        <PublishedInFilter value={filterValue} onChange={(value) => {this.handleFilterChange('published_in',value)}} />
                    </div>
                );
            }

            if (specs.filters.includes('status')) {
                let filterValue = filters.hasOwnProperty('status') ? filters.status : null;
                filterHtml.push(
                    <div className="col-md-3" key="status-filter">
                        <StatusFilter value={filterValue} onChange={(value) => {this.handleFilterChange('status',value)}} />
                    </div>
                );
            }

            if (specs.filters.includes('attendance')) {
                let filterValue = filters.hasOwnProperty('exclude_attendance') ? filters.exclude_attendance : null;
                filterHtml.push(
                    <div className="col-md-3" key="attendance-filter">
                        <AttendanceFilter value={filterValue} onChange={(value) => {this.handleFilterChange('exclude_attendance',value)}} />
                    </div>
                );
            }

            if (specs.filters.includes('media')) {
                let filterValue = filters.hasOwnProperty('only_media') ? filters.only_media : null;
                filterHtml.push(
                    <div className="col-md-3" key="only-media-filter">
                        <MediaFilter value={filterValue} onChange={(value) => {this.handleFilterChange('only_media',value)}} />
                    </div>
                );
            }

            return filterHtml;
        }

        render() {
            let { match, currentPage, totalCount, perPage, currentSummit, exportData} = this.props;
            let {sort, sortdir, search, ...filters} = this.fragmentParser.getParams();
            let pageCount = Math.ceil(totalCount / perPage);
            let reportName = this.refs.childCmp ? this.refs.childCmp.getName() : 'report';
            let grouped = specs.hasOwnProperty('grouped') ? true : false;
            let searchPlaceholder =
                this.refs.childCmp && this.refs.childCmp.getSearchPlaceholder ?
                    this.refs.childCmp.getSearchPlaceholder() :
                    T.translate("reports.placeholders.search");

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
                                value={search}
                                placeholder={searchPlaceholder}
                                onSearch={this.handleSearch}
                            />
                        </div>
                        <div className="col-md-6 text-right">
                            <button className="btn btn-primary right-space" onClick={this.handleExportReport}>
                                {T.translate("reports.export")}
                            </button>

                            {exportData &&
                                <ExportData reportName={reportName} data={exportData} grouped={grouped} />
                            }
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
                            sortKey={sort}
                            sortDir={parseInt(sortdir)}
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
    connect(mapStateToProps, {getReport, exportReport, getMembersForEventCSV}),
    wrapReport
)

export default composedReportWrapper;
