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
import RsvpTemplateForm from '../../components/forms/rsvp-template-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpTemplate, resetRsvpTemplateForm, saveRsvpTemplate, updateQuestionsOrder, deleteRsvpQuestion } from "../../actions/rsvp-template-actions";
//import '../../styles/edit-rsvp-template-page.less';

class EditRsvpTemplatePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rsvpTemplateId: props.match.params.rsvp_template_id
        }

        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);

    }

    componentWillReceiveProps(nextProps) {
        let {rsvpTemplateId} = this.state;

        let new_rsvp_template_id = nextProps.match.params.rsvp_template_id;

        if(rsvpTemplateId != new_rsvp_template_id) {

            this.setState({rsvpTemplateId: new_rsvp_template_id});

            if(new_rsvp_template_id) {
                this.props.getRsvpTemplate(new_rsvp_template_id);
            } else {
                this.props.resetRsvpTemplateForm();
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
        let {currentSummit, errors} = this.props;
        let rsvpTemplateId = this.props.match.params.rsvp_template_id;

        if(currentSummit != null) {
            if (rsvpTemplateId != null) {
                this.props.getRsvpTemplate(rsvpTemplateId);
            } else {
                this.props.resetRsvpTemplateForm();
            }
        }
    }

    handleDeleteQuestion(rsvpQuestionId, ev) {
        let {deleteRsvpQuestion, entity} = this.props;
        let {rsvpTemplateId} = this.state;
        let question = entity.questions.find(q => q.id == rsvpQuestionId);

        ev.preventDefault();

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_rsvp_template.remove_question_warning") + ' ' + question.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRsvpQuestion(rsvpTemplateId, rsvpQuestionId);
            }
        }).catch(swal.noop);
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_rsvp_template.rsvp_template")}</h3>
                <hr/>
                {currentSummit &&
                <RsvpTemplateForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onQuestionReorder={this.props.updateQuestionsOrder}
                    onQuestionDelete={this.handleDeleteQuestion}
                    onSubmit={this.props.saveRsvpTemplate}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRsvpTemplateState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentRsvpTemplateState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRsvpTemplate,
        resetRsvpTemplateForm,
        saveRsvpTemplate,
        updateQuestionsOrder,
        deleteRsvpQuestion
    }
)(EditRsvpTemplatePage);