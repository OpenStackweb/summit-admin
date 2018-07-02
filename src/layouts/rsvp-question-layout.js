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
import { Switch, Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

import { getRsvpTemplate, getRsvpQuestion, resetRsvpQuestionForm }  from '../actions/rsvp-template-actions';

import EditRsvpQuestionPage from '../pages/rsvps/edit-rsvp-question-page';
import EditRsvpQuestionValuePage from '../pages/rsvps/edit-rsvp-question-value-page';

class EditRsvpQuestionLayout extends React.Component {

    componentWillMount() {
        let rsvpQuestionId = this.props.match.params.rsvp_question_id;
        let {currentRsvpTemplate} = this.props;

        if (!rsvpQuestionId || !currentRsvpTemplate) {
            this.props.resetRsvpQuestionForm();
        } else {
            this.props.getRsvpQuestion(currentRsvpTemplate.id, rsvpQuestionId);
        }
    }

    render() {
        let {match, currentRsvpQuestion} = this.props;
        let breadcrumb = currentRsvpQuestion.id ? currentRsvpQuestion.name : T.translate("general.new");

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }}></Breadcrumb>
                <Switch>
                    <Route path={`${match.url}/values`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_rsvp_question.values"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route exact path={`${props.match.url}/new`} component={EditRsvpQuestionValuePage} />
                                    <Route exact path={`${props.match.url}/:rsvp_question_value_id`} component={EditRsvpQuestionValuePage} />
                                </Switch>
                            </div>
                        )}
                    />
                    <Route component={EditRsvpQuestionPage}/>
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({ currentRsvpTemplateState, currentRsvpQuestionState }) => ({
    currentRsvpTemplate   : currentRsvpTemplateState.entity,
    currentRsvpQuestion   : currentRsvpQuestionState.entity
})

export default connect (
    mapStateToProps,
    {
        getRsvpQuestion,
        resetRsvpQuestionForm,
        getRsvpTemplate
    }
)(EditRsvpQuestionLayout);





