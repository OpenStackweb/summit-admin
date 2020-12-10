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

import EditRsvpQuestionPage from '../pages/rsvps/edit-rsvp-question-page';
import NoMatchPage from "../pages/no-match-page";
import { getRsvpQuestionMeta, getRsvpQuestion, resetRsvpQuestionForm }  from '../actions/rsvp-template-actions';


class RsvpQuestionLayout extends React.Component {

    constructor(props) {
        super(props);

        const rsvpQuestionId = props.match.params.rsvp_question_id;
        const {currentRsvpTemplate} = this.props;

        if (!rsvpQuestionId || rsvpQuestionId === 'new' || !currentRsvpTemplate) {
            props.resetRsvpQuestionForm();
        } else {
            props.getRsvpQuestion(currentRsvpTemplate.id, rsvpQuestionId);
        }

        props.getRsvpQuestionMeta();
    }

    componentWillReceiveProps(newProps) {
        let {currentRsvpTemplate} = newProps;
        let oldId = this.props.match.params.rsvp_question_id;
        let newId = newProps.match.params.rsvp_question_id;

        if (newId !== oldId) {
            if (newId === 'new') {
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

        if (!allClasses.length) return (<div/>);
        if (rsvpQuestionId && !entity.id) return (<div/>);

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <Switch>
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
});

export default connect (
    mapStateToProps,
    {
        getRsvpQuestionMeta,
        getRsvpQuestion,
        resetRsvpQuestionForm
    }
)(RsvpQuestionLayout);





