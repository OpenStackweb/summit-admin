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
import { Breadcrumb } from 'react-breadcrumbs';
import EventForm from '../../components/forms/event-form';
import { getSummitById }  from '../../actions/summit-actions';
import '../../styles/edit-summit-event-page.less';
import '../../components/form-validation/validate.less';
import { getEvent, resetEventForm, saveEvent, attachFile } from '../../actions/event-actions';
import { unPublishEvent } from '../../actions/summit-builder-actions';
import { getRsvpTemplates } from '../../actions/rsvp-template-actions';


class EditSummitEventPage extends React.Component {

    componentWillMount () {
        let eventId = this.props.match.params.summit_event_id;

        if (!eventId) {
            this.props.resetEventForm();
        } else {
            this.props.getEvent(eventId);
        }

        this.props.getRsvpTemplates();
    }

    componentWillReceiveProps(newProps) {
        let eventId = this.props.match.params.summit_event_id;
        let newEventId = newProps.match.params.summit_event_id;

        if (eventId != newEventId) {
            if (!newEventId) {
                this.props.resetEventForm();
            } else {
                this.props.getEvent(newEventId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, levelOptions, rsvpTemplateOptions, match} = this.props;
        let breadcrumb = (entity.id) ? entity.title : T.translate("general.new");

        if(!currentSummit.id) return(<div></div>);

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
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
