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
import SpeakerForm from '../components/speaker-form/speaker-form';
import { getSpeaker, resetSpeakerForm, saveSpeaker, attachPicture } from "../actions/speaker-actions";
import { loadSummits } from '../actions/summit-actions';
import '../styles/edit-summit-speaker-page.less';

class EditSummitSpeakerPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            speakerId: props.match.params.speaker_id
        }
    }

    componentWillMount () {
        this.props.loadSummits();
    }

    componentWillReceiveProps(nextProps) {
        let {speakerId} = this.state;
        let {summits}   = this.props;
        let new_speaker_id = nextProps.match.params.speaker_id;

        if (summits.length == 0) {
            this.props.loadSummits();
        }

        if(speakerId != new_speaker_id) {
            this.setState({speakerId: new_speaker_id});

            if(new_speaker_id) {
                this.props.getSpeaker(new_speaker_id);
            } else {
                this.props.resetSpeakerForm();
            }
        }
    }

    componentDidMount () {
        let speakerId = this.props.match.params.speaker_id;

        if (speakerId != null) {
            this.props.getSpeaker(speakerId);
        } else {
            this.props.resetSpeakerForm();
        }
    }

    render(){
        let {entity, errors, summits, history, saveSpeaker, attachPicture} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        if (summits.lenght === 0) return (<div> Hold on...</div>);

        return(
            <div className="container">
                <h3>{title} {T.translate("general.speaker")}</h3>
                <hr/>
                <SpeakerForm
                    summits={summits}
                    history={history}
                    entity={entity}
                    errors={errors}
                    onSubmit={saveSpeaker}
                    onAttach={attachPicture}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSpeakerState }) => ({
    ...currentSpeakerState
})

export default connect (
    mapStateToProps,
    {
        loadSummits,
        getSpeaker,
        resetSpeakerForm,
        saveSpeaker,
        attachPicture
    }
)(EditSummitSpeakerPage);