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

import { getRsvpTemplate }  from '../actions/rsvp-template-actions';

import RsvpTemplateListPage from '../pages/rsvps/rsvp-template-list-page';
import EditRsvpTemplatePage from '../pages/rsvps/edit-rsvp-template-page';
import EditRsvpQuestionPage from '../pages/rsvps/edit-rsvp-question-page';
import EditRsvpQuestionValuePage from '../pages/rsvps/edit-rsvp-question-value-page';


class RsvpTemplateLayout extends React.Component {

    componentWillMount() {
        let rsvpTemplateId = this.props.match.params.rsvp_template_id;
        let {currentRsvpTemplate} = this.props;

        if (rsvpTemplateId) {
            if(currentRsvpTemplate == null || currentRsvpTemplate.id != rsvpTemplateId){
                this.props.getRsvpTemplate(rsvpTemplateId);
            }
        }
    }

    render(){
        let { match, currentRsvpTemplate } = this.props;
        let t_breadcrumb = currentRsvpTemplate.id ? currentRsvpTemplate.title : T.translate("general.new");

        return(
            <div>
                <Breadcrumb data={{ title: 'Rsvp Templates', pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route exact path={`${match.url}/new`} component={EditRsvpTemplatePage}/>
                    <Route path={`${match.url}/:rsvp_template_id`} render={
                        rsvp_props => (
                            <div>
                                <Breadcrumb data={{ title: t_breadcrumb, pathname: rsvp_props.match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route path={`${rsvp_props.match.url}/questions`} render={
                                        q_props => (
                                            <div>
                                                <Breadcrumb data={{ title: 'Questions', pathname: rsvp_props.match.url }} ></Breadcrumb>
                                                <Switch>
                                                    <Route exact path={`${q_props.match.url}/new`} component={EditRsvpQuestionPage} />
                                                    <Route path={`${q_props.match.url}/:rsvp_question_id`} render={
                                                        qq_props => {
                                                            let question = currentRsvpTemplate.questions.find(q => q.id == qq_props.match.params.rsvp_question_id);
                                                            let q_breadcrumb =  question.id ? question.name : T.translate("general.new");
                                                            return (<div>
                                                                <Breadcrumb data={{
                                                                    title: q_breadcrumb,
                                                                    pathname: qq_props.match.url
                                                                }}></Breadcrumb>
                                                                <Switch>
                                                                    <Route path={`${qq_props.match.url}/values`} render={
                                                                        v_props => (
                                                                            <div>
                                                                                <Breadcrumb data={{ title: 'Values', pathname: v_props.match.url }} ></Breadcrumb>
                                                                                <Switch>
                                                                                    <Route exact path={`${v_props.match.url}/new`} component={EditRsvpQuestionValuePage} />
                                                                                    <Route exact path={`${v_props.match.url}/:value_id`} component={EditRsvpQuestionValuePage} />
                                                                                </Switch>
                                                                            </div>
                                                                        )}
                                                                   />
                                                                    <Route component={EditRsvpQuestionPage}/>
                                                                </Switch>
                                                            </div>);
                                                        }
                                                    }
                                                    />
                                                    <Route component={EditRsvpTemplatePage}/>
                                                </Switch>
                                            </div>
                                        )}
                                    />
                                    <Route component={EditRsvpTemplatePage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route component={RsvpTemplateListPage}/>
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
        getRsvpTemplate
    }
)(RsvpTemplateLayout);



