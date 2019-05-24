import React from 'react';
import {connect} from "react-redux";
import { compose } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch } from 'openstack-uicore-foundation/lib/components'
import {exportReport, getReport} from "../../actions/report-actions";
import T from "i18n-react/dist/i18n-react";

const wrapReport = (ReportComponent, buildReportQuery, reportName) => {
    class ReportBase extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                searchTerm: null,
                sortKey: null,
                sortDir: null
            };

            this.buildQuery = this.buildQuery.bind(this);
            this.handleSort = this.handleSort.bind(this);
            this.handlePageChange = this.handlePageChange.bind(this);
            this.handleSearch = this.handleSearch.bind(this);
            this.handleExportReport = this.handleExportReport.bind(this);
        }

        componentWillMount () {
            if (!this.props.currentSummit) return;

            let query = this.buildQuery(1);
            this.props.getReport(query, reportName, 1);
        }

        componentWillReceiveProps (newProps) {
            if (!newProps.currentSummit) return;
            if (this.props.currentSummit.id != newProps.currentSummit.id) {
                this.setState({searchTerm: null});
                let query = this.buildQuery(1);
                this.props.getReport(query, reportName, 1);
            }
        }

        buildQuery(page, forExport=false) {
            let {perPage, currentSummit} = this.props;
            let {searchTerm, sortKey, sortDir} = this.state;
            let filters = {};
            let listFilters = {summitId: currentSummit.id};

            if (!forExport) {
                filters = {limit: perPage};
                if (page != 1) {
                    filters.offset = page * perPage;
                }
            }

            if (sortKey) {
                let order = (sortDir == 1) ? '' : '-';
                filters.ordering = order + '' + sortKey;
            }

            if (searchTerm) {
                listFilters.search = searchTerm;
            }

            let query = buildReportQuery(filters, listFilters, currentSummit.id);

            return query;
        }

        handlePageChange(page) {
            let query = this.buildQuery(page);
            this.props.getReport(query, reportName, page);
        }

        handleSearch(term) {
            this.setState({searchTerm: term}, () => {
                let query = this.buildQuery(1);
                this.props.getReport(query, reportName, 1);
            });
        }

        handleSort(index, key, dir, func) {

            this.setState({sortKey: key, sortDir: dir}, () => {
                let query = this.buildQuery(1);
                this.props.getReport(query, reportName, 1);
            });

        }

        handleExportReport(ev) {
            ev.preventDefault();

            let query = this.buildQuery(1, true);
            this.props.exportReport(query, reportName);
        }

        render() {
            let {data, match, currentPage, totalCount, perPage} = this.props;
            let {searchTerm} = this.state;
            let lastPage = Math.floor(totalCount / perPage);

            return (
                <div className="container large">
                    <Breadcrumb data={{ title: T.translate(`reports.${reportName}`), pathname: match.url }} ></Breadcrumb>
                    <div className="row">
                        <div className="col-md-8">
                            <h3>{T.translate(`reports.${reportName}`)}</h3>
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

                    <div className="report-container">
                        <ReportComponent data={data} totalCount={totalCount} onSort={this.handleSort} />
                    </div>

                    <Pagination
                        bsSize="medium"
                        prev
                        next
                        ellipsis={false}
                        boundaryLinks={false}
                        maxButtons={10}
                        items={lastPage}
                        activePage={currentPage}
                        onSelect={this.handlePageChange}
                    />
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
