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
import EventCommentForm from '../../components/forms/event-comment-form';
import {
    getEventCommentById,
    resetEventCommentForm,
    saveEventComment,    
} from "../../actions/event-comment-actions";

//import '../../styles/edit-event-material-page.less';

class EditEventCommentPage extends React.Component {

    constructor(props) {
        const commentId = props.match.params.comment_id;
        super(props);

        if (!commentId) {
            props.resetEventCommentForm();
        } else {
            props.getEventCommentById(commentId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.comment_id;
        const newId = this.props.match.params.comment_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetEventCommentForm();
            } else {
                this.props.getEventCommentById(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, event} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        if (!event) return(<div/>);

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_event_comment.comment")}</h3>
                <hr/>
                {currentSummit &&
                <EventCommentForm
                    currentSummit={currentSummit}
                    entity={entity}
                    event={event}
                    errors={errors}
                    onSubmit={this.props.saveEventComment}
                />
                }
            </div>

        )
    }
}

const mapStateToProps = ({ currentSummitState, currentEventCommentState, currentSummitEventState }) => ({
    currentSummit : currentSummitState.currentSummit,
    event: currentSummitEventState.entity,
    ...currentEventCommentState
});

export default connect (
    mapStateToProps,
    {
        getEventCommentById,
        resetEventCommentForm,
        saveEventComment,
    }
)(EditEventCommentPage);
