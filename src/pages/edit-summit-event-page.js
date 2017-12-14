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
import { connect } from 'react-redux';
import EventForm from '../components/event-form/event-form';
import { getSummitById }  from '../actions/summit-actions';
import '../styles/edit-summit-event-page.less';
import '../components/form-validation/validate.less';
import { getEvent, resetEventForm, saveEvent, attachFile } from '../actions/edit-summit-event-actions';
import { unPublishEvent } from '../actions/summit-builder-actions';


class EditSummitEventPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            eventId: props.match.params.summit_event_id
        };

    }

    componentWillReceiveProps(nextProps) {
        let {eventId} = this.state;
        let new_event_id = nextProps.match.params.summit_event_id;

        if(eventId != new_event_id) {

            this.setState({eventId: new_event_id});

            if(new_event_id) {
                this.props.getEvent(new_event_id);
            } else {
                this.props.resetEventForm();
            }
        }


    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }

    }

    componentDidMount() {
        let {eventId} = this.state;
        let {currentSummit, trackOptions, locationOptions, typeOptions} = this.props;

        if (this.props.currentSummit) {
            if(eventId) {
                this.props.getEvent(eventId);
            } else {
                this.props.resetEventForm();
            }
        }
    }

    render(){
        let {currentSummit, entity, errors} = this.props;

        if(currentSummit == null) return null;

        return(
            <div className="container">
                <h3>Summit Event</h3>
                <hr/>
                {currentSummit &&
                <EventForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    levelOpts={this.props.levelOptions}
                    trackOpts={currentSummit.tracks}
                    typeOpts={currentSummit.event_types}
                    locationOpts={currentSummit.locations}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveEvent}
                    onAttach={this.props.attachFile}
                    onUnpublish={this.props.unPublishEvent}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSummitEventState }) => ({
    currentSummit: currentSummitState.currentSummit,
    levelOptions: currentSummitEventState.levelOptions,
    typeOptions: currentSummitEventState.typeOptions,
    trackOptions: currentSummitEventState.trackOptions,
    locationOptions: currentSummitEventState.locationOptions,
    entity: currentSummitEventState.entity,
    errors: currentSummitEventState.errors
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEvent,
        resetEventForm,
        saveEvent,
        attachFile,
        unPublishEvent
    }
)(EditSummitEventPage);