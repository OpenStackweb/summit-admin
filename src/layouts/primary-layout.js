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
                        <Route render={props => (<Redirect to="/app/directory"/>)}/>
                    </Switch>
                </main>
            </div>
        );
    }

}

export default withRouter(PrimaryLayout)


