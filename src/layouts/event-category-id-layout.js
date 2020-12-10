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
import { Switch, Route, withRouter } from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';
import EditEventCategoryPage from '../pages/events/edit-event-category-page';
import EditEventCategoryQuestionPage from '../pages/events/edit-event-category-question-page';
import NoMatchPage from "../pages/no-match-page";
import {connect} from "react-redux";
import {getEventCategory, resetEventCategoryForm} from "../actions/event-category-actions";


class EventCategoryIdLayout extends React.Component {

    constructor(props) {
        super(props);

        const eventCategoryId = props.match.params.event_category_id;

        if (!eventCategoryId) {
            props.resetEventCategoryForm();
        } else {
            props.getEventCategory(eventCategoryId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.event_category_id;
        let newId = newProps.match.params.event_category_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetEventCategoryForm();
            } else {
                this.props.getEventCategory(newId);
            }
        }
    }

    render(){
        let { match, currentEventCategory } = this.props;
        let breadcrumb = currentEventCategory.id ? currentEventCategory.name : T.translate("general.new");

        return(
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route path={`${match.url}/questions`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_event_category.questions"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route exact strict path={`${props.match.url}/new`} component={EditEventCategoryQuestionPage} />
                                    <Route exact strict path={`${props.match.url}/:category_question_id(\\d+)`} component={EditEventCategoryQuestionPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route strict exact path={match.url} component={EditEventCategoryPage} />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentEventCategoryState }) => ({
    currentEventCategory: currentEventCategoryState.entity
})

export default Restrict(connect (
    mapStateToProps,
    {
        getEventCategory,
        resetEventCategoryForm
    }
)(EventCategoryIdLayout), 'events');

