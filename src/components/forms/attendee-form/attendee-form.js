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
import { MemberInput, Input, Panel } from 'openstack-uicore-foundation/lib/components'
import ExtraQuestionsForm from 'openstack-uicore-foundation/lib/components/extra-questions';
import TicketComponent from './ticket-component'
import OrderComponent from './order-component'
import RsvpComponent from './rsvp-component'
import { AffiliationsTable } from '../../tables/affiliationstable'
import {isEmpty, scrollToError, shallowEqual} from "../../../utils/methods";
import QuestionsSet  from 'openstack-uicore-foundation/lib/utils/questions-set'

class AttendeeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors,
            showSection: 'main',
        };

        this.formRef = React.createRef();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.triggerFormSubmit = this.triggerFormSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const state = {};
        scrollToError(this.props.errors);

        if(!shallowEqual(prevProps.entity, this.props.entity)) {
            state.entity = {...this.props.entity};
            state.errors = {};
        }

        if (!shallowEqual(prevProps.errors, this.props.errors)) {
            state.errors = {...this.props.errors};
        }

        if (!isEmpty(state)) {
            this.setState({...this.state, ...state})
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

    triggerFormSubmit() {

        // check current ( could not be rendered)
        if(this.formRef.current) {
            this.formRef.current.dispatchEvent(new Event("submit", {cancelable: true, bubbles: true}));
            return;
        }
        // do regular submit
        const entity = { ... this.state.entity };
        if (entity.extra_questions) {
            entity.extra_questions = entity.extra_questions.map(q => ({question_id: q.question_id, answer: q.value}))
        }
        this.props.onSubmit(entity);
    }

    handleSubmit(formValues) {

        const {currentSummit} = this.props;
        const qs = new QuestionsSet(currentSummit.attendee_main_extra_questions);
        const formattedAnswers = [];
        Object.keys(formValues).map(name => {
            let question = qs.getQuestionByName(name);
            const newQuestion = { question_id: question.id, answer: `${formValues[name]}` }
            formattedAnswers.push(newQuestion);
        });

        this.setState({...this.state, entity: {...this.state.entity, extra_questions: formattedAnswers}}, () => {
            this.props.onSubmit(this.state.entity);
        });
    }

    handlePresentationLink(event_id, ev) {
        const {currentSummit} = this.props;
        ev.preventDefault();
        let event_detail_url = currentSummit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');
        window.open(event_detail_url, '_blank');
    }

    handleSpeakerLink(speaker_id, ev) {
        const {history} = this.props;
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
        const {entity, showSection} = this.state;
        const { currentSummit } = this.props;

        return (
            <>
            {/* First Form ( Main Attendee Form )*/}
            <form className="summit-attendee-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-6">
                        <label> {T.translate("general.member")} *</label>
                        <MemberInput
                            id="member"
                            value={entity.member}
                            getOptionLabel={
                                (member) => {
                                    return member.hasOwnProperty("email") ?
                                        `${member.first_name} ${member.last_name} (${member.email})`:
                                        `${member.first_name} ${member.last_name} (${member.id})`;
                                }
                            }
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
                    <div className="col-md-3 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="disclaimer_accepted" checked={entity.disclaimer_accepted}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="disclaimer_accepted">
                                {T.translate("edit_attendee.disclaimer_accepted")}
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

                    {entity.tickets && entity.tickets.length > 0 &&
                    <TicketComponent
                        attendeeId={entity.id}
                        tickets={entity.tickets}
                        summit={currentSummit}
                        onReassign={this.props.onTicketReassign}
                        onSave={this.props.onSaveTicket}
                    />
                    }
                    {entity.orders && entity.orders.length > 0 &&
                    <OrderComponent
                        orders={entity.orders}
                        summitId={entity.summit_id}
                    />
                    }

                    { entity.member != null && entity.member.hasOwnProperty('rsvp') && entity.member.rsvp.length > 0 &&
                    <RsvpComponent member={entity.member} onDelete={this.props.onDeleteRsvp} />
                    }

                </div>
            </form>
            {/* Second Form ( Extra Questions )*/}
            { entity.id !== 0 && currentSummit.attendee_main_extra_questions && currentSummit.attendee_main_extra_questions.length > 0 &&
                <Panel show={showSection === 'extra_questions'}
                       title={T.translate("edit_attendee.extra_questions")}
                       handleClick={this.toggleSection.bind(this, 'extra_questions')}>
                    <ExtraQuestionsForm
                        extraQuestions={currentSummit.attendee_main_extra_questions}
                        userAnswers={entity.extra_questions}
                        onAnswerChanges={this.handleSubmit}
                        ref={this.formRef}
                        className="extra-questions"
                    />
                </Panel>
            }
            <div className="row">
                <div className="col-md-12 submit-buttons">
                    <input type="button" onClick={() => this.triggerFormSubmit()}
                    className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                </div>
            </div>
            </>
        );
    }
}

export default AttendeeForm;
