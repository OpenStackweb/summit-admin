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
import T from "i18n-react/dist/i18n-react";
import EventForm from '../../components/forms/event-form';
import { getSummitById }  from '../../actions/summit-actions';
import '../../styles/edit-summit-event-page.less';
import '../../components/form-validation/validate.less';
import { getEvent, resetEventForm, saveEvent, attachFile } from '../../actions/event-actions';
import { unPublishEvent } from '../../actions/summit-builder-actions';
import { getRsvpTemplates } from '../../actions/rsvp-template-actions';


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

        if(currentSummit == null || currentSummit.id != summitId){
            this.props.getSummitById(summitId);
        }
    }

    componentDidMount() {
        let {eventId} = this.state;
        let {currentSummit, rsvpTemplateOptions} = this.props;

        if (currentSummit !== null) {
            if(eventId) {
                this.props.getEvent(eventId);
            } else {
                this.props.resetEventForm();
            }

            if (rsvpTemplateOptions.length == 0) {
                this.props.getRsvpTemplates();
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, levelOptions, rsvpTemplateOptions} = this.props;

        if(currentSummit == null) return null;

        return(
            <div className="container">
                <h3>{T.translate("general.summit_event")}</h3>
                <hr/>
                {currentSummit &&
                <EventForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    levelOpts={levelOptions}
                    trackOpts={currentSummit.tracks}
                    typeOpts={currentSummit.event_types}
                    locationOpts={currentSummit.locations}
                    rsvpTemplateOpts={rsvpTemplateOptions}
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

const mapStateToProps = ({ currentSummitState, currentSummitEventState, currentRsvpTemplateListState }) => ({
    currentSummit: currentSummitState.currentSummit,
    levelOptions: currentSummitEventState.levelOptions,
    rsvpTemplateOptions: currentRsvpTemplateListState.rsvpTemplates,
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
        unPublishEvent,
        getRsvpTemplates
    }
)(EditSummitEventPage);