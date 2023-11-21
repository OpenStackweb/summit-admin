/**
 * Copyright 2018 OpenStack Foundation
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

import React, {useEffect} from 'react'
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import ScheduleSettingsForm from '../../components/forms/schedule-settings-form';
import {
    getScheduleSetting,
    resetScheduleSettingsForm,
    saveScheduleSettings,
} from "../../actions/schedule-settings-actions";

import '../../styles/edit-schedule-settings-page.less'

const EditScheduleSettingsPage = ({currentSummit, match, scheduleSettings, entity, errors, ...props}) => {
    const scheduleSettingsId = match.params.schedule_settings_id;
    const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
    const breadcrumb = (entity.id) ? entity.key : T.translate("general.new");

    useEffect(() => {
        if (scheduleSettingsId) {
          props.getScheduleSetting(scheduleSettingsId);
        } else {
          props.resetScheduleSettingsForm();
        }
    }, [scheduleSettingsId]);

   const createKey = () => {
        const keys = scheduleSettings.map(ss => ss.key);
        let keyNumber = scheduleSettings.length;

        while (keys.includes(`schedule_${keyNumber}`)) {
            keyNumber++
        }

        return `schedule_${keyNumber}`;
    }

    if (!entity.id) {
        entity.key = createKey();
    }

    return(
      <div className="container">
          <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
          <h3>{title} {T.translate("edit_schedule_settings.schedule_settings")}</h3>
          <hr/>
          {currentSummit &&
            <ScheduleSettingsForm
              entity={entity}
              summit={currentSummit}
              errors={errors}
              onSubmit={props.saveScheduleSettings}
            />
          }
      </div>
    )
}

const mapStateToProps = ({ currentSummitState, scheduleSettingsState, baseState, scheduleSettingsListState }) => ({
    currentSummit : currentSummitState.currentSummit,
    loading: baseState.loading,
    scheduleSettings: scheduleSettingsListState.scheduleSettings,
    ...scheduleSettingsState
});

export default connect (
    mapStateToProps,
    {
        getScheduleSetting,
        resetScheduleSettingsForm,
        saveScheduleSettings,
    }
)(EditScheduleSettingsPage);
