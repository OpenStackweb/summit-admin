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
import SummitEventBulkEditorItem from './summit-event-bulk-editor-item'
import T from 'i18n-react/dist/i18n-react'
import Swal from "sweetalert2";
import { DateTimePicker, SummitVenuesSelect } from 'openstack-uicore-foundation/lib/components'
import moment from "moment-timezone";
import {TBALocation} from "../../utils/constants";
import Select from "react-select";

class SummitEventBulkEditorForm extends React.Component
{
    constructor(props){
        super(props);
        this.onApplyChanges            = this.onApplyChanges.bind(this);
        this.onApplyChangesAndPublish  = this.onApplyChangesAndPublish.bind(this);
        this.onLocationChanged         = this.onLocationChanged.bind(this);
        this.onTitleChanged            = this.onTitleChanged.bind(this);
        this.onStartDateChanged        = this.onStartDateChanged.bind(this);
        this.onEndDateChanged          = this.onEndDateChanged.bind(this);
        this.onSelectedEvent           = this.onSelectedEvent.bind(this);
        this.onBulkLocationChange      = this.onBulkLocationChange.bind(this);
        this.onBulkSelectionPlanChange = this.onBulkSelectionPlanChange.bind(this);
        this.onBulkTypeChange          = this.onBulkTypeChange.bind(this);
        this.handleChangeBulkStartDate = this.handleChangeBulkStartDate.bind(this);
        this.handleChangeBulkEndDate   = this.handleChangeBulkEndDate.bind(this);
        this.onSelectionPlanChanged     = this.onSelectionPlanChanged.bind(this);
        this.state = {
            currentBulkLocation : null,
            currentBulkSelectionPlan: null,
        }
    }

    onApplyChanges(evt){
        evt.stopPropagation();
        evt.preventDefault();
        const {currentSummit, events }  = this.props;
        let invalidEvents = events.filter((event) => !event.is_valid);
        if(invalidEvents.length > 0){
            Swal.fire({
                title: T.translate("bulk_actions_page.messages.validation_title"),
                text:  T.translate("bulk_actions_page.messages.validation_message"),
                type: 'warning',
            });
            return;
        }
        this.props.updateEvents(currentSummit.id, events);
    }

    onApplyChangesAndPublish(evt){
        evt.stopPropagation();
        evt.preventDefault();
        const {currentSummit, events }  = this.props;
        let invalidEvents = events.filter((event) => !event.is_valid);
        if(invalidEvents.length > 0){
            Swal.fire({
                title: T.translate("bulk_actions_page.messages.validation_title"),
                text:  T.translate("bulk_actions_page.messages.validation_message"),
                type: 'warning',
            });
            return;
        }
        this.props.updateAndPublishEvents(currentSummit.id, events);
    }

    onLocationChanged(idx, location, isValid) {
        let { events } = this.props;
        if(location == null) return;
        this.props.updateEventLocationLocal(events[idx], location, isValid);
    }

    onSelectionPlanChanged(idx, selectionPlan, isValid){
        let { events } = this.props;
        if(selectionPlan == null) return;
        this.props.updateEventSelectionPlanLocal(events[idx], selectionPlan, isValid);
    }

    onTitleChanged(idx, title, isValid){
        let { events } = this.props;
        this.props.updateEventTitleLocal(events[idx], title, isValid)
    }

    onStartDateChanged(idx, startDate, isValid){
        let { events } = this.props;
        this.props.updateEventStartDateLocal(events[idx], startDate, isValid)
    }

    onEndDateChanged(idx, endDate, isValid){
        let { events } = this.props;
        this.props.updateEventEndDateLocal(events[idx], endDate, isValid)
    }

    onSelectedEvent(event){
        const { currentSummit} = this.props;
        this.props.history.push(`/app/summits/${currentSummit.id}/events/${event.id}`);
        return false;
    }

    // bulk controls handlers
    onBulkLocationChange(location){
        this.setState({ ...this.state, currentBulkLocation: location});
        this.props.updateEventsLocationLocal(location)
    }

    onBulkSelectionPlanChange(option){
        let selectionPlan = option.value;
        this.setState({ ...this.state, currentBulkSelectionPlan: selectionPlan});
        this.props.updateEventsSelectionPlanLocal(selectionPlan)
    }

    onBulkTypeChange(eventType){
        this.props.updateEventsTypeLocal(eventType)
    }

    handleChangeBulkStartDate(ev){
        let { value } = ev.target;
        this.props.updateEventsStartDateLocal(value.valueOf()/1000)
    }

    handleChangeBulkEndDate(ev){
        let { value } = ev.target;
        this.props.updateEventsEndDateLocal(value.valueOf()/1000)
    }

    render(){
        let { events, currentSummit} = this.props;
        let currentSummitStartDate   = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(0).minute(0).second(0);
        let currentSummitEndDate     = moment.tz(currentSummit.end_date * 1000, currentSummit.time_zone.name).hour(23).minute(59).second(59);


        if(!currentSummit) return null;
        let venuesOptions = [
            { value: TBALocation, label: TBALocation.name }
        ];

        let selectionPlanOptions = [];

        for(let i = 0; i < currentSummit.locations.length; i++) {
            let location = currentSummit.locations[i];
            if (location.class_name !== "SummitVenue") continue;
            let option = { value : location, label: location.name };
            venuesOptions.push(option);
            if(!location.hasOwnProperty('rooms')) continue;
            for(let j = 0; j < location.rooms.length ; j++){
                let subOption = { value : location.rooms[j] , label: location.rooms[j].name};
                venuesOptions.push(subOption);
            }
        }

        for(let i = 0; i < currentSummit.selection_plans.length; i++) {
            let selection_plan = currentSummit.selection_plans[i];
            let option = { value : selection_plan, label: selection_plan.name };
            selectionPlanOptions.push(option);
        }

        let currentBulkLocation = venuesOptions.filter((option) =>  this.state.currentBulkLocation != null && option.value.id === this.state.currentBulkLocation.id).shift();
        let currentBulkSelectionPlan = selectionPlanOptions.filter((option) =>  this.state.currentBulkSelectionPlan != null && option.value.id === this.state.currentBulkSelectionPlan.id).shift();
        let typesOptions = [];
        let currentBulkType = null;

        // all events same type
        let eventsTypeArray = events.map(et => currentSummit.event_types.find(e => e.id === et.type_id));
        let canEditEventType = ([...new Set(eventsTypeArray.map(et => et.class_name))].length === 1);

        if (canEditEventType) {
            let eventsType = currentSummit.event_types.find(et => et.id === events[0].type_id);

            typesOptions = currentSummit.event_types
                .filter(et => eventsType.class_name === et.class_name)
                .map(et => ({value: et, label: et.name}));

            currentBulkType = typesOptions.find((option) => option.value.id === eventsType.id);
        }

        return (
            <form>
                <div className="row">
                    <div className="col-md-3">
                        &nbsp;
                    </div>
                    <div className="col-md-2">
                        <Select
                            placeholder={T.translate("schedule.placeholders.select_presentation_selection_plan")}
                            className="selection_plan_selector_bulk"
                            name="form-field-name"
                            value={currentBulkSelectionPlan}
                            onChange={this.onBulkSelectionPlanChange}
                            options={selectionPlanOptions}
                        />
                    </div>
                    <div className="col-md-2">
                        <SummitVenuesSelect
                            currentValue={currentBulkLocation}
                            onVenueChanged={this.onBulkLocationChange}
                            venues={venuesOptions}
                            placeholder={T.translate("schedule.placeholders.select_venue")}
                        />
                    </div>
                    <div className="col-md-2">
                        <DateTimePicker
                            id="start_date"
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            inputProps={{placeholder: T.translate("bulk_actions_page.placeholders.start_date")}}
                            timezone={currentSummit.time_zone.name}
                            timeConstraints={{ hours: { min: 7, max: 22}}}
                            validation={{after: currentSummitStartDate.valueOf()/1000, before: currentSummitEndDate.valueOf()/1000}}
                            onChange={this.handleChangeBulkStartDate}
                         />
                    </div>
                    <div className="col-md-2">
                        <DateTimePicker
                            id="end_date"
                            format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                            timeConstraints={{ hours: { min: 7, max: 22}}}
                            inputProps={{placeholder: T.translate("bulk_actions_page.placeholders.end_date")}}
                            timezone={currentSummit.time_zone.name}
                            validation={{after: currentSummitStartDate.valueOf()/1000, before: currentSummitEndDate.valueOf()/1000}}
                            onChange={this.handleChangeBulkEndDate}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-1 col-title">{T.translate("bulk_actions_page.event_id_label")}</div>
                    <div className="col-md-2 col-title">{T.translate("bulk_actions_page.event_name_label")}</div>
                    <div className="col-md-2 col-title">{T.translate("bulk_actions_page.event_selection_plan_label")}</div>
                    <div className="col-md-2 col-title">{T.translate("bulk_actions_page.event_location_label")}</div>
                    <div className="col-md-2 col-title">{T.translate("bulk_actions_page.event_start_date_label")}</div>
                    <div className="col-md-2 col-title">{T.translate("bulk_actions_page.event_end_date_label")}</div>
                </div>
                {
                    events.map((event, idx) => (
                        <SummitEventBulkEditorItem
                            key={idx}
                            index={idx}
                            venuesOptions={venuesOptions}
                            selectionPlanOptions={selectionPlanOptions}
                            event={event}
                            currentSummit={currentSummit}
                            onLocationChanged={this.onLocationChanged}
                            onTitleChanged={this.onTitleChanged}
                            onStartDateChanged={this.onStartDateChanged}
                            onEndDateChanged={this.onEndDateChanged}
                            onSelectedEvent={this.onSelectedEvent}
                            onSelectionPlanChanged={this.onSelectionPlanChanged}
                        />
                    ))
                }
                <div className="row">
                    <div className="col-md-12 col-form-buttons">
                        <button className="btn btn-primary pull-left" onClick={this.onApplyChanges}>{T.translate("bulk_actions_page.btn_apply_changes")}</button>
                        <button className="btn btn-success pull-left" onClick={this.onApplyChangesAndPublish}>{T.translate("bulk_actions_page.btn_apply_publish_changes")}</button>
                    </div>
                </div>
            </form>
        )
    }
}

export default SummitEventBulkEditorForm;
