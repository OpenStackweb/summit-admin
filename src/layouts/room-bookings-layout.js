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
import { Switch, Route, withRouter } from 'react-router-dom';
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';

import RoomBookingListPage from '../pages/room_bookings/room-booking-list-page'
import EditRoomBookingPage from '../pages/room_bookings/edit-room-booking-page'
import RoomBookingSettingsPage from '../pages/room_bookings/room-booking-settings-page'
import NoMatchPage from "../pages/no-match-page";
import EditRoomBookingAttributePage from "../pages/room_bookings/edit-room-booking-attribute-page";


class RoomBookingsLayout extends React.Component {

    render(){
        let { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("room_bookings.room_bookings"), pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route strict exact path={match.url} component={RoomBookingListPage}/>
                    <Route strict exact path={`${match.url}/:room_booking_id(\\d+)`} component={EditRoomBookingPage}/>
                    <Route path={`${match.url}/settings`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("room_bookings.settings"), pathname: props.match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}`} component={RoomBookingSettingsPage} />
                                    <Route strict exact path={`${props.match.url}/attributes/new`} component={EditRoomBookingAttributePage} />
                                    <Route strict exact path={`${props.match.url}/attributes/:attribute_id(\\d+)`} component={EditRoomBookingAttributePage} />
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

export default Restrict(withRouter(RoomBookingsLayout), 'room_bookings');


