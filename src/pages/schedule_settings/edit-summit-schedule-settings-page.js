/**
 * Copyright 2021 OpenStack Foundation
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
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import EditLabelSlider from "../../components/inputs/edit-label-slider";
import { RadioList } from 'openstack-uicore-foundation/lib/components'

import {
    getScheduleSettings,
    saveScheduleSetting,
    saveEventColorOrigin,
    SCHEDULE_SETTING_ENABLED_TYPE,
    SCHEDULE_SETTING_LABEL_TYPE
} from "../../actions/schedule-settings-actions";

class EditSummitScheduleSettingsPage extends React.Component {

    constructor(props) {
        super(props);
        this.onFilterValueChanged = this.onFilterValueChanged.bind(this);
        this.onFilterStatusChanged = this.onFilterStatusChanged.bind(this);
        this.handleChangeRadioList = this.handleChangeRadioList.bind(this);
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getScheduleSettings();
        }
    }

    handleChangeRadioList(ev){
        let {value, id} = ev.target;
        this.props.saveEventColorOrigin(value);
    }

    onFilterValueChanged(id, val){
        let filter = this.props.filters[id];
        this.props.saveScheduleSetting(id, SCHEDULE_SETTING_LABEL_TYPE, filter, val);
    }

    onFilterStatusChanged(id, val){
      let filter = this.props.filters[id];
      this.props.saveScheduleSetting(id, SCHEDULE_SETTING_ENABLED_TYPE, filter, val);
    }

    render(){
        const {currentSummit, filters, match} = this.props;

        if(!currentSummit.id) return(<div />);
        return (
            <>
                <Breadcrumb data={{ title: T.translate("schedule_settings.schedule_settings"), pathname: match.url }} />
                <div className="container">
                    <hr/>
                    <h3> {T.translate("schedule_settings.filter_title")}</h3>
                    <h5> {T.translate("schedule_settings.filter_subtitle")}</h5>
                    <div className="row">
                    {
                        Object.keys(filters).map((key) =>{
                            let filter = filters[key];
                            return(
                                <div className="col-md-6" key={key}>
                                    <EditLabelSlider
                                        checked={filter.checked}
                                        value={filter.value}
                                        id={key}
                                        onStatusChanged={this.onFilterStatusChanged}
                                        onValueChanged={this.onFilterValueChanged}
                                    />
                                </div>
                            );
                        })
                    }
                    </div>
                    <hr/>
                    <h3> {T.translate("schedule_settings.color_title")}</h3>
                    <h5> {T.translate("schedule_settings.color_subtitle")}</h5>
                    <div className="row">
                        <div className="col-md-12">
                            <RadioList
                                id={this.props.eventColorOrigin.key}
                                value={this.props.eventColorOrigin.value}
                                options={this.props.eventColorOrigins}
                                onChange={this.handleChangeRadioList}
                                inline
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = ({ currentSummitState, scheduleSettingState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...scheduleSettingState,
});

export default connect (
    mapStateToProps,
    {
        getScheduleSettings,
        saveScheduleSetting,
        saveEventColorOrigin
    }
)(EditSummitScheduleSettingsPage);