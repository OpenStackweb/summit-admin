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
import LocationForm from '../../components/forms/location-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getLocation, getLocationMeta, resetLocationForm, saveLocation, updateLocationMap, updateAddress } from "../../actions/location-actions";
import '../../styles/edit-location-page.less';

class EditLocationPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            locationId: props.match.params.location_id
        }
    }

    componentWillReceiveProps(nextProps) {
        let {locationId} = this.state;

        let new_location_id = nextProps.match.params.location_id;

        if(locationId != new_location_id) {

            this.setState({locationId: new_location_id});

            if(new_location_id) {
                this.props.getLocation(new_location_id);
            } else {
                this.props.resetLocationForm();
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
        let {currentSummit, allClasses, errors} = this.props;
        let locationId = this.props.match.params.location_id;

        if(currentSummit != null) {
            if (locationId != null) {
                this.props.getLocation(locationId);
            } else {
                this.props.resetLocationForm();
            }

            if(allClasses.length == 0){
                this.props.getLocationMeta();
            }
        }
    }

    render(){
        let {currentSummit, allClasses, entity, errors, history} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");

        return(
            <div className="container">
                <h3>{title} {T.translate("edit_location.location")}</h3>
                <hr/>
                {currentSummit &&
                <LocationForm
                    history={history}
                    currentSummit={currentSummit}
                    allClasses={allClasses}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveLocation}
                    onMapUpdate={this.props.updateLocationMap}
                    onMarkerDragged={this.props.updateAddress}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentLocationState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentLocationState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getLocation,
        getLocationMeta,
        resetLocationForm,
        saveLocation,
        updateLocationMap,
        updateAddress
    }
)(EditLocationPage);