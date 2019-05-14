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
import React from 'react';
import Select from 'react-select';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminDaySelector extends React.Component {

    constructor(props){
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(selectedOption){
        this.props.onDayChanged(selectedOption ? selectedOption.value : null);
    }

    render(){
        let { days, currentValue } = this.props;
        let theValue = days.find(op => op.value == currentValue);

        return (
            <Select
                placeholder={T.translate("schedule.placeholders.select_day")}
                className="day-selector"
                name="form-field-name"
                value={theValue}
                onChange={this.onChange}
                options={days}
            />
        )
    }
}

export default ScheduleAdminDaySelector;
