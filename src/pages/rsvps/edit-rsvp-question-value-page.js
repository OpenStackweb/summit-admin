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
import { Breadcrumb } from 'react-breadcrumbs';
import SimpleForm from '../../components/forms/simple-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpQuestionValue, resetRsvpQuestionValueForm, saveRsvpQuestionValue } from "../../actions/rsvp-template-actions";

class EditRsvpQuestionValuePage extends React.Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillMount () {
        let {currentTemplate, currentQuestion, entity} = this.props;
        let rsvpQuestionValueId = this.props.match.params.rsvp_question_value_id;

        if (rsvpQuestionValueId) {
            if (entity.id != rsvpQuestionValueId) {
                this.props.getRsvpQuestionValue(currentTemplate.id, currentQuestion.id, rsvpQuestionValueId);
            }
        } else {
            this.props.resetRsvpQuestionValueForm();
        }
    }

    handleSubmit(entity, history) {
        let {currentTemplate, currentQuestion} = this.props;
        this.props.saveRsvpQuestionValue(currentTemplate.id, currentQuestion.id, entity, history);
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let fields = [
            {type: 'text', name: 'value', label: T.translate("edit_rsvp_question_value.value")},
            {type: 'text', name: 'label', label: T.translate("edit_rsvp_question_value.label")}
        ];
        let breadcrumb = (entity.id) ? entity.label : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_rsvp_question_value.rsvp_question_value")}</h3>
                <hr/>
                {currentSummit &&
                <SimpleForm
                    history={this.props.history}
                    entity={entity}
                    errors={errors}
                    fields={fields}
                    onSubmit={this.handleSubmit}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRsvpTemplateState, currentRsvpQuestionState, currentRsvpQuestionValueState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentTemplate : currentRsvpTemplateState.entity,
    currentQuestion : currentRsvpQuestionState.entity,
    ...currentRsvpQuestionValueState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getRsvpQuestionValue,
        resetRsvpQuestionValueForm,
        saveRsvpQuestionValue
    }
)(EditRsvpQuestionValuePage);