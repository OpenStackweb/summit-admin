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
import TagGroupForm from '../../components/forms/tag-group-form';
import { getTagGroup, resetTagGroupForm, saveTagGroup } from "../../actions/tag-actions";
//import '../../styles/edit-tag-group-page.less';

class EditTagGroupPage extends React.Component {

    componentWillMount () {
        let tagGroupId = this.props.match.params.tag_group_id;

        if (!tagGroupId) {
            this.props.resetTagGroupForm();
        } else {
            this.props.getTagGroup(tagGroupId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.tag_group_id;
        let newId = newProps.match.params.tag_group_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetTagGroupForm();
            } else {
                this.props.getTagGroup(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.label : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_tag_group.tag_group")}</h3>
                <hr/>
                {currentSummit &&
                <TagGroupForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveTagGroup}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentTagGroupState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentTagGroupState
})

export default connect (
    mapStateToProps,
    {
        getTagGroup,
        resetTagGroupForm,
        saveTagGroup
    }
)(EditTagGroupPage);
