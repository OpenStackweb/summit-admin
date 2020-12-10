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
import Swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import MergeSpeakerForm from '../../components/forms/merge-speaker-form/merge-speaker-form';
import { SpeakerInput } from 'openstack-uicore-foundation/lib/components'
import { getSummitById }  from '../../actions/summit-actions';
import { getSpeakerForMerge, mergeSpeakers } from "../../actions/speaker-actions";
import '../../styles/merge-speakers-page.less';

class MergeSpeakerPage extends React.Component {

    constructor(props) {
        const {speakers} = props;
        super(props);

        this.state = {
            selectedFields: {...props.selectedFields},
            canMerge: false
        };

        if(speakers[0] && speakers[1]) {
            this.state.canMerge= true;
        }

        this.handleChangeSpeaker = this.handleChangeSpeaker.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleMerge = this.handleMerge.bind(this);
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
        const selectedFields = {...this.state.selectedFields};
        const {speakers, mergeSpeakers} = this.props;
        const changedFields = [];

        for (let key in selectedFields) {
            let field = selectedFields[key];
            selectedFields[key] = speakers[field].id;

            if (field === 0) changedFields.push(key);
        }

        Swal.fire({
            title: T.translate("general.attention"),
            text: T.translate("merge_speakers.merge_warning"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("merge_speakers.merge_and_delete")
        }).then(function(result){
            if (result.value) {
                mergeSpeakers(speakers, selectedFields, changedFields);
            }
        });

    }

    render(){
        const {allSummits, history, speakers, match} = this.props;
        const {selectedFields, canMerge} = this.state;

        return(
            <div className="container">
                <Breadcrumb data={{ title: T.translate("merge_speakers.merge"), pathname: match.url }} />
                <h3>{T.translate("merge_speakers.merge_speakers")}</h3>
                <hr/>
                <div className="row">
                    <div className="col-md-5 col-md-offset-2">
                        <label> {T.translate("merge_speakers.speaker_from")} </label>
                        <SpeakerInput
                            id="0"
                            value={speakers[0]}
                            onChange={this.handleChangeSpeaker}
                            clearable={false}
                            history={history}
                        />

                    </div>
                    <div className="col-md-5">
                        <label> {T.translate("merge_speakers.speaker_to")} </label>
                        <SpeakerInput
                            id="1"
                            value={speakers[1]}
                            onChange={this.handleChangeSpeaker}
                            clearable={false}
                            history={history}
                        />
                    </div>
                </div>
                <div className="row">
                    <MergeSpeakerForm
                        onSelect={this.handleSelect}
                        allSummits={allSummits}
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

const mapStateToProps = ({ directoryState, currentSpeakerMergeState }) => ({
    allSummits : directoryState.summits,
    ...currentSpeakerMergeState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSpeakerForMerge,
        mergeSpeakers
    }
)(MergeSpeakerPage);
