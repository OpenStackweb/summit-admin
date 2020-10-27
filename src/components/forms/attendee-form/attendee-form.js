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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { epochToMoment, findElementPos } from 'openstack-uicore-foundation/lib/methods'
import { MemberInput, DateTimePicker, Input, Panel } from 'openstack-uicore-foundation/lib/components'
import TicketComponent from './ticket-component'
import RsvpComponent from './rsvp-component'
import { AffiliationsTable } from '../../tables/affiliationstable'
import QuestionAnswersInput from '../../inputs/question-answers-input'



class AttendeeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'main',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    toggleSection(section, ev) {
        let {showSection} = this.state;
        let newShowSection = (showSection === section) ? 'main' : section;
        ev.preventDefault();

        this.setState({showSection: newShowSection});
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'number') {
            value = parseInt(ev.target.value);
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity);
    }

    handlePresentationLink(event_id, ev) {
        let {currentSummit} = this.props;
        ev.preventDefault();
        let event_detail_url = currentSummit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');
        window.open(event_detail_url, '_blank');
    }

    handleSpeakerLink(speaker_id, ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(`/app/speakers/${speaker_id}`);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    render() {
        let {entity, showSection} = this.state;
        let { currentSummit } = this.props;

        return (
            <form className="summit-attendee-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("general.member")} *</label>
                        <MemberInput
                            id="member"
                            value={entity.member}
                            onChange={this.handleChange}
                            disabled
                        />
                    </div>
                    {entity.speaker != null &&
                    <div className="col-md-4">
                        <label> {T.translate("general.speaker")} </label><br/>
                        <a href="" onClick={this.handleSpeakerLink.bind(this, entity.speaker.id)}>
                            {entity.speaker.first_name} {entity.speaker.last_name}
                        </a>
                    </div>
                    }
                </div>

                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_attendee.first_name")}</label>
                        <Input
                            id="first_name"
                            value={entity.first_name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('first_name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_attendee.last_name")}</label>
                        <Input
                            id="last_name"
                            value={entity.last_name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('last_name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_attendee.email")}</label>
                        <Input
                            id="email"
                            value={entity.email}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('email')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_attendee.company")}</label>
                        <Input
                            id="company"
                            value={entity.company}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('company')}
                        />
                    </div>
                    <div className="col-md-8">
                        <label> {T.translate("edit_attendee.admin_notes")}</label>
                        <textarea
                            id="admin_notes"
                            value={entity.admin_notes}
                            onChange={this.handleChange}
                            className="form-control"
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="shared_contact_info" checked={entity.shared_contact_info}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="shared_contact_info">
                                {T.translate("edit_attendee.shared_contact_info")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="summit_hall_checked_in" checked={entity.summit_hall_checked_in}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="summit_hall_checked_in">
                                {T.translate("edit_attendee.checked_in")}
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    { entity.member != null && entity.member.affiliations &&
                    <div className="row form-group">
                        <div className="col-md-12">
                            <legend>{T.translate("edit_attendee.affiliations")}</legend>
                            <AffiliationsTable
                                ownerId={entity.member.id}
                                data={entity.member.affiliations}
                            />
                        </div>
                    </div>
                    }

                    {entity.hasOwnProperty('tickets') &&
                    <TicketComponent
                        attendeeId={entity.id}
                        tickets={entity.tickets}
                        summit={currentSummit}
                        onReassign={this.props.onTicketReassign}
                        onSave={this.props.onSaveTicket}
                        onDelete={this.props.onDeleteTicket}
                    />
                    }

                    { entity.member != null && entity.member.hasOwnProperty('rsvp') && entity.member.rsvp.length > 0 &&
                    <RsvpComponent member={entity.member} onDelete={this.props.onDeleteRsvp} />
                    }

                    {entity.id !== 0 && currentSummit.attendee_extra_questions && currentSummit.attendee_extra_questions.length > 0 &&
                    <Panel show={showSection === 'extra_questions'} title={T.translate("edit_attendee.extra_questions")}
                           handleClick={this.toggleSection.bind(this, 'extra_questions')}>
                        <QuestionAnswersInput
                            id="extra_questions"
                            answers={entity.extra_questions}
                            questions={currentSummit.attendee_extra_questions}
                            onChange={this.handleChange}
                        />
                    </Panel>
                    }

                </div>


                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default AttendeeForm;
