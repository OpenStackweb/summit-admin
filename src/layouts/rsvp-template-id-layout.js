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

import { getRsvpTemplate, resetRsvpTemplateForm }  from '../actions/rsvp-template-actions';

import EditRsvpQuestionLayout from './rsvp-question-layout';
import EditRsvpTemplatePage from '../pages/rsvps/edit-rsvp-template-page';
import EditRsvpQuestionPage from '../pages/rsvps/edit-rsvp-question-page';

class RsvpTemplateIdLayout extends React.Component {

    componentWillMount() {
        let rsvpTemplateId = this.props.match.params.rsvp_template_id;

        if (!rsvpTemplateId) {
            this.props.resetRsvpTemplateForm();
        } else {
            this.props.getRsvpTemplate(rsvpTemplateId);
        }
    }

    render() {
        let {match, currentRsvpTemplate} = this.props;
        let breadcrumb = currentRsvpTemplate.id ? currentRsvpTemplate.title : T.translate("general.new");

        return (
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <Switch>
                    <Route path={`${match.url}/questions`} render={
                        q_props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_rsvp_template.questions"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route exact path={`${q_props.match.url}/new`} render={
                                        props => (
                                            <div>
                                                <Breadcrumb data={{ title: T.translate("general.new"), pathname: props.match.url }} ></Breadcrumb>
                                                <EditRsvpQuestionPage {...props} />
                                            </div>
                                        )}
                                    />
                                    <Route path={`${q_props.match.url}/:rsvp_question_id`} component={EditRsvpQuestionLayout} />
                                    <Route component={EditRsvpTemplatePage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route component={EditRsvpTemplatePage}/>
                </Switch>
            </div>
        );
    }
}


const mapStateToProps = ({ currentRsvpTemplateState }) => ({
    currentRsvpTemplate   : currentRsvpTemplateState.entity
})

export default connect (
    mapStateToProps,
    {
        getRsvpTemplate,
        resetRsvpTemplateForm
    }
)(RsvpTemplateIdLayout);






