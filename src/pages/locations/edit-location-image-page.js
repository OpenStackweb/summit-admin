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
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import ImageForm from '../../components/forms/image-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getLocationImage, resetLocationImageForm, saveLocationImage } from "../../actions/location-actions";

class EditLocationImagePage extends React.Component {

    constructor(props) {
        const {currentLocation, match} = props;
        const imageId = match.params.image_id;
        super(props);

        if (imageId != null && currentLocation != null) {
            props.getLocationImage(currentLocation.id, imageId);
        } else {
            props.resetLocationImageForm();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.image_id;
        const newId = this.props.match.params.image_id;
        const {currentLocation} = this.props;

        if (oldId !== newId && currentLocation) {
            this.props.getLocationImage(currentLocation.id, newId);
        }
    }

    render(){
        const {currentSummit, currentLocation, entity, errors, match} = this.props;
        const title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        const breadcrumb = (entity.id) ? entity.name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("edit_location.image")}</h3>
                <hr/>
                {currentSummit &&
                <ImageForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    locationId={currentLocation.id}
                    valueField="image_url"
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveLocationImage}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentLocationState, currentLocationImageState }) => ({
    currentSummit : currentSummitState.currentSummit,
    currentLocation : currentLocationState.entity,
    ...currentLocationImageState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocationImage,
        resetLocationImageForm,
        saveLocationImage,
    }
)(EditLocationImagePage);
