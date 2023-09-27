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
import NoMatchPage from "../pages/no-match-page";
import OfflineRoomBookingPage from '../pages/room_bookings/offline-room-booking-page';


class RoomBookingsLayout extends React.Component {

    render(){
        const { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("room_bookings.room_bookings"), pathname: match.url }} />

                <Switch>
                    <Route strict exact path={match.url} component={RoomBookingListPage}/>
                    <Route strict exact path={`${match.url}/:room_booking_id(\\d+)`} component={EditRoomBookingPage}/>
                    <Route strict exact path={`${match.url}/new`} component={OfflineRoomBookingPage}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default Restrict(withRouter(RoomBookingsLayout), 'room_bookings');


