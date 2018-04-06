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
import SimpleForm from '../../components/forms/simple-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getRsvpQuestionValue, resetRsvpQuestionValueForm, saveRsvpQuestionValue } from "../../actions/rsvp-template-actions";

class EditRsvpQuestionValuePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rsvpTemplateId: props.match.params.rsvp_template_id,
            rsvpQuestionId: props.match.params.rsvp_question_id,
            rsvpQuestionValueId: props.match.params.rsvp_question_value_id
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let {rsvpQuestionId, rsvpTemplateId, rsvpQuestionValueId} = this.state;

        let new_template_id = nextProps.match.params.rsvp_template_id;
        let new_question_id = nextProps.match.params.rsvp_question_id;
        let new_question_value_id = nextProps.match.params.rsvp_question_value_id;


        if(rsvpQuestionId != new_question_id || rsvpTemplateId != new_template_id || rsvpQuestionValueId != new_question_value_id) {

            this.setState({
                rsvpTemplateId: new_template_id,
                rsvpQuestionId: new_question_id,
                rsvpQuestionValueId: new_question_value_id
            });

            if(new_question_id && new_template_id && new_question_value_id) {
                this.props.getRsvpQuestionValue(new_template_id, new_question_id, new_question_value_id);
            } else {
                this.props.resetRsvpQuestionValueForm();
            }
        }
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit, allClasses} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }
    }

    componentDidMount () {
        let {currentSummit, errors} = this.props;
        let rsvpTemplateId = this.props.match.params.rsvp_template_id;
        let rsvpQuestionId = this.props.match.params.rsvp_question_id;
        let rsvpQuestionValueId = this.props.match.params.rsvp_question_value_id;

        if(currentSummit != null) {
            if (rsvpQuestionId != null && rsvpTemplateId != null && rsvpQuestionValueId != null) {
                this.props.getRsvpQuestionValue(rsvpTemplateId, rsvpQuestionId, rsvpQuestionValueId);
            } else {
                this.props.resetRsvpQuestionValueForm();
            }
        }
    }

    handleSubmit(entity, history) {
        let {rsvpQuestionId, rsvpTemplateId} = this.state;
        this.props.saveRsvpQuestionValue(rsvpTemplateId, rsvpQuestionId, entity, history);
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let fields = [
            {type: 'text', name: 'value', label: T.translate("edit_rsvp_question_value.value")},
            {type: 'text', name: 'label', label: T.translate("edit_rsvp_question_value.label")}
        ];

        return(
            <div className="container">
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

const mapStateToProps = ({ currentSummitState, currentRsvpQuestionValueState }) => ({
    currentSummit : currentSummitState.currentSummit,
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