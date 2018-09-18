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
import { Breadcrumb } from 'react-breadcrumbs';
import RsvpQuestionForm from '../../components/forms/rsvp-question-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpQuestion, resetRsvpQuestionForm, saveRsvpQuestion, getRsvpQuestionMeta, deleteRsvpQuestionValue, updateQuestionValuesOrder } from "../../actions/rsvp-template-actions";

class EditRsvpQuestionPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleValueDelete = this.handleValueDelete.bind(this);
        this.handleValueReorder = this.handleValueReorder.bind(this);
    }

    handleValueDelete(valueId) {
        let {rsvpQuestionId, rsvpTemplateId} = this.state;
        let {deleteRsvpQuestionValue, entity} = this.props;
        let value = entity.values.find(v => v.id == valueId);

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

    handleValueReorder(values, valueId, newOrder) {
        let {updateQuestionValuesOrder, currentTemplate, entity} = this.props;
        updateQuestionValuesOrder(values, currentTemplate.id, entity.id, valueId, newOrder);
    }

    render(){
        let {currentSummit, currentTemplate, entity, match, errors, allClasses} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div>
                <div className="container">
                    <h3>{title} {T.translate("edit_rsvp_question.rsvp_question")}</h3>
                    <hr/>
                    {currentSummit &&
                    <RsvpQuestionForm
                        history={this.props.history}
                        currentSummit={currentSummit}
                        rsvpTemplateId={currentTemplate.id}
                        allClasses={allClasses}
                        entity={entity}
                        errors={errors}
                        onValueDelete={this.handleValueDelete}
                        onValueReorder={this.handleValueReorder}
                        onSubmit={this.props.saveRsvpQuestion}
                    />
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRsvpTemplateState, currentRsvpQuestionState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentTemplate : currentRsvpTemplateState.entity,
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
        deleteRsvpQuestionValue,
        updateQuestionValuesOrder
    }
)(EditRsvpQuestionPage);
