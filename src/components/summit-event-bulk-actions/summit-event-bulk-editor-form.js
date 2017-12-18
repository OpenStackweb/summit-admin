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
import { Button } from 'react-bootstrap';
import T from 'i18n-react/dist/i18n-react'

class SummitEventBulkEditorForm extends React.Component
{
    constructor(props){
        super(props);
        this.onApplyChanges           = this.onApplyChanges.bind(this);
        this.onApplyChangesAndPublish = this.onApplyChangesAndPublish.bind(this);
        this.onLocationChanged        = this.onLocationChanged.bind(this);
        this.onTitleChanged           = this.onTitleChanged.bind(this);
        this.onStartDateChanged       = this.onStartDateChanged.bind(this);
        this.onEndDateChanged         = this.onEndDateChanged.bind(this);
        this.onSelectedEvent          = this.onSelectedEvent.bind(this);
    }

    onApplyChanges(evt){
        evt.stopPropagation();
        evt.preventDefault();
        let {currentSummit, events }  = this.props;
        let invalidEvents = events.filter((event) => !event.is_valid);
        if(invalidEvents.length > 0){
            return;
        }
        this.props.updateEvents(currentSummit.id, events);
    }

    onApplyChangesAndPublish(evt){
        evt.stopPropagation();
        evt.preventDefault();
        let {currentSummit, events }  = this.props;
        let invalidEvents = events.filter((event) => !event.is_valid);
        if(invalidEvents.length > 0){
            return;
        }
        this.props.updateAndPublishEvents(currentSummit.id, events);
    }

    onLocationChanged(idx, location, isValid) {
        let { events } = this.props;
        if(location == null) return;
        this.props.updateEventLocationLocal(events[idx], location, isValid);
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
        let { currentSummit} = this.props;
        this.props.history.push(`/app/summits/${currentSummit.id}/events/${event.id}`);
        return false;
    }

    render(){
        let { events, currentSummit} = this.props;
        if(!currentSummit) return null;
        let tbaLocation = { id: 0, name:'TBA'};
        let venuesOptions = [
            { value:tbaLocation, label: tbaLocation.name }
        ];

        for(let i = 0; i < currentSummit.locations.length; i++) {
            let location = currentSummit.locations[i];
            if (location.class_name != "SummitVenue") continue;
            let option = { value : location, label: location.name };
            venuesOptions.push(option);
            for(let j = 0; j < location.rooms.length ; j++){
                let subOption = { value : location.rooms[j] , label: location.rooms[j].name};
                venuesOptions.push(subOption);
            }
        }
        return (
            <form>
                <div className="row">
                    <div className="col-md-1 col-title">{T.translate("bulk_actions_page.event_id_label")}</div>
                    <div className="col-md-4 col-title">{T.translate("bulk_actions_page.event_name_label")}</div>
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
                            event={event}
                            currentSummit={currentSummit}
                            onLocationChanged={this.onLocationChanged}
                            onTitleChanged={this.onTitleChanged}
                            onStartDateChanged={this.onStartDateChanged}
                            onEndDateChanged={this.onEndDateChanged}
                            onSelectedEvent={this.onSelectedEvent}
                        ></SummitEventBulkEditorItem>
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