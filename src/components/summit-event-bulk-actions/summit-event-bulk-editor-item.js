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
import { DateTimePicker, SummitVenuesSelect } from 'openstack-uicore-foundation/lib/components'
import {SummitEvent} from "openstack-uicore-foundation/lib/models";
import moment from "moment-timezone";
import T from 'i18n-react/dist/i18n-react'
import Select from "react-select";

class SummitEventBulkEditorItem extends React.Component
{
    constructor(props){
        super(props);
        this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
        this.handleChangeDateTo   = this.handleChangeDateTo.bind(this);
        this.onTitleChanged       = this.onTitleChanged.bind(this);
        this.onLocationChanged    = this.onLocationChanged.bind(this);
        this.onSelectedEvent      = this.onSelectedEvent.bind(this);
        this.onSelectionPlanChanged = this.onSelectionPlanChanged.bind(this);
    }

    onSelectedEvent(evt){
        evt.stopPropagation();
        evt.preventDefault();
        this.props.onSelectedEvent(this.props.event);
    }

    getFormattedTime(atime) {
        if(atime == null) return '';
        if(!atime) return atime;
        atime = atime * 1000;
        return moment(atime).tz(this.props.currentSummit.time_zone.name);
    }

    getValidationEventTitle(){
        let { event, currentSummit } = this.props;
        let eventModel = new SummitEvent(event, currentSummit)
        let isValid    = eventModel.isValidTitle(event.title);
        return isValid ? 'success':'warning';
    }

    getValidationEventSelectionPlan(){
        return null;
    }

    getValidationStateVenue(){
        return null;
    }

    getValidationStartDate(){
        let { event, currentSummit } = this.props;
        let eventModel = new SummitEvent(event, currentSummit);
        let isValid    = eventModel.isValidStartDate(event.start_date);
        return isValid ? 'success':'warning';
    }

    getValidationEndDate(){
        let { event, currentSummit } = this.props;
        let eventModel = new SummitEvent(event, currentSummit);
        let isValid    = eventModel.isValidEndDate(event.end_date);
        return isValid ? 'success':'warning';
    }

    handleChangeDateFrom(ev){
        let {value, id} = ev.target;
        value = value.valueOf()/1000;
        let { event, currentSummit } = this.props;
        let eventModel = new SummitEvent(event, currentSummit);
        this.props.onStartDateChanged(this.props.index, value, eventModel.isValidStartDate(value));
    }

    handleChangeDateTo(ev){
        let {value, id} = ev.target;
        value = value.valueOf()/1000;
        let { event, currentSummit } = this.props;
        let eventModel = new SummitEvent(event, currentSummit);
        this.props.onEndDateChanged(this.props.index, value, eventModel.isValidEndDate(value));
    }

    onTitleChanged(ev){
        let title = ev.target.value.trim();
        let { event, currentSummit } = this.props;
        let eventModel = new SummitEvent(event, currentSummit);
        this.props.onTitleChanged(this.props.index, title, eventModel.isValidTitle(title))
    }

    onLocationChanged(location){
        let isValid = location == null ? false:true;
        this.props.onLocationChanged(this.props.index, location, isValid);
    }

    onSelectionPlanChanged(option){
        let selectionPlan = option.value;
        let isValid = selectionPlan == null ? false:true;
        this.props.onSelectionPlanChanged(this.props.index, selectionPlan, isValid);
    }

    render(){
        let { event, currentSummit, venuesOptions, selectionPlanOptions } = this.props;
        let currentLocation        = venuesOptions.filter((option) => option.value.id === event.location_id).shift()
        let currentSummitStartDate = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(0).minute(0).second(0);
        let currentSummitEndDate   = moment.tz(currentSummit.end_date * 1000, currentSummit.time_zone.name).hour(23).minute(59).second(59);
        let currentSelectionPlan   = selectionPlanOptions.filter((option) => option.value.id === event.selection_plan_id).shift();

        return (
            <div className="row event-bulk-editor-item">
                <div className="col-md-1">
                    <a className="event-edit" title={T.translate("bulk_actions_page.titles.view_event")} onClick={this.onSelectedEvent} href="#">{event.id}</a>
                </div>
                <div className="col-md-2">
                    <FormGroup validationState={this.getValidationEventTitle()}>
                        <FormControl
                            type="text"
                            placeholder={T.translate("bulk_actions_page.placeholders.event_title")}
                            onChange={this.onTitleChanged}
                            defaultValue={event.title}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
                <div className="col-md-2">
                        <FormGroup validationState={this.getValidationEventSelectionPlan()}>
                            <Select
                                placeholder={T.translate("schedule.placeholders.select_presentation_selection_plan")}
                                className="selection_plan_selector"
                                name="form-field-name"
                                value={currentSelectionPlan}
                                onChange={this.onSelectionPlanChanged}
                                options={selectionPlanOptions}
                            />
                            <FormControl.Feedback/>
                        </FormGroup>
                </div>
                <div className="col-md-2">
                    <FormGroup validationState={this.getValidationStateVenue()}>
                        <SummitVenuesSelect
                            onVenueChanged={this.onLocationChanged}
                            currentValue={currentLocation}
                            venues={venuesOptions}
                            placeholder={T.translate("schedule.placeholders.select_venue")}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
                <div className="col-md-2">
                    <FormGroup validationState={this.getValidationStartDate()}>
                        <DateTimePicker
                            id="start_date"
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            inputProps={{placeholder: T.translate("bulk_actions_page.placeholders.start_date")}}
                            timezone={currentSummit.time_zone.name}
                            timeConstraints={{ hours: { min: 7, max: 22}}}
                            validation={{after: currentSummitStartDate.valueOf()/1000, before: currentSummitEndDate.valueOf()/1000}}
                            onChange={this.handleChangeDateFrom}
                            value={this.getFormattedTime(event.start_date)}
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
                            inputProps={{placeholder: T.translate("bulk_actions_page.placeholders.end_date")}}
                            timezone={currentSummit.time_zone.name}
                            validation={{after: currentSummitStartDate.valueOf()/1000, before: currentSummitEndDate.valueOf()/1000}}
                            onChange={this.handleChangeDateTo}
                            value={this.getFormattedTime(event.end_date)}
                        />
                        <FormControl.Feedback />
                    </FormGroup>
                </div>
            </div>
        )
    }
}

export default SummitEventBulkEditorItem;
