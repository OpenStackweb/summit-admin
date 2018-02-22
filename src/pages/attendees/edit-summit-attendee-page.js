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
import AttendeeForm from '../../components/forms/attendee-form/attendee-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getAttendee, resetAttendeeForm, saveAttendee, changeMember, saveTicket, deleteTicket, deleteRsvp } from "../../actions/attendee-actions";
import '../../styles/edit-summit-attendee-page.less';

class EditSummitAttendeePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            attendeeId: props.match.params.attendee_id
        }
    }

    componentWillReceiveProps(nextProps) {
        let {attendeeId} = this.state;
        let new_attendee_id = nextProps.match.params.attendee_id;

        if(attendeeId != new_attendee_id) {

            this.setState({attendeeId: new_attendee_id});

            if(new_attendee_id) {
                this.props.getAttendee(new_attendee_id);
            } else {
                this.props.resetAttendeeForm();
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

    componentDidMount () {
        let {currentSummit, entity, errors} = this.props;
        let attendeeId = this.props.match.params.attendee_id;

        if(currentSummit != null) {
            if (attendeeId != null) {
                this.props.getAttendee(attendeeId);
            } else {
                this.props.resetAttendeeForm();
            }
        }
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("general.attendee")}</h3>
                <hr/>
                {currentSummit &&
                <AttendeeForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveAttendee}
                    onMemberChange={this.props.changeMember}
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
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAttendee,
        resetAttendeeForm,
        saveAttendee,
        changeMember,
        saveTicket,
        deleteTicket,
        deleteRsvp,
    }
)(EditSummitAttendeePage);