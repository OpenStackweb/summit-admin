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
import { FreeTextSearch, Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getMarketingSettings, deleteSetting } from "../../actions/marketing-actions";

class MarketingSettingListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewSetting = this.handleNewSetting.bind(this);
        this.handleDeleteSetting = this.handleDeleteSetting.bind(this);

        this.state = {
        }
    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getMarketingSettings();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getMarketingSettings();
        }
    }

    handleEdit(setting_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/marketing/${setting_id}`);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getMarketingSettings(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getMarketingSettings(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getMarketingSettings(term, page, perPage, order, orderDir);
    }

    handleNewSetting(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/marketing/new`);
    }

    handleDeleteSetting(settingId) {
        let {deleteSetting, settings} = this.props;
        let setting = settings.find(s => s.id == settingId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("marketing.delete_setting_warning") + ' ' + setting.name,
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

    render(){
        let {currentSummit, settings, lastPage, currentPage, term, order, orderDir, totalSettings} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'name', value: T.translate("marketing.name"), sortable: true },
            { columnKey: 'type', value: T.translate("marketing.type") },
            { columnKey: 'value', value: T.translate("marketing.value")},
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDeleteSetting }
            }
        }

        if(!currentSummit.id) return(<div></div>);

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
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewSetting}>
                            {T.translate("marketing.add_setting")}
                        </button>
                    </div>
                </div>

                {settings.length == 0 &&
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

const mapStateToProps = ({ currentSummitState, marketingSettingListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...marketingSettingListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getMarketingSettings,
        deleteSetting,
    }
)(MarketingSettingListPage);
