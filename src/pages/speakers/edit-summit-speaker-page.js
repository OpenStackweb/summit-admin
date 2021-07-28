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
import SpeakerForm from '../../components/forms/speaker-form';
import { getSpeaker, resetSpeakerForm, saveSpeaker, attachPicture } from "../../actions/speaker-actions";
import { loadSummits } from '../../actions/summit-actions';
import '../../styles/edit-summit-speaker-page.less';

class EditSummitSpeakerPage extends React.Component {

    constructor(props) {
        const {summits, match} = props;
        const speakerId = match.params.speaker_id;
        super(props);

        if (!speakerId) {
            props.resetSpeakerForm();
        } else {
            props.getSpeaker(speakerId);
        }

        if (summits.length === 0) {
            props.loadSummits();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.speaker_id;
        const newId = this.props.match.params.speaker_id;

        if (newId !== oldId) {
            if (!newId) {
                this.props.resetSpeakerForm();
            } else {
                this.props.getSpeaker(newId);
            }
        }
    }

    render(){

        const {entity, errors, summits, history, saveSpeaker, attachPicture, match} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.first_name+' '+entity.last_name : T.translate("general.new");

        if (summits.lenght === 0) return (<div> Hold on...</div>);

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
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

const mapStateToProps = ({ currentSpeakerState, directoryState }) => ({
    summits: directoryState.summits,
    ...currentSpeakerState
});

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
