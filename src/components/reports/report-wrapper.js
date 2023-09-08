import React from 'react';
import {connect} from "react-redux";
import { compose } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { Pagination } from 'react-bootstrap';
import {AjaxLoader, FreeTextSearch} from 'openstack-uicore-foundation/lib/components'
import {exportReport, getReport, getMetricRaw} from "../../actions/report-actions";
import T from "i18n-react/dist/i18n-react";
import FragmentParser from "../../utils/fragmen-parser";
import { getMembersForEventCSV } from '../../actions/member-actions'
import {TrackFilter, TypeFilter, RoomFilter, PublishedFilter, PublishedInFilter, StatusFilter, AttendanceFilter, MediaFilter} from '../filters'
import ExportData from '../export'
import {getOrderExtraQuestions} from "../../actions/order-actions";
import {getBadgeFeatures} from "../../actions/badge-actions";


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

            if (!specs?.preventInitialLoad) {
                this.handleGetReport(1);
            }
        }

        buildFiltersForQuery(filters, summitId) {
            let {exclude_attendance, only_media, published_in, ...otherFilters} = filters;

            if (exclude_attendance) {
                let filterQS = exclude_attendance + 'ForSummit';
                otherFilters[filterQS] = `${summitId},true`;
            }

            if (only_media) {
                otherFilters['attendingMediaForSummit'] = `${summitId},true`;
            }

            if (published_in) {
                otherFilters['publishedIn'] = summitId;
            }
            
            if (this.refs.childCmp.translateFilters) {
                return this.refs.childCmp.translateFilters(otherFilters);
            }

            return otherFilters;
        }

        buildQuery(page, perPageOverride = null) {
            let {perPage, currentSummit} = this.props;
            let {sort, sortdir, search, ...filters} = this.fragmentParser.getParams();
            let queryFilters = {};
            let listFilters = {};
            perPage = perPageOverride || perPage;

            if (specs.pagination) {
                queryFilters = {limit: perPage};
                if (page !== 1) {
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

            let query = this.refs.childCmp.buildReportQuery(queryFilters, listFilters, sort, sortdir);

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
            let grouped = specs.hasOwnProperty('grouped');
            let name = this.refs.childCmp.getName();
            this.props.exportReport(this.buildQuery, name, grouped, this.refs.childCmp.preProcessData.bind(this.refs.childCmp));
        }

        handleGetReport(page) {
            let query = this.buildQuery(page);
            let name = this.refs.childCmp.getName();
            this.props.getReport(query, name, page);
        }

        handleFilterChange = (filter, value, isMulti = false) => {
            const theValue = isMulti ? value.join(',') : value;

            this.fragmentParser.setParam(filter, theValue);
            window.location.hash   = this.fragmentParser.serialize();
            this.handleReload()
        }

        renderFilters() {
            const {currentSummit} = this.props;
            let filterHtml = [];
            let {sort, sortdir, search, ...filters} = this.fragmentParser.getParams();

            if (specs.filters.includes('track')) {
                let filterValue = filters.hasOwnProperty('track') ? filters.track : null;
                filterHtml.push(
                    <div className="col-md-3" key="track-filter">
                        <TrackFilter value={filterValue} tracks={currentSummit.tracks} onChange={(value) => {this.handleFilterChange('track',value, true)}} isMulti/>
                    </div>
                );
            }

            if (specs.filters.includes('type')) {
                let filterValue = filters.hasOwnProperty('type') ? filters.type : null;
                filterHtml.push(
                    <div className="col-md-3" key="type-filter">
                        <TypeFilter value={filterValue} types={currentSummit.event_types} onChange={(value) => {this.handleFilterChange('type',value, true)}} isMulti/>
                    </div>
                );
            }

            if (specs.filters.includes('room')) {
                let filterValue = filters.hasOwnProperty('room') ? filters.room : null;
                filterHtml.push(
                    <div className="col-md-3" key="room-filter">
                        <RoomFilter value={filterValue} rooms={currentSummit.locations.filter(l => l.class_name === 'SummitVenueRoom')} onChange={(value) => {this.handleFilterChange('room',value, true)}} isMulti/>
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
            const { match, currentPage, totalCount, perPage, exportData, exportingReport, exportProgress} = this.props;
            let {sort, sortdir, search, ...filters} = this.fragmentParser.getParams();
            let pageCount = Math.ceil(totalCount / perPage);
            let reportName = this.refs.childCmp ? this.refs.childCmp.getName() : 'report';
            let grouped = specs.hasOwnProperty('grouped');
            let searchPlaceholder =
                this.refs.childCmp && this.refs.childCmp.getSearchPlaceholder ?
                    this.refs.childCmp.getSearchPlaceholder() :
                    T.translate("reports.placeholders.search");
            
            return (
                <div className="container large">
                    <Breadcrumb data={{ title:reportName, pathname: match.url }} />
                    <AjaxLoader show={ exportingReport } size={ 120 }>
                        <span style={{color: 'black', fontSize: 20}}>
                            Fetching: {exportProgress} of {totalCount}
                        </span>
                    </AjaxLoader>
                    <div className="row">
                        <div className="col-md-8">
                            <h3>{reportName}</h3>
                        </div>
                    </div>
                    <hr/>
                    <div className={'row'}>
                        <div className={'col-md-6'}>
                            <FreeTextSearch
                                value={search || ''}
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
                            filters={filters}
                            onFilterChange={this.handleFilterChange}
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
    connect(
      mapStateToProps,
      {getReport, exportReport, getMembersForEventCSV, getMetricRaw, getOrderExtraQuestions, getBadgeFeatures}
    ),
    wrapReport
)

export default composedReportWrapper;
