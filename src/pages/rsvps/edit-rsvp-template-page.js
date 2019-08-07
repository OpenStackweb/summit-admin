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
import Swal from "sweetalert2";
import RsvpTemplateForm from '../../components/forms/rsvp-template-form';
import RsvpForm from '../../components/forms/rsvp-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpTemplate, resetRsvpTemplateForm, saveRsvpTemplate, updateQuestionsOrder, deleteRsvpQuestion } from "../../actions/rsvp-template-actions";
import { Modal } from 'react-bootstrap';

//import '../../styles/edit-rsvp-template-page.less';

class EditRsvpTemplatePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
        };

        this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);
        this.handleReorderQuestion = this.handleReorderQuestion.bind(this);
    }

    handleDeleteQuestion(rsvpQuestionId) {
        let {deleteRsvpQuestion, entity} = this.props;
        let question = entity.questions.find(q => q.id == rsvpQuestionId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_rsvp_template.remove_question_warning") + ' ' + question.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteRsvpQuestion(entity.id, rsvpQuestionId);
            }
        });
    }

    handleReorderQuestion(questions, questionId, newOrder) {
        let {updateQuestionsOrder, entity} = this.props;

        entity.questions = [...questions];

        this.setState({entity});
        updateQuestionsOrder(questions, entity.id, questionId, newOrder);
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        let sortedQuestions = [...entity.questions];
        sortedQuestions.sort(
            (a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0))
        );

        return(
            <div className="container">
                <h3>
                    {title} {T.translate("edit_rsvp_template.rsvp_template")}
                    <button className="btn btn-default pull-right" onClick={() => {this.setState({showModal: true})}}>
                        Preview
                    </button>
                </h3>
                <hr/>
                {currentSummit &&
                <RsvpTemplateForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onQuestionReorder={this.handleReorderQuestion}
                    onQuestionDelete={this.handleDeleteQuestion}
                    onSubmit={this.props.saveRsvpTemplate}
                />
                }

                <Modal show={this.state.showModal} onHide={() => {this.setState({showModal: false})}} >
                    <Modal.Header closeButton>
                        <Modal.Title>Preview - {entity.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <RsvpForm questions={sortedQuestions}/>
                    </Modal.Body>
                </Modal>
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
