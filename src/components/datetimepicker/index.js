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
import './datetimepicker.less';
import Datetime from 'react-datetime';
import moment from 'moment-timezone';

export default class DateTimePicker extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(date) {
        this.setState({
            value: date.format('YYYY-MM-DD HH:mm:ss')
        });

        let ev = {target: {
            id: this.props.id,
            value: moment.utc(date).unix(),
            type: 'datetime'
        }};

        this.props.onChange(ev);
    }

    isValidDate(compareDateAfter, compareDateBefore, selectedDate, currentDate) {
        currentDate = (typeof currentDate == 'string') ? moment(currentDate) : currentDate;
        if (compareDateAfter == '<')
            return (selectedDate < moment(compareDateBefore));
        else if(compareDateAfter == '>')
            return (selectedDate > moment(compareDateBefore));
        else
            return (selectedDate >= moment(compareDateAfter) && selectedDate <= moment(compareDateBefore));
    }

    render() {
        let validate = (typeof this.props.validation != 'undefined');
        let {onChange, id, value, format, ...rest} = this.props;

        return (
            <div>
                {validate ? (
                    <Datetime
                        isValidDate={this.isValidDate.bind(this, this.props.validation.after, this.props.validation.before)}
                        onChange={this.handleChange}
                        dateFormat={format.date}
                        timeFormat={format.time}
                        value={this.state.value}
                        {...rest}
                    />
                ) : (
                    <Datetime
                        onChange={this.handleChange}
                        dateFormat={format.date}
                        timeFormat={format.time}
                        value={this.state.value}
                        {...rest}
                    />
                )}
            </div>
        );
    }
}