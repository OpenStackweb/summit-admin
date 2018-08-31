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
import { Switch, Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

import { getLocation, resetLocationForm, getLocationMeta }  from '../actions/location-actions';

import EditLocationPage from '../pages/locations/edit-location-page'
import EditFloorPage from '../pages/locations/edit-floor-page';
import EditRoomPage from '../pages/locations/edit-room-page';
import EditLocationImagePage from '../pages/locations/edit-location-image-page';
import EditLocationMapPage from '../pages/locations/edit-location-map-page';
import NoMatchPage from "../pages/no-match-page";


class LocationIdLayout extends React.Component {

    componentWillMount() {
        let locationId = this.props.match.params.location_id;

        if (!locationId) {
            this.props.resetLocationForm();
        } else {
            this.props.getLocation(locationId);
        }

        this.props.getLocationMeta();
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.location_id;
        let newId = newProps.match.params.location_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetLocationForm();
            } else {
                this.props.getLocation(newId);
            }
        }
    }

    render(){
        let { match, currentLocation } = this.props;
        let breadcrumb = currentLocation.id ? currentLocation.name : T.translate("general.new");

        return(
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <Switch>
                    <Route exact strict path={match.url} component={EditLocationPage}/>
                    <Route path={`${match.url}/floors`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_floor.floors"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/new`} component={EditFloorPage} />
                                    <Route strict exact path={`${props.match.url}/:floor_id(\\d+)`} component={EditFloorPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/rooms`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_room.rooms"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/new`} component={EditRoomPage} />
                                    <Route strict exact path={`${props.match.url}/:room_id`} component={EditRoomPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/images`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_location_image.images"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/new`} component={EditLocationImagePage} />
                                    <Route strict exact path={`${props.match.url}/:image_id`} component={EditLocationImagePage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/maps`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_location_map.maps"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/new`} component={EditLocationMapPage} />
                                    <Route strict exact path={`${props.match.url}/:map_id`} component={EditLocationMapPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}


const mapStateToProps = ({ currentLocationState }) => ({
    currentLocation   : currentLocationState.entity
})

export default connect (
    mapStateToProps,
    {
        getLocation,
        resetLocationForm,
        getLocationMeta
    }
)(LocationIdLayout);

