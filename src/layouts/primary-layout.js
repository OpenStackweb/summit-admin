import React from 'react'
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import NavMenu from '../components/nav-menu'
import ScheduleBuilderPage from '../pages/schedule-builder-page';
import SummitDirectoryPage from '../pages/summit-directory-page';
import SummitDashboardPage from '../pages/summit-dashboard-page';
import EditSummitEventPage from '../pages/edit-summit-event-page';
import SummitEventsBulkActionsPage from '../pages/summit-events-bulk-actions-page';
import SummitSpeakerListPage from '../pages/summit-speakers-list-page';
import EditSummitSpeakerPage from '../pages/edit-summit-speaker-page';
import MergeSpeakersPage from '../pages/merge-speakers-page';
import SummitAttendeeListPage from '../pages/summit-attendees-list-page';
import EditSummitAttendeePage from '../pages/edit-summit-attendee-page';
import PromocodeListPage from '../pages/promocode-list-page';


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
                        <Route exact path="/app/summits/:summit_id/dashboard" component={SummitDashboardPage}/>
                        <Route exact path="/app/summits/:summit_id/events/schedule" component={ScheduleBuilderPage}/>
                        <Route exact path="/app/summits/:summit_id/events/bulk-actions" component={SummitEventsBulkActionsPage}/>
                        <Route exact path="/app/summits/:summit_id/events/new" component={EditSummitEventPage}/>
                        <Route exact path="/app/summits/:summit_id/events/:summit_event_id" component={EditSummitEventPage}/>
                        <Route exact path="/app/summits/:summit_id/speakers" component={SummitSpeakerListPage}/>
                        <Route exact path="/app/summits/:summit_id/speakers/merge" component={MergeSpeakersPage}/>
                        <Route exact path="/app/summits/:summit_id/speakers/new" component={EditSummitSpeakerPage}/>
                        <Route exact path="/app/summits/:summit_id/speakers/:speaker_id" component={EditSummitSpeakerPage}/>
                        <Route exact path="/app/summits/:summit_id/attendees" component={SummitAttendeeListPage}/>
                        <Route exact path="/app/summits/:summit_id/attendees/new" component={EditSummitAttendeePage}/>
                        <Route exact path="/app/summits/:summit_id/attendees/:attendee_id" component={EditSummitAttendeePage}/>
                        <Route exact path="/app/summits/:summit_id/promocodes" component={PromocodeListPage}/>
                        <Route render={props => (<Redirect to="/app/directory"/>)}/>
                    </Switch>
                </main>
            </div>
        );
    }

}

export default withRouter(PrimaryLayout)


