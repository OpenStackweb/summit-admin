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
import T from "i18n-react/dist/i18n-react";
import { Switch, Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

import EditLocationPage from '../pages/locations/edit-location-page'
import LocationListPage from '../pages/locations/location-list-page'
import LocationIdLayout from './location-id-layout'


export default class LocationLayout extends React.Component {

    render(){
        let { match } = this.props;

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("location_list.locations"), pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route exact path={`${match.url}/new`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("general.new"), pathname: props.match.url }} ></Breadcrumb>
                                <EditLocationPage {...props} />
                            </div>
                        )}
                    />
                    <Route path={`${match.url}/:location_id`} component={LocationIdLayout} />
                    <Route component={LocationListPage}/>
                </Switch>
            </div>
        );
    }

}


