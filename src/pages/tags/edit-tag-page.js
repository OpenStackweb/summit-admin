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
import TagForm from '../../components/forms/tag-form';
import { getTag, resetTagForm, saveTag } from '../../actions/tag-actions';
import '../../styles/edit-company-page.less';

class EditTagPage extends React.Component {

    constructor(props) {
        const tagId = props.match.params.tag_id;
        super(props);

        if (!tagId) {
            props.resetTagForm();
        } else {
            props.getTag(tagId);
        }        
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.tag_id;
        const newId = this.props.match.params.tag_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetTagForm();
            } else {
                this.props.getTag(newId);
            }
        }
    }

    render(){
        const { entity, errors, match, saveTag } = this.props;

        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_tag.tag")}</h3>
                <hr/>
                <TagForm
                    entity={entity}
                    errors={errors}
                    onSubmit={saveTag}                    
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentTagState }) => ({
    ...currentTagState,
});

export default connect (
    mapStateToProps,
    {
        getTag, 
        resetTagForm, 
        saveTag
    }
)(EditTagPage);
