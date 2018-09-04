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
import { Switch, Route, Redirect } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

import { getRsvpQuestionMeta, getRsvpQuestion, resetRsvpQuestionForm }  from '../actions/rsvp-template-actions';

import EditRsvpQuestionPage from '../pages/rsvps/edit-rsvp-question-page';
import EditRsvpQuestionValuePage from '../pages/rsvps/edit-rsvp-question-value-page';
import NoMatchPage from "../pages/no-match-page";

class RsvpQuestionLayout extends React.Component {

    componentWillMount() {
        let rsvpQuestionId = this.props.match.params.rsvp_question_id;
        let {currentRsvpTemplate} = this.props;

        if (!rsvpQuestionId || rsvpQuestionId == 'new' || !currentRsvpTemplate) {
            this.props.resetRsvpQuestionForm();
        } else {
            this.props.getRsvpQuestion(currentRsvpTemplate.id, rsvpQuestionId);
        }

        this.props.getRsvpQuestionMeta();
    }

    componentWillReceiveProps(newProps) {
        let {currentRsvpTemplate} = newProps;
        let oldId = this.props.match.params.rsvp_question_id;
        let newId = newProps.match.params.rsvp_question_id;

        if (newId != oldId) {
            if (newId == 'new') {
                this.props.resetRsvpQuestionForm();
            } else {
                this.props.getRsvpQuestion(currentRsvpTemplate.id, newId);
            }
        }
    }

    render() {
        let {match, entity, allClasses} = this.props;
        let rsvpQuestionId = match.params.rsvp_question_id;
        let breadcrumb = entity.id ? entity.name : T.translate("general.new");

        if (!allClasses.length) return (<div></div>);
        if (rsvpQuestionId && !entity.id) return (<div></div>);

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <Switch>
                    <Route path={`${match.url}/values`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_rsvp_question.values"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/:rsvp_question_value_id(\\d+)`} component={EditRsvpQuestionValuePage} />
                                    <Route exact strict path={`${props.match.url}/new`} component={EditRsvpQuestionValuePage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={match.url} component={EditRsvpQuestionPage}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }
}

const mapStateToProps = ({ currentRsvpTemplateState, currentRsvpQuestionState }) => ({
    currentRsvpTemplate   : currentRsvpTemplateState.entity,
    ...currentRsvpQuestionState
})

export default connect (
    mapStateToProps,
    {
        getRsvpQuestionMeta,
        getRsvpQuestion,
        resetRsvpQuestionForm
    }
)(RsvpQuestionLayout);





