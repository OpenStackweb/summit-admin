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
import MergeSpeakerForm from '../components/speaker-form/merge-speaker-form';
import SpeakerInput from '../components/speaker-input'
import { getSummitById }  from '../actions/summit-actions';
import { getSpeakerForMerge, mergeSpeakers } from "../actions/speaker-actions";
import '../styles/merge-speakers-page.less';

class MergeSpeakerPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selected: props.selected
        }

        this.handleChangeSpeaker = this.handleChangeSpeaker.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleMerge = this.handleMerge.bind(this);
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }
    }

    handleChangeSpeaker(ev) {
        let {value, id} = ev.target;
        let selected = {...this.props.selected};

        this.setState({selected: selected})

        this.props.getSpeakerForMerge(value.id, id);
    }

    handleSelect(field, column) {
        let selected = {...this.state.selected};

        selected[field] = column;

        this.setState({selected: selected});
    }

    handleMerge(ev) {

        this.props.mergeSpeakers();
    }

    render(){
        let {currentSummit, history, speakerOne, speakerTwo, canMerge} = this.props;
        let {selected} = this.state;

        if(currentSummit == null) return;

        return(
            <div className="container">
                <h3>{T.translate("merge_speakers.merge_speakers")}</h3>
                <hr/>
                <div className="row">
                    <div className="col-md-6">
                        <div className="row">
                            <div className="form-group col-md-10 col-md-offset-2">
                                <label> {T.translate("merge_speakers.speaker_one")} </label>
                                <SpeakerInput
                                    id="speakerOne"
                                    value={speakerOne}
                                    onChange={this.handleChangeSpeaker}
                                    summit={currentSummit}
                                    multi={false}
                                    history={history}
                                />
                            </div>
                        </div>
                        <MergeSpeakerForm
                            onSelect={this.handleSelect}
                            currentSummit={currentSummit}
                            entity={speakerOne}
                            column={1}
                            selected={selected}
                        />
                    </div>
                    <div className="col-md-6">
                        <div className="row">
                            <div className="form-group col-md-10">
                                <label> {T.translate("merge_speakers.speaker_two")} </label>
                                <SpeakerInput
                                    id="speakerTwo"
                                    value={speakerTwo}
                                    onChange={this.handleChangeSpeaker}
                                    summit={currentSummit}
                                    multi={false}
                                    history={history}
                                />
                            </div>
                        </div>
                        <MergeSpeakerForm
                            onSelect={this.handleSelect}
                            currentSummit={currentSummit}
                            entity={speakerTwo}
                            column={2}
                            selected={selected}
                        />
                    </div>
                </div>
                <div className="row merge-button-box">
                    <div className="col-md-12 text-center">
                        <input type="button" onClick={this.handleMerge} disabled={canMerge}
                               className="btn btn-primary" value={T.translate("merge_speakers.merge")} />
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSpeakerMergeState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentSpeakerMergeState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSpeakerForMerge,
        mergeSpeakers
    }
)(MergeSpeakerPage);