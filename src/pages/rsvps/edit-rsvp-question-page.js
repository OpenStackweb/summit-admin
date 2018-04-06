/**
 * Copyright 2018 OpenStack Foundation
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
import swal from "sweetalert2";
import RsvpQuestionForm from '../../components/forms/rsvp-question-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpQuestion, resetRsvpQuestionForm, saveRsvpQuestion, getRsvpQuestionMeta, deleteRsvpQuestionValue } from "../../actions/rsvp-template-actions";

class EditRsvpQuestionPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rsvpTemplateId: props.match.params.rsvp_template_id,
            rsvpQuestionId: props.match.params.rsvp_question_id
        }

        this.handleValueDelete = this.handleValueDelete.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        let {rsvpQuestionId, rsvpTemplateId} = this.state;

        let new_question_id = nextProps.match.params.rsvp_question_id;
        let new_template_id = this.props.match.params.rsvp_template_id;

        if(rsvpQuestionId != new_question_id || rsvpTemplateId != new_template_id) {

            this.setState({
                rsvpTemplateId: new_template_id,
                rsvpQuestionId: new_question_id
            });

            if(new_question_id && new_template_id) {
                this.props.getRsvpQuestion(new_template_id, new_question_id);
            } else {
                this.props.resetRsvpQuestionForm();
            }
        }
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit, allClasses} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        } else {
            if(allClasses.length == 0){
                this.props.getRsvpQuestionMeta();
            }
        }
    }

    componentDidMount () {
        let {currentSummit, errors} = this.props;
        let rsvpTemplateId = this.props.match.params.rsvp_template_id;
        let rsvpQuestionId = this.props.match.params.rsvp_question_id;

        if(currentSummit != null) {
            if (rsvpQuestionId != null && rsvpTemplateId != null) {
                this.props.getRsvpQuestion(rsvpTemplateId, rsvpQuestionId);
            } else {
                this.props.resetRsvpQuestionForm();
            }
        }
    }

    handleValueDelete(valueId, ev) {
        let {rsvpQuestionId, rsvpTemplateId} = this.state;
        let {deleteRsvpQuestionValue, entity} = this.props;
        let value = entity.values.find(v => v.id == valueId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_rsvp_question.remove_value_warning") + ' ' + value.value,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRsvpQuestionValue(rsvpTemplateId, rsvpQuestionId, valueId);
            }
        }).catch(swal.noop);
    }

    render(){
        let {currentSummit, entity, errors, allClasses} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_rsvp_question.rsvp_question")}</h3>
                <hr/>
                {currentSummit &&
                <RsvpQuestionForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    rsvpTemplateId={this.state.rsvpTemplateId}
                    allClasses={allClasses}
                    entity={entity}
                    errors={errors}
                    onValueDelete={this.handleValueDelete}
                    onSubmit={this.props.saveRsvpQuestion}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRsvpQuestionState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentRsvpQuestionState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRsvpQuestion,
        resetRsvpQuestionForm,
        saveRsvpQuestion,
        getRsvpQuestionMeta,
        deleteRsvpQuestionValue
    }
)(EditRsvpQuestionPage);