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
import { FormGroup, FormControl } from 'react-bootstrap';
import DateTimePicker from '../datetimepicker'
import moment from "moment-timezone";
import ScheduleAdminVenueSelector from '../schedule-builder/schedule-admin-venue-selector';

class SummitEventBulkEditorItem extends React.Component
{
    constructor(props){
        super(props);

        this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
        this.handleChangeDateTo   = this.handleChangeDateTo.bind(this);
        this.onTitleChanged       = this.onTitleChanged.bind(this);
        this.onLocationChanged    = this.onLocationChanged.bind(this);
    }

    getFormattedTime(atime) {
        if(!atime) return atime;
        atime = atime * 1000;
        return moment(atime).tz(this.props.currentSummit.time_zone.name);
    }

    getValidationEventTitle(){
        let { event } = this.props;
        let isValid = this.validateEventTitle(event.title);
        return isValid ? 'success':'warning';
    }

    validateEventTitle(title){
        return title.trim() != '';
    }

    getValidationStateVenue(){
        return null;
    }

    getValidationStartDate(){
        let { event } = this.props;
        let isValid = this.validateEventStartDate(event.start_date);
        return isValid ? 'success':'warning';
    }

    validateEventStartDate(startDate){
        let { event, currentSummit } = this.props;
        startDate           = moment.tz(startDate* 1000, currentSummit.time_zone.name);
        let endDate         = moment.tz(event.end_date * 1000, currentSummit.time_zone.name);
        let summitStartDate = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name);
        return moment.isMoment(startDate) && startDate.isAfter(summitStartDate) && startDate.isBefore(endDate);
    }

    getValidationEndDate(){
        let { event } = this.props;
        let isValid = this.validateEventEndDate(event.end_date);
        return isValid ? 'success':'warning';
    }

    validateEventEndDate(endDate){
        let { event, currentSummit } = this.props;
        let startDate       = moment.tz(event.start_date * 1000, currentSummit.time_zone.name);
        endDate             = moment.tz(endDate * 1000, currentSummit.time_zone.name);
        let summitEndDate   = moment.tz(currentSummit.end_date * 1000, currentSummit.time_zone.name);
        return endDate.isAfter(startDate) && (endDate.isBefore(summitEndDate) || endDate.isSame(summitEndDate));
    }

    handleChangeDateFrom(ev){
        let {value, id} = ev.target;
        value = value.valueOf()/1000;
        this.props.onStartDateChanged(this.props.index, value, this.validateEventStartDate(value));
    }

    handleChangeDateTo(ev){
        let {value, id} = ev.target;
        value = value.valueOf()/1000;
        this.props.onEndDateChanged(this.props.index, value, this.validateEventEndDate(value));
    }

    onTitleChanged(ev){
        let title = ev.target.value.trim();
        this.props.onTitleChanged(this.props.index, title, this.validateEventTitle(title))
    }

    onLocationChanged(location){
        this.props.onLocationChanged(this.props.index, location, true);
    }

    render(){
        let { event, currentSummit, venuesOptions } = this.props;
        let currentLocation       = venuesOptions.filter((option) => option.value.id == event.location_id).shift()
        let currenSummitStartDate = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(0).minute(0).second(0);
        let currenSummitEndDate   = moment.tz(currentSummit.end_date * 1000, currentSummit.time_zone.name).hour(23).minute(59).second(59);

        return (
            <div className="row event-bulk-editor-item">
                <div className="col-md-1">
                    <a className="event-edit" href="#">{event.id}</a>
                </div>
                <div className="col-md-4">
                    <FormGroup validationState={this.getValidationEventTitle()}>
                        <FormControl
                            type="text"
                            placeholder="Enter Event Title"
                            onChange={this.onTitleChanged}
                            defaultValue={event.title}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
                <div className="col-md-2">
                    <FormGroup validationState={this.getValidationStateVenue()}>
                        <ScheduleAdminVenueSelector
                            onVenueChanged={this.onLocationChanged}
                            currentValue={currentLocation}
                            venues={venuesOptions}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
                <div className="col-md-2">
                    <FormGroup validationState={this.getValidationStartDate()}>
                        <DateTimePicker
                            id="start_date"
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            inputProps={{placeholder: 'Start Date'}}
                            timezone={currentSummit.time_zone.name}
                            timeConstraints={{ hours: { min: 7, max: 22}}}
                            validation={{after: currenSummitStartDate.valueOf()/1000, before: currenSummitEndDate.valueOf()/1000}}
                            onChange={this.handleChangeDateFrom}
                            defaultValue={this.getFormattedTime(event.start_date)}
                        />
                        <FormControl.Feedback/>
                    </FormGroup>
                </div>
                <div className="col-md-2">
                    <FormGroup validationState={this.getValidationEndDate()}>
                        <DateTimePicker
                            id="end_date"
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timeConstraints={{ hours: { min: 7, max: 22}}}
                            inputProps={{placeholder: 'End Date'}}
                            timezone={currentSummit.time_zone.name}
                            validation={{after: currenSummitStartDate.valueOf()/1000, before: currenSummitEndDate.valueOf()/1000}}
                            onChange={this.handleChangeDateTo}
                            defaultValue={this.getFormattedTime(event.end_date)}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
            </div>
        )
    }
}

export default SummitEventBulkEditorItem;