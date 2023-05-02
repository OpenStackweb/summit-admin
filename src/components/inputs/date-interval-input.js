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
import moment from 'moment-timezone';
import { DateTimePicker } from "openstack-uicore-foundation/lib/components";

const HourIntervalInput = ({ onChange, onClear, fromDate, toDate, fromId, toId, timezone = 'UTC' }) => {

  const handleClear = () => {
    onClear();
  }

  const handleChangeTime = (ev) => {
    let { value, id } = ev.target;
    onChange({ target: { value: value.format('HHmm'), id } });
  }

  return (
    <div className="inline">
      From: &nbsp;&nbsp;
      <DateTimePicker
        id={fromId}
        onChange={handleChangeTime}
        format={{ date: false, time: "HH:mm" }}
        value={moment(`${fromDate}`.length === 3 ? `0${fromDate}` : fromDate, 'HHmm')}
        timezone={timezone}
      />
      &nbsp;&nbsp;To:&nbsp;&nbsp;
      <DateTimePicker
        id={toId}
        onChange={handleChangeTime}
        validation={{ before: moment(`${fromDate}`.length === 3 ? `0${fromDate}` : fromDate, 'HHmm'), after: '>' }}
        format={{ date: false, time: "HH:mm" }}
        value={moment(`${toDate}`.length === 3 ? `0${toDate}` : toDate, 'HHmm')}
        timezone={timezone}
      />
      &nbsp;&nbsp;
      <button type="button" className="btn btn-danger" onClick={handleClear}>Clear</button>
    </div>
  );
}

export default HourIntervalInput;
