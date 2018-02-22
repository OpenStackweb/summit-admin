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
import SpeakerAttendanceForm from '../../components/forms/speaker-attendance-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getAttendance, resetAttendanceForm, sendAttendanceEmail, saveAttendance } from "../../actions/speaker-actions";
import '../../styles/edit-speaker-attendance-page.less';

class EditSpeakerAttendancePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            attendanceId: props.match.params.attendance_id
        }
    }

    componentWillReceiveProps(nextProps) {
        let {attendanceId} = this.state;

        let new_attendance_id = nextProps.match.params.attendance_id;

        if(attendanceId != new_attendance_id) {

            this.setState({attendanceId: new_attendance_id});

            if(new_attendance_id) {
                this.props.getAttendance(new_attendance_id);
            } else {
                this.props.resetAttendanceForm();
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
        let {currentSummit, allTypes, errors} = this.props;
        let attendanceId = this.props.match.params.attendance_id;

        if(currentSummit != null) {
            if (attendanceId != null) {
                this.props.getAttendance(attendanceId);
            } else {
                this.props.resetAttendanceForm();
            }
        }
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_speaker_attendance.speaker_attendance")}</h3>
                <hr/>
                {currentSummit &&
                <SpeakerAttendanceForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSendEmail={this.props.sendAttendanceEmail}
                    onSubmit={this.props.saveAttendance}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSpeakerAttendanceState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentSpeakerAttendanceState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAttendance,
        resetAttendanceForm,
        sendAttendanceEmail,
        saveAttendance,
    }
)(EditSpeakerAttendancePage);