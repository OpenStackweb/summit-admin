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
import AttendeeForm from '../../components/forms/attendee-form/attendee-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getMainOrderExtraQuestions } from '../../actions/order-actions';
import { getAttendee, resetAttendeeForm, saveAttendee, reassignTicket, saveTicket, deleteTicket, deleteRsvp } from "../../actions/attendee-actions";
import '../../styles/edit-summit-attendee-page.less';

class EditSummitAttendeePage extends React.Component {

    componentDidMount() {
        const {currentSummit, match} = this.props;
        const new_attendee_id = match.params.attendee_id;

        if(!new_attendee_id) {
            this.props.resetAttendeeForm();
        } else {
            this.props.getAttendee(new_attendee_id);
        }

        if (!currentSummit.attendee_main_extra_questions || !currentSummit.attendee_main_extra_questions.length) {
            this.props.getMainOrderExtraQuestions();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.attendee_id;
        const newId = this.props.match.params.attendee_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetAttendeeForm();
            } else {
                this.props.getAttendee(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.email : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("general.attendee")}</h3>
                <hr/>
                {currentSummit &&
                <AttendeeForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveAttendee}
                    onTicketReassign={this.props.reassignTicket}
                    onSaveTicket={this.props.saveTicket}
                    onDeleteTicket={this.props.deleteTicket}
                    onDeleteRsvp={this.props.deleteRsvp}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentAttendeeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentAttendeeState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAttendee,
        resetAttendeeForm,
        saveAttendee,
        reassignTicket,
        saveTicket,
        deleteTicket,
        deleteRsvp,
        getMainOrderExtraQuestions
    }
)(EditSummitAttendeePage);
