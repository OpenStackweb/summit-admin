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
import { Modal, Button, FormGroup, FormControl } from 'react-bootstrap';
import React from 'react';
import { DateTimePicker, SummitVenuesSelect } from 'openstack-uicore-foundation/lib/components'
import moment from "moment-timezone";
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminEmptySpotsModal extends React.Component {

    constructor(props){
        super(props);

        const { currentSummit } = this.props;
        let defaultValueStart = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(7).minute(0).second(0);
        let defaultValueEnd   = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(19).minute(0).second(0);

        this.state = {
            currentLocation: null,
            dateFrom: defaultValueStart,
            dateTo: defaultValueEnd,
            gapSize: this.props.initialGapSize,
        };

        this.validationState = {
            currentLocation : false,
            dateFrom: true,
            dateTo: false,
            gapSize: true
        };

        this.onFindEmptySpots     = this.onFindEmptySpots.bind(this);
        this.onVenueChanged       = this.onVenueChanged.bind(this);
        this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
        this.handleChangeDateTo   = this.handleChangeDateTo.bind(this);
        this.handleChangeGapValue = this.handleChangeGapValue.bind(this);
    }

    isValidForm(){
       let valid = true;
        for (var key in this.validationState) {
            valid = valid && this.validationState[key];
        }
        return valid;
    }

    onFindEmptySpots(){
        if(!this.isValidForm()) return;
        this.props.onFindEmptySpots({
            currentLocation: this.state.currentLocation.value,
            dateFrom: this.state.dateFrom.valueOf()/1000,
            dateTo: this.state.dateTo.valueOf()/1000,
            gapSize: this.state.gapSize,
        });
    }

    handleChangeDateFrom(ev) {
        let {value, id} = ev.target;
        this.setState({...this.state, dateFrom: value});
    }

    getValidationDateFrom(){
        let { dateFrom } = this. state;
        let isValid = dateFrom != null && dateFrom !== '';
        this.validationState = { ... this.validationState, dateFrom: isValid};
        return isValid ? 'success' : 'warning';
    }

    handleChangeDateTo(ev) {
        let {value, id} = ev.target;
        this.setState({...this.state, dateTo: value});
    }

    getValidationDateTo(){
        let { dateTo, dateFrom } = this. state;
        let isValid = dateTo != null && dateTo !== '' && ( dateFrom != null && dateTo.isAfter(dateFrom));
        this.validationState = { ... this.validationState, dateTo: isValid};
        return isValid ? 'success' : 'warning';
    }

    onVenueChanged(location){
        let option = location != null ?  { value : location , label: location.name } : null;
        this.setState({... this.state, currentLocation: option});
    }

    getValidationStateVenue(){
        let { currentLocation } = this. state;

        let isValid = currentLocation != null;
        this.validationState = { ... this.validationState, currentLocation: isValid};
        return isValid ? 'success' : 'warning';
    }

    handleChangeGapValue(ev){
        this.setState({ ... this.state, gapSize: ev.target.value });
    }

    getValidationStateGapSize(){
        let { gapSize } = this. state;
        gapSize = parseInt(gapSize);
        let isValid = gapSize >= 5;
        this.validationState = { ... this.validationState, gapSize: isValid};
        return isValid ? 'success' : 'warning';
    }

    render(){
        let { showModal, onCloseModal, currentSummit } = this.props;
        let { currentLocation, dateFrom, dateTo, gapSize } = this.state;

        // process venues
        let venues = [];
        for(let i = 0; i < currentSummit.locations.length; i++) {
            let location = currentSummit.locations[i];
            if (location.class_name !== "SummitVenue") continue;
            let option = { value : location, label: location.name };
            venues.push(option);
            if(!location.hasOwnProperty('rooms')) continue;
            for(let j = 0; j < location.rooms.length ; j++){
                let subOption = { value : location.rooms[j] , label: location.rooms[j].name};
                venues.push(subOption);
            }
        }
        let currenSummitStartDate = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(0).minute(0).second(0);
        let currenSummitEndDate   = moment.tz(currentSummit.end_date * 1000, currentSummit.time_zone.name).hour(23).minute(59).second(59);
        let defaultValueStart     = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(7).minute(0).second(0);
        let defaultValueEnd       = moment.tz(currentSummit.start_date * 1000, currentSummit.time_zone.name).hour(22).minute(0).second(0);
        return (
            <Modal show={showModal} onHide={onCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{T.translate("empty_spots_modal.find_empty_spots")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                    <div className="row">
                        <div className="col-md-12">
                            <label> {T.translate("empty_spots_modal.venue")} </label>
                            <FormGroup validationState={this.getValidationStateVenue()}>
                                <SummitVenuesSelect
                                    onVenueChanged={this.onVenueChanged}
                                    currentValue={currentLocation}
                                    venues={venues}
                                    placeholder={T.translate("schedule.placeholders.select_venue")}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <FormGroup validationState={this.getValidationDateFrom()}>
                                <label> {T.translate("empty_spots_modal.from_date")} </label>
                                <DateTimePicker
                                    id="start_date"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    inputProps={{placeholder: T.translate("empty_spots_modal.placeholders.start_date")}}
                                    timezone={currentSummit.time_zone.name}
                                    timeConstraints={{ hours: { min: 7, max: 22}}}
                                    validation={{after: currenSummitStartDate.valueOf()/1000, before: currenSummitEndDate.valueOf()/1000}}
                                    onChange={this.handleChangeDateFrom}
                                    value={dateFrom}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </div>
                        <div className="col-md-4">
                            <FormGroup validationState={this.getValidationDateTo()}>
                                <label> {T.translate("empty_spots_modal.to_date")} </label>
                                <DateTimePicker
                                    id="end_date"
                                    format={{date:"YYYY-MM-DD", time: "HH:mm"}}
                                    timeConstraints={{ hours: { min: 7, max: 22}}}
                                    inputProps={{placeholder: T.translate("empty_spots_modal.placeholders.end_date")}}
                                    timezone={currentSummit.time_zone.name}
                                    validation={{after: currenSummitStartDate.valueOf()/1000, before: currenSummitEndDate.valueOf()/1000}}
                                    onChange={this.handleChangeDateTo}
                                    value={dateTo}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </div>
                        <div className="col-md-4">
                            <label> {T.translate("empty_spots_modal.gap")} </label>
                            <FormGroup validationState={this.getValidationStateGapSize()}>
                                <FormControl
                                    type="number"
                                    placeholder={T.translate("empty_spots_modal.placeholders.gap_size")}
                                    onChange={this.handleChangeGapValue}
                                    value={gapSize}
                                />
                                <FormControl.Feedback />
                            </FormGroup>
                        </div>
                    </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onCloseModal}>Close</Button>
                    <Button onClick={this.onFindEmptySpots}>Find</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default ScheduleAdminEmptySpotsModal;
