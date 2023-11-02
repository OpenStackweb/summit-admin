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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Dropdown, SimpleLinkList, Table, FreeTextSearch, DateTimePicker } from 'openstack-uicore-foundation/lib/components';
import { epochToMomentTimeZone } from 'openstack-uicore-foundation/lib/utils/methods';
import {shallowEqual} from "../../utils/methods";
import { Pagination } from 'react-bootstrap';

import './badge-form.less'
import Swal from "sweetalert2";


class BadgeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            printExcerptDetails: false,
            printFilters: {
                viewTypeFilter: [],
                printDateFilter: Array(2).fill(null),
            }
        };

        this.handleChangeBadgeType = this.handleChangeBadgeType.bind(this);
        this.handleChangePrintType = this.handleChangePrintType.bind(this);
        this.handleFeatureLink = this.handleFeatureLink.bind(this);
        this.handleFeatureUnLink = this.handleFeatureUnLink.bind(this);
        this.queryFeatures = this.queryFeatures.bind(this);
        this.handleShowPrintDetails = this.handleShowPrintDetails.bind(this);
        this.handleBadgePrintSearch = this.handleBadgePrintSearch.bind(this);
        this.handleBadgePrintSort = this.handleBadgePrintSort.bind(this);
        this.handleBadgePrintPageChange = this.handleBadgePrintPageChange.bind(this);
        this.handleBadgePrintExport = this.handleBadgePrintExport.bind(this);
        this.handleBadgePrintClear = this.handleBadgePrintClear.bind(this);
        this.handleBadgePrintFilterChange = this.handleBadgePrintFilterChange.bind(this);
        this.handleChangePrintDate = this.handleChangePrintDate.bind(this);
        this.handleApplyPrintFilters = this.handleApplyPrintFilters.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!shallowEqual(prevProps.entity, this.props.entity)) {
            this.setState({
                entity: { ...this.props.entity },
            });
        }
    }

    handleChangeBadgeType(ev) {
        const entity = {...this.state.entity};
        const {value, id} = ev.target;

        entity[id] = value;
        this.setState({entity: entity});
        this.props.onTypeChange(entity);
    }

    handleChangePrintType(ev) {
        const { value, id } = ev.target;
        this.props.onSelectPrintType(value);
    }

    handleFeatureLink(feature) {
        const {entity} = this.state;
        this.props.onFeatureLink(entity.ticket_id, feature);
    }

    handleFeatureUnLink(featureId) {
        const {entity} = this.state;
        this.props.onFeatureUnLink(entity.ticket_id, featureId);
    }

    handleShowPrintDetails(displayDetails){
        if (displayDetails === false) this.props.onShowBadgePrints();
        this.setState({...this.state, printExcerptDetails: !displayDetails});
    }

    handleBadgePrintSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.onBadgePrintQuery(term, page, perPage, order, orderDir);
    }

    handleBadgePrintSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.onBadgePrintQuery(term, page, perPage, key, dir);
    }

    handleBadgePrintPageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.onBadgePrintQuery(term, page, perPage, order, orderDir);
    }
    
    handleBadgePrintFilterChange(ev) {
        let { value, id} = ev.target        
        const newFilters = {...this.state.printFilters, [id]: value};
        this.setState({...this.state, printFilters: newFilters});
        const {term, order, orderDir, page, perPage} = this.props;
        this.props.onBadgePrintQuery(term, page, perPage, order, orderDir, newFilters);
    }

    handleChangePrintDate(ev, lastDate) {
        const {value} = ev.target;
        const {printDateFilter} = this.state.printFilters;

        const newDateValue = lastDate ? [printDateFilter[0], value.unix()] : [value.unix(), printDateFilter[1]];
        const newFilters = {...this.state.printFilters, printDateFilter: newDateValue};

        this.setState({...this.state, printFilters: newFilters});                
    }

    handleApplyPrintFilters(ev) {
        ev.preventDefault();
        const {printFilters} = this.state;
        const {term, order, orderDir, page, perPage} = this.props;
        this.props.onBadgePrintQuery(term, page, perPage, order, orderDir, printFilters);
    }

    handleBadgePrintExport(ev) {
        ev.preventDefault();
        this.props.onBadgePrintExport();
    }

    handleBadgePrintClear(ev) {
        const {entity} = this.state;
        const {clearBadgePrints} = this.props;

        ev.preventDefault();

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: `${T.translate("edit_ticket.clear_badge_prints_warning")}`,
            type: "warning",
            showCancelButton: true,
            cancelButtonColor: '#d33',
            confirmButtonColor: '#3085d6',
            confirmButtonText: T.translate("general.clear"),
        }).then(function (result) {
            if (result.value) {
                clearBadgePrints(entity.ticket_id);
            }
        })
    }

    queryFeatures(input, callback) {
        const {currentSummit} = this.props;
        const features = currentSummit.badge_features.filter(f => f.name.toLowerCase().indexOf(input.toLowerCase()) !== -1);
        callback(features);
    }

    render() {
        const {entity, printExcerptDetails, printFilters: {printDateFilter, viewTypeFilter}} = this.state;
        const { currentSummit, selectedPrintType, canPrint, 
            badgePrints: { badgePrints, order, orderDir, totalBadgePrints, term, currentPage, lastPage, perPage } } = this.props;

        if (!currentSummit.badge_types || !currentSummit.badge_features) return (<div/>);

        const badgeType = currentSummit.badge_types.find(bt => bt.id === entity.type_id);
        const access_levels = badgeType.access_levels.map(al => al.name).join(', ');

        const featuresColumns = [
            { columnKey: 'name', value: T.translate("edit_ticket.name") },
        ];

        const featuresOptions = {
            title: T.translate("edit_ticket.badge_features"),
            valueKey: "name",
            labelKey: "name",
            defaultOptions: true,
            actions: {
                search: this.queryFeatures,
                delete: { onClick: this.handleFeatureUnLink },
                add: { onClick: this.handleFeatureLink }
            }
        };

        const badge_type_ddl = currentSummit.badge_types.map(bt => ({ label: bt.name, value: bt.id }));

        // adds 'All' option to the print type dropdown
        const badge_view_type_ddl = [
            ...currentSummit.badge_types.find(bt => bt.id === entity.type_id).allowed_view_types.map(vt => ({ label: vt.name, value: vt.id }))
        ];

        const badge_print_columns = [
            { columnKey: 'view_type_name', value: T.translate("edit_ticket.print_table.view_type_name")},
            { columnKey: 'requestor_full_name', value: T.translate("edit_ticket.print_table.requestor_full_name"), sortable: true},
            { columnKey: 'requestor_email', value: T.translate("edit_ticket.print_table.requestor_email"), sortable: true},
            { columnKey: 'print_date', value: T.translate("edit_ticket.print_table.print_date"), sortable: true}
        ];

        const badge_print_table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: () => null },
            }
        };

        const renderInput = ( props, openCalendar, closeCalendar ) => {
            function clear(ev){
                ev.preventDefault();
                props.onChange({target: {value: ''}});
            }
            return (
                <div className='badge-print-datepicker'>
                    <input {...props} />
                    <i onClick={clear} className='fa fa-times'></i>
                </div>
            );
        }

        return (
            <form className="badge-form">
                <input type="hidden" id="badge_id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_ticket.type")}</label>
                        <Dropdown
                            id="type_id"
                            value={entity.type_id}
                            onChange={this.handleChangeBadgeType}
                            options={badge_type_ddl}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_ticket.access_levels")}:&nbsp;</label>
                        {access_levels}
                    </div>
                </div>
                {badgeType.access_levels.some(al => al.name.includes('IN_PERSON')) &&
                    <div className="row form-group">
                        <div className={`badge-print-wrapper ${printExcerptDetails ? 'col-md-12' : 'col-md-4'}`}>
                            {Object.keys(entity.print_excerpt).length > 0 &&
                            <>
                                <label> {T.translate("edit_ticket.print_excerpt")}:&nbsp;</label>
                                {printExcerptDetails ? 
                                <>
                                    <div className='row'>
                                        <div className='col-md-6'>
                                            <FreeTextSearch
                                                value={term ?? ''}
                                                placeholder={T.translate("edit_ticket.placeholders.search_badge_prints")}
                                                preventEvents={true}
                                                onSearch={this.handleBadgePrintSearch}
                                            />
                                        </div>
                                        <div className='col-md-4'>
                                            <button className="btn btn-default right-space" onClick={this.handleBadgePrintExport}>
                                                {T.translate("general.export")}
                                            </button>
                                            <button className="btn btn-danger" onClick={this.handleBadgePrintClear}>
                                                {T.translate("general.clear")}
                                            </button>
                                        </div>
                                    </div>
                                    <div className='row filter-wrapper'>
                                        <div className='col-md-4'>
                                            <Dropdown
                                                id="viewTypeFilter"
                                                value={viewTypeFilter}
                                                onChange={this.handleBadgePrintFilterChange}
                                                placeholder={T.translate("edit_ticket.placeholders.view_type_filter")}
                                                options={badge_view_type_ddl}
                                                clearable
                                                isMulti
                                            />
                                        </div>
                                        <div className='col-md-7 col-md-offset-1 date-wrapper'>
                                            <DateTimePicker
                                                id="printDateFromFilter"
                                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}                                    
                                                inputProps={{placeholder: T.translate("edit_ticket.placeholders.print_date_from")}}
                                                timezone={currentSummit.time_zone_id}
                                                onChange={(ev) => this.handleChangePrintDate(ev, false)}
                                                value={epochToMomentTimeZone(printDateFilter[0], currentSummit.time_zone_id)}
                                                className={'badge-print-date-picker'}
                                                renderInput={renderInput}
                                            />
                                            <DateTimePicker
                                                id="printDateToFilter"
                                                format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                                inputProps={{placeholder: T.translate("edit_ticket.placeholders.print_date_to")}}
                                                timezone={currentSummit.time_zone_id}
                                                onChange={(ev) => this.handleChangePrintDate(ev, true)}
                                                value={epochToMomentTimeZone(printDateFilter[1], currentSummit.time_zone_id)}
                                                className={'badge-print-date-picker'}
                                                renderInput={renderInput}
                                            />
                                            <button className='btn btn-default' onClick={this.handleApplyPrintFilters}>
                                                {T.translate("edit_ticket.apply_filters")}
                                            </button>
                                        </div>
                                    </div>
                                    {badgePrints.length === 0 &&
                                        <div>{T.translate("edit_ticket.no_prints")}</div>
                                    }
                                    {badgePrints.length > 0 &&
                                    <div>
                                        <Table
                                            options={badge_print_table_options}
                                            data={badgePrints}
                                            columns={badge_print_columns}
                                            onSort={this.handleBadgePrintSort}
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
                                            onSelect={this.handleBadgePrintPageChange}
                                        />
                                    </div>
                                    }
                                </>
                                :
                                <table className="table table-striped table-bordered">
                                    <thead>
                                        <tr>
                                            <th>{T.translate("edit_ticket.type")}</th>
                                            <th>{T.translate("edit_ticket.count")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(entity.print_excerpt).map((row, i) => {
                                            let rowClass = i % 2 === 0 ? 'even' : 'odd';
                                            return (
                                                <tr id={row} key={'row_' + row} role="row" className={rowClass}>
                                                    <td>{row}</td>
                                                    <td>{entity.print_excerpt[row]}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                }
                                <span className='details' onClick={() => this.handleShowPrintDetails(printExcerptDetails)}>
                                   {printExcerptDetails ?
                                       T.translate("edit_ticket.print_excerpt_less") :
                                       T.translate("edit_ticket.print_excerpt_details")}
                                </span>
                            </>
                            }
                        </div>
                        <div className='col-md-4'>
                            <label>&nbsp;</label>
                            <Dropdown
                                id="type_id"
                                value={selectedPrintType}
                                onChange={this.handleChangePrintType}
                                options={badge_view_type_ddl}
                            />
                        </div>
                        <div className="col-md-4">
                            <label>&nbsp;</label><br />
                            <button onClick={this.props.onPrintBadge} disabled={!canPrint || selectedPrintType === null} className="btn btn-default">
                                {T.translate("edit_ticket.print")}
                            </button>
                        </div>
                    </div>
                }

                <hr />
                {entity.id !== 0 &&
                    <SimpleLinkList
                        values={entity.features}
                        columns={featuresColumns}
                        options={featuresOptions}
                    />
                }

            </form>
        );
    }
}

export default BadgeForm;
