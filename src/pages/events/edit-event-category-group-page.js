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
import EventCategoryGroupForm from '../../components/forms/event-category-group-form';
import { getEventCategoryGroup, resetEventCategoryGroupForm, saveEventCategoryGroup } from "../../actions/event-category-actions";
//import '../../styles/edit-summit-attendee-page.less';

class EditEventCategoryGroupPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount () {
        let {entity} = this.props;
        let groupId = this.props.match.params.group_id;

        if (!groupId) {
            this.props.resetEventCategoryGroupForm();
        } else if (entity.id != groupId) {
            this.props.getEventCategoryGroup(groupId);
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_event_category_group.event_category_group")}</h3>
                <hr/>
                {currentSummit &&
                <EventCategoryGroupForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveEventCategoryGroup}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentEventCategoryState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentEventCategoryState
})

export default connect (
    mapStateToProps,
    {
        getEventCategoryGroup,
        resetEventCategoryGroupForm,
        saveEventCategoryGroup
    }
)(EditEventCategoryGroupPage);