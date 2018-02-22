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
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
import MergeSpeakerForm from '../../components/forms/merge-speaker-form/merge-speaker-form';
import SpeakerInput from '../../components/inputs/speaker-input'
import { getSummitById }  from '../../actions/summit-actions';
import { getSpeakerForMerge, mergeSpeakers } from "../../actions/speaker-actions";
import '../../styles/merge-speakers-page.less';

class MergeSpeakerPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedFields: {...props.selectedFields},
            canMerge: false
        }

        this.handleChangeSpeaker = this.handleChangeSpeaker.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleMerge = this.handleMerge.bind(this);
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit, speakers} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }

        if(speakers[0] && speakers[1]) {
            this.setState({
                canMerge: true
            });
        }
    }

    componentWillReceiveProps(nextProps) {

        if(nextProps.speakers[0] && nextProps.speakers[1]) {
            this.setState({
                canMerge: true
            });
        }
    }

    handleChangeSpeaker(ev) {
        let {value, id} = ev.target;
        let selectedFields = {...this.props.selectedFields};

        this.setState({selectedFields: selectedFields})

        this.props.getSpeakerForMerge(value.id, id);
    }

    handleSelect(field, column) {
        let selectedFields = {...this.state.selectedFields};

        selectedFields[field] = column;

        this.setState({selectedFields: selectedFields});
    }

    handleMerge(ev) {
        let selectedFields = {...this.state.selectedFields};
        let {history, speakers} = this.props;
        let props = this.props;
        let changedFields = [];

        for (var key in selectedFields) {
            let field = selectedFields[key];
            selectedFields[key] = speakers[field].id;

            if (field == 0) changedFields.push(key);
        }

        swal({
            title: T.translate("general.attention"),
            text: T.translate("merge_speakers.merge_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("merge_speakers.merge_and_delete")
        }).then(function(){
            props.mergeSpeakers(speakers, selectedFields, changedFields, history);
        }).catch(swal.noop);

    }

    render(){
        let {currentSummit, history, speakers} = this.props;
        let {selectedFields, canMerge} = this.state;

        if(currentSummit == null) return (<div></div>);

        return(
            <div className="container">
                <h3>{T.translate("merge_speakers.merge_speakers")}</h3>
                <hr/>
                <div className="row">
                    <div className="col-md-5 col-md-offset-2">
                        <label> {T.translate("merge_speakers.speaker_from")} </label>
                        <SpeakerInput
                            id="0"
                            value={speakers[0]}
                            onChange={this.handleChangeSpeaker}
                            multi={false}
                            clearable={false}
                            history={history}
                            queryAll
                        />

                    </div>
                    <div className="col-md-5">
                        <label> {T.translate("merge_speakers.speaker_to")} </label>
                        <SpeakerInput
                            id="1"
                            value={speakers[1]}
                            onChange={this.handleChangeSpeaker}
                            multi={false}
                            clearable={false}
                            history={history}
                            queryAll
                        />
                    </div>
                </div>
                <div className="row">
                    <MergeSpeakerForm
                        onSelect={this.handleSelect}
                        currentSummit={currentSummit}
                        speakers={speakers}
                        selectedFields={selectedFields}
                    />
                </div>
                <div className="row merge-button-box">
                    <div className="col-md-12 text-center">
                        <input type="button" onClick={this.handleMerge} disabled={!canMerge}
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