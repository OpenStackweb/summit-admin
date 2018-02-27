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
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import NavMenu from '../components/nav-menu'
import ScheduleBuilderPage from '../pages/events/schedule-builder-page';
import SummitDirectoryPage from '../pages/directory/summit-directory-page';
import SummitDashboardPage from '../pages/dashboard/summit-dashboard-page';
import SummitEventListPage from '../pages/events/summit-event-list-page';
import EditSummitEventPage from '../pages/events/edit-summit-event-page';
import SummitEventsBulkActionsPage from '../pages/events/summit-events-bulk-actions-page';
import SpeakerAttendanceListPage from '../pages/speaker_attendance/speaker-attendance-list-page';
import EditSpeakerAttendancePage from '../pages/speaker_attendance/edit-speaker-attendance-page';
import SummitSpeakerListPage from '../pages/speakers/summit-speakers-list-page';
import EditSummitSpeakerPage from '../pages/speakers/edit-summit-speaker-page';
import MergeSpeakersPage from '../pages/speakers/merge-speakers-page';
import SummitAttendeeListPage from '../pages/attendees/summit-attendees-list-page';
import EditSummitAttendeePage from '../pages/attendees/edit-summit-attendee-page';
import PromocodeListPage from '../pages/promocodes/promocode-list-page';
import EditPromocodePage from '../pages/promocodes/edit-promocode-page';
import EventTypeListPage from '../pages/events/event-type-list-page';
import EditEventTypePage from '../pages/events/edit-event-type-page';
import EventCategoryListPage from '../pages/events/event-category-list-page';
import EditEventCategoryPage from '../pages/events/edit-event-category-page';
import LocationListPage from '../pages/locations/location-list-page';
import EditLocationPage from '../pages/locations/edit-location-page';
import EditFloorPage from '../pages/locations/edit-floor-page';
import EditRoomPage from '../pages/locations/edit-room-page';
import EditLocationImagePage from '../pages/locations/edit-location-image-page';
import EditLocationMapPage from '../pages/locations/edit-location-map-page';


import { withRouter } from 'react-router-dom'

class PrimaryLayout extends React.Component {

    componentWillMount() {
    }

    render(){
        let { match, currentSummit } = this.props;
        return(
            <div className="primary-layout">
                <NavMenu currentSummit={currentSummit}/>
                <main id="page-wrap">
                    <Switch>
                        <Route exact path="/app/directory" component={SummitDirectoryPage}/>
                        <Route exact path="/app/speakers" component={SummitSpeakerListPage}/>
                        <Route exact path="/app/speakers/merge" component={MergeSpeakersPage}/>
                        <Route exact path="/app/speakers/new" component={EditSummitSpeakerPage}/>
                        <Route exact path="/app/speakers/:speaker_id" component={EditSummitSpeakerPage}/>
                        <Route exact path="/app/summits/:summit_id/speakers/attendance" component={SpeakerAttendanceListPage}/>
                        <Route exact path="/app/summits/:summit_id/speakers/attendance/new" component={EditSpeakerAttendancePage}/>
                        <Route exact path="/app/summits/:summit_id/speakers/attendance/:attendance_id" component={EditSpeakerAttendancePage}/>
                        <Route exact path="/app/summits/:summit_id/dashboard" component={SummitDashboardPage}/>
                        <Route exact path="/app/summits/:summit_id/events" component={SummitEventListPage}/>
                        <Route exact path="/app/summits/:summit_id/events/schedule" component={ScheduleBuilderPage}/>
                        <Route exact path="/app/summits/:summit_id/events/bulk-actions" component={SummitEventsBulkActionsPage}/>
                        <Route exact path="/app/summits/:summit_id/events/new" component={EditSummitEventPage}/>
                        <Route exact path="/app/summits/:summit_id/events/:summit_event_id" component={EditSummitEventPage}/>
                        <Route exact path="/app/summits/:summit_id/attendees" component={SummitAttendeeListPage}/>
                        <Route exact path="/app/summits/:summit_id/attendees/new" component={EditSummitAttendeePage}/>
                        <Route exact path="/app/summits/:summit_id/attendees/:attendee_id" component={EditSummitAttendeePage}/>
                        <Route exact path="/app/summits/:summit_id/promocodes" component={PromocodeListPage}/>
                        <Route exact path="/app/summits/:summit_id/promocodes/new" component={EditPromocodePage}/>
                        <Route exact path="/app/summits/:summit_id/promocodes/:promocode_id" component={EditPromocodePage}/>
                        <Route exact path="/app/summits/:summit_id/event-types" component={EventTypeListPage}/>
                        <Route exact path="/app/summits/:summit_id/event-types/new" component={EditEventTypePage}/>
                        <Route exact path="/app/summits/:summit_id/event-types/:event_type_id" component={EditEventTypePage}/>
                        <Route exact path="/app/summits/:summit_id/event-categories" component={EventCategoryListPage}/>
                        <Route exact path="/app/summits/:summit_id/event-categories/new" component={EditEventCategoryPage}/>
                        <Route exact path="/app/summits/:summit_id/event-categories/:event_category_id" component={EditEventCategoryPage}/>
                        <Route exact path="/app/summits/:summit_id/locations" component={LocationListPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/new" component={EditLocationPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id" component={EditLocationPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/floors/new" component={EditFloorPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/floors/:floor_id" component={EditFloorPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/rooms/new" component={EditRoomPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/rooms/:room_id" component={EditRoomPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/images/new" component={EditLocationImagePage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/images/:image_id" component={EditLocationImagePage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/maps/new" component={EditLocationMapPage}/>
                        <Route exact path="/app/summits/:summit_id/locations/:location_id/maps/:map_id" component={EditLocationMapPage}/>
                        <Route render={props => (<Redirect to="/app/directory"/>)}/>
                    </Switch>
                </main>
            </div>
        );
    }

}

export default withRouter(PrimaryLayout)


