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
import {FreeTextSearch, SummitDropdown, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getMarketingSettings, deleteSetting, cloneMarketingSettings } from "../../actions/marketing-actions";

import '../../styles/table.less';

class MarketingSettingListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewSetting = this.handleNewSetting.bind(this);
        this.handleDeleteSetting = this.handleDeleteSetting.bind(this);
        this.handleCloneSettings = this.handleCloneSettings.bind(this);

        this.state = {
        }
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getMarketingSettings();
        }
    }

    handleEdit(setting_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/marketing/${setting_id}`);
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getMarketingSettings(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getMarketingSettings(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getMarketingSettings(term, page, perPage, order, orderDir);
    }

    handleNewSetting(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/marketing/new`);
    }

    handleDeleteSetting(settingId) {
        const {deleteSetting, settings} = this.props;
        let setting = settings.find(s => s.id === settingId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("marketing.delete_setting_warning") + ' ' + setting.key,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSetting(settingId);
            }
        });
    }

    handleCloneSettings(summitId) {
        const {cloneMarketingSettings} = this.props;

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("marketing.clone_settings_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("marketing.yes_clone")
        }).then(function(result){
            if (result.value) {
                cloneMarketingSettings(summitId);
            }
        });
    }

    render(){
        const {currentSummit, allSummits, settings, lastPage, currentPage, term, order, orderDir, totalSettings} = this.props;
        const summits = allSummits.filter(s => s.id !== currentSummit.id);

        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'key', value: T.translate("marketing.key"), sortable: true },
            { columnKey: 'type', value: T.translate("marketing.type") },
            { columnKey: 'value', value: T.translate("marketing.value"), title: true},
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            className: 'marketing-table',
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDeleteSetting }
            }
        }

        if(!currentSummit.id) return(<div />);

        return(
            <div className="container">
                <h3> {T.translate("marketing.setting_list")} ({totalSettings})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("marketing.placeholders.search_settings")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-2 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewSetting}>
                            {T.translate("marketing.add_setting")}
                        </button>
                    </div>
                    <div className="col-md-4 text-right">
                        <SummitDropdown
                            summits={summits}
                            onClick={this.handleCloneSettings}
                            actionLabel={T.translate("marketing.clone_settings")}
                        />
                    </div>
                </div>

                {settings.length === 0 &&
                <div>{T.translate("marketing.no_settings")}</div>
                }

                {settings.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={settings}
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

const mapStateToProps = ({ currentSummitState, directoryState, marketingSettingListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    allSummits      : directoryState.allSummits,
    ...marketingSettingListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getMarketingSettings,
        deleteSetting,
        cloneMarketingSettings
    }
)(MarketingSettingListPage);
