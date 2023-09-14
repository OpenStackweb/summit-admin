/**
 * Copyright 2018 OpenStack Foundation
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
import RegFeedMetadataForm from '../../components/forms/reg-feed-metadata-form';
import { resetRegFeedMetadataForm, getRegFeedMetadata, saveRegFeedMetadata } from '../../actions/reg-feed-metadata-actions';

class EditRegFeedMetadataPage extends React.Component {

    constructor(props) {
        super(props);

        let regFeedMetadataId = this.props.match.params.reg_feed_metadata_id;        

        if (!regFeedMetadataId) {
            this.props.resetRegFeedMetadataForm();
        } else {
            this.props.getRegFeedMetadata(regFeedMetadataId);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.reg_feed_metadata_id;
        const newId = this.props.match.params.reg_feed_metadata_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetRegFeedMetadataForm();
            } else {
                this.props.getRegFeedMetadata(newId);
            }
        }
    }

    render() {
        const { entity } = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return (
            <div className="container">
                <h3>{title} {T.translate("edit_reg_feed_metadata.reg_feed_metadata")}</h3>
                <hr />
                <RegFeedMetadataForm
                    entity={entity}
                    onSubmit={this.props.saveRegFeedMetadata}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRegFeedMetadataState }) => ({
    currentSummit: currentSummitState.currentSummit,
    ...currentRegFeedMetadataState
});

export default connect(
    mapStateToProps,
    {
        getRegFeedMetadata,
        resetRegFeedMetadataForm,
        saveRegFeedMetadata,
    }
)(EditRegFeedMetadataPage);
