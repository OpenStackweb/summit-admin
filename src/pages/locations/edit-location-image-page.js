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
import ImageForm from '../../components/forms/image-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getLocationImage, resetLocationImageForm, saveLocationImage, attachLocationImage } from "../../actions/location-actions";

class EditLocationImagePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            imageId: props.match.params.image_id
        }
    }

    componentWillReceiveProps(nextProps) {
        let {imageId} = this.state;

        let new_image_id = nextProps.match.params.image_id;

        if(imageId != new_image_id) {

            this.setState({imageId: new_image_id});

            if(new_image_id) {
                this.props.getLocationImage(new_image_id);
            } else {
                this.props.resetLocationImageForm();
            }
        }
    }

    componentWillMount () {
        let summitId = this.props.match.params.summit_id;
        let {currentSummit} = this.props;

        if(currentSummit == null){
            this.props.getSummitById(summitId);
        }
    }

    componentDidMount () {
        let {currentSummit, allTypes, errors} = this.props;
        let imageId = this.props.match.params.image_id;

        if(currentSummit != null) {
            if (imageId != null) {
                this.props.getLocationImage(imageId);
            } else {
                this.props.resetLocationImageForm();
            }
        }
    }

    render(){
        let {currentSummit, entity, errors} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_location.image")}</h3>
                <hr/>
                {currentSummit &&
                <ImageForm
                    history={this.props.history}
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveLocationImage}
                    onAttach={attachLocationImage}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentLocationImageState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentLocationImageState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocationImage,
        resetLocationImageForm,
        saveLocationImage,
    }
)(EditLocationImagePage);