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
import { Modal, Button, ControlLabel, FormControl } from 'react-bootstrap';
import React from 'react';
import DateTimePicker from '../datetimepicker'
import ScheduleAdminVenueSelector from './schedule-admin-venue-selector';

class ScheduleAdminEmptySpotsModal extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            currentLocation: null,
            dateFrom: null,
            dateTo: null,
            gapSize: null,
        };
        this.onFindEmptySpots     = this.onFindEmptySpots.bind(this);
        this.onVenueChanged       = this.onVenueChanged.bind(this);
        this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
        this.handleChangeDateTo   = this.handleChangeDateTo.bind(this);
        this.handleChangeGapValue = this.handleChangeGapValue.bind(this);
    }

    onFindEmptySpots(){
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

    handleChangeDateTo(ev) {
        let {value, id} = ev.target;
        this.setState({...this.state, dateTo: value});
    }

    onVenueChanged(location){
        this.setState({... this.state, currentLocation: { value : location , label: location.name}});
    }

    handleChangeGapValue(ev){
        this.setState({ ... this.state, gapSize: ev.target.value });
    }

    render(){
        let { showModal, onCloseModal, currentSummit, venues } = this.props;
        return (
            <Modal show={showModal} onHide={onCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Find Empty Spots</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-12">
                            <ScheduleAdminVenueSelector onVenueChanged={this.onVenueChanged}
                                                        currentValue={this.state.currentLocation}
                                                        venues={venues}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4" style={{paddingTop: '24px'}}>
                            <DateTimePicker
                                id="start_date"
                                format={{date:"YYYY-MM-DD", time: "HH:mm:ss"}}
                                inputProps={{placeholder: 'Start Date'}}
                                timezone={currentSummit.time_zone.name}
                                validation={{after: currentSummit.start_date, before: currentSummit.end_date}}
                                onChange={this.handleChangeDateFrom}
                            />
                        </div>
                        <div className="col-md-4" style={{paddingTop: '24px'}}>
                            <DateTimePicker
                                id="end_date"
                                format={{date:"YYYY-MM-DD", time: "HH:mm:ss"}}
                                inputProps={{placeholder: 'End Date'}}
                                timezone={currentSummit.time_zone.name}
                                validation={{after: currentSummit.start_date, before: currentSummit.end_date}}
                                onChange={this.handleChangeDateTo}
                            />
                        </div>
                        <div className="col-md-4" style={{paddingTop: '24px'}}>
                            <FormControl
                                type="number"
                                placeholder="Enter Gap Size (Minutes)"
                                onChange={this.handleChangeGapValue}
                            />
                        </div>
                    </div>
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