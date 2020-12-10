/**
 * Copyright 2020 OpenStack Foundation
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
import { SimpleForm } from 'openstack-uicore-foundation/lib/components';
import { getMediaFileType, resetMediaFileTypeForm, saveMediaFileType } from "../../actions/media-file-type-actions";

//import '../../styles/edit-media-file-type-page.less';


class EditMediaFileTypePage extends React.Component {

    constructor(props) {
        const mediaFileTypeId = props.match.params.media_file_type_id;
        super(props);

        this.state = {};

        if (!mediaFileTypeId) {
            props.resetMediaFileTypeForm();
        } else {
            props.getMediaFileType(mediaFileTypeId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.media_file_type_id;
        let newId = newProps.match.params.media_file_type_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetTemplateForm();
            } else {
                this.props.getMediaFileType(newId);
            }
        }
    }

    render(){
        let {entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        let fields = [
            {type: 'text', name: 'name', label: T.translate("media_file_type.name")},
            {type: 'textarea', name: 'description', label: T.translate("media_file_type.description")},
            {type: 'textarea', name: 'allowed_extensions', label: T.translate("media_file_type.allowed_extensions_input")},
        ];

        return(
            <div className="container edit-media-file-types-page">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("media_file_type.media_file_type")}</h3>
                <hr/>
                <SimpleForm
                    entity={entity}
                    errors={errors}
                    fields={fields}
                    onSubmit={this.props.saveMediaFileType}
                />
            </div>

        )
    }
}

const mapStateToProps = ({ mediaFileTypeState }) => ({
    ...mediaFileTypeState
});

export default connect (
    mapStateToProps,
    {
        getMediaFileType,
        resetMediaFileTypeForm,
        saveMediaFileType
    }
)(EditMediaFileTypePage);
