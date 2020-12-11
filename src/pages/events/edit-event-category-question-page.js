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
import { Breadcrumb } from 'react-breadcrumbs';
import {
    getEventCategoryQuestion,
    resetEventCategoryQuestionForm,
    saveEventCategoryQuestion,
    getEventCategoryQuestionMeta,
    saveEventCategoryQuestionValue,
    deleteEventCategoryQuestionValue
} from "../../actions/event-category-actions";
import EventCategoryQuestionForm from "../../components/forms/event-category-question-form";
//import '../../styles/edit-summit-attendee-page.less';

class EditEventCategoryQuestionPage extends React.Component {

    constructor(props) {
        const eventCategoryQuestionId = props.match.params.category_question_id;
        super(props);

        if (!eventCategoryQuestionId) {
            props.resetEventCategoryQuestionForm();
        } else {
            props.getEventCategoryQuestion(eventCategoryQuestionId);
        }

        props.getEventCategoryQuestionMeta();

        this.handleSaveValue = this.handleSaveValue.bind(this);
        this.handleDeleteValue = this.handleDeleteValue.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.category_question_id;
        const newId = this.props.match.params.category_question_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetEventCategoryQuestionForm();
            } else {
                this.props.getEventCategoryQuestion(newId);
            }
        }
    }

    handleSaveValue(value) {
        const {entity} = this.props;

        this.props.saveEventCategoryQuestionValue(entity.id, value);
    }

    handleDeleteValue(valueId) {
        const {entity} = this.props;

        this.props.deleteEventCategoryQuestionValue(entity.id, valueId);
    }

    render(){
        const {currentSummit, currentEventCategory, allClasses, entity, errors, match} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        if (!currentEventCategory.id) return (<div/>);

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_event_category_question.extra_question")}</h3>
                <hr/>
                {currentSummit &&
                <EventCategoryQuestionForm
                    entity={entity}
                    allClasses={allClasses}
                    errors={errors}
                    onSubmit={this.props.saveEventCategoryQuestion}
                    onSaveValue={this.handleSaveValue}
                    onDeleteValue={this.handleDeleteValue}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentEventCategoryState, currentEventCategoryQuestionState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentEventCategory: currentEventCategoryState.entity,
    ...currentEventCategoryQuestionState
});

export default connect (
    mapStateToProps,
    {
        resetEventCategoryQuestionForm,
        getEventCategoryQuestion,
        saveEventCategoryQuestion,
        getEventCategoryQuestionMeta,
        saveEventCategoryQuestionValue,
        deleteEventCategoryQuestionValue
    }
)(EditEventCategoryQuestionPage);
