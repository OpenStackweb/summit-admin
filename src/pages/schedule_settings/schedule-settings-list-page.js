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
import Swal from "sweetalert2";
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getAllScheduleSettings, deleteScheduleSetting, seedDefaultScheduleSettings } from "../../actions/schedule-settings-actions";

class ScheduleSettingsListPage extends React.Component {
    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getAllScheduleSettings();
        }
    }

    handleEdit = (schedule_settings_id) => {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/schedule-settings/${schedule_settings_id}`);
    }

    handleDelete = (scheduleSettingId) => {
        const {deleteScheduleSetting, scheduleSettings} = this.props;
        let scheduleSetting = scheduleSettings.find(t => t.id === scheduleSettingId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("schedule_settings_list.remove_warning") + ' ' + scheduleSetting.key,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteScheduleSetting(scheduleSettingId);
            }
        });
    }

    handleSort = (index, key, dir, func) => {
        this.props.getAllScheduleSettings(key, dir);
    }

    isNotDefault = (id) => {
        const {scheduleSettings} = this.props;
        let scheduleSetting = scheduleSettings.find(e => e.id === id);

        return !scheduleSetting.is_default;
    }

    handleNewScheduleSetting = (ev) => {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/schedule-settings/new`);
    }

    handleSeedDefaults = () => {
        this.props.seedDefaultScheduleSettings();
    }

    render(){
        const {currentSummit, scheduleSettings, order, orderDir, totalScheduleSettings} = this.props;

        const columns = [
            { columnKey: 'key', value: T.translate("edit_schedule_settings.key") },
            { columnKey: 'is_enabled_str', value: T.translate("edit_schedule_settings.enabled") },
            { columnKey: 'is_my_schedule_str', value: T.translate("edit_schedule_settings.is_my_schedule") },
            { columnKey: 'is_access_level_str', value: T.translate("edit_schedule_settings.access_levels_only") },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete, display: this.isNotDefault }
            }
        }

        if(!currentSummit.id) return null;

        return(
            <div className="container">
                <h3> {T.translate("schedule_settings_list.schedule_settings")} ({totalScheduleSettings})</h3>
                <div className="row">
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewScheduleSetting}>
                            {T.translate("schedule_settings_list.add_schedule_settings")}
                        </button>
                        <button className="btn btn-default" onClick={this.handleSeedDefaults}>
                            {T.translate("schedule_settings_list.seed_defaults")}
                        </button>
                    </div>
                </div>

                {scheduleSettings.length === 0 &&
                <div>{T.translate("schedule_settings_list.no_schedule_settings")}</div>
                }

                {scheduleSettings.length > 0 &&
                    <Table
                        options={table_options}
                        data={scheduleSettings}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, scheduleSettingsListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...scheduleSettingsListState
})

export default connect (
    mapStateToProps,
    {
        getAllScheduleSettings,
        deleteScheduleSetting,
        seedDefaultScheduleSettings
    }
)(ScheduleSettingsListPage);
