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


import ScheduleBuilderPage from '../pages/events/schedule-builder-page';
import SummitEventListPage from '../pages/events/summit-event-list-page';
import EditSummitEventPage from '../pages/events/edit-summit-event-page';
import SummitEventsBulkActionsPage from '../pages/events/summit-events-bulk-actions-page';


class EventLayout extends React.Component {

    render(){
        let { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("event_list.events"), pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route exact path={`${match.url}/schedule`} component={ScheduleBuilderPage}/>
                    <Route exact path={`${match.url}/bulk-actions`} component={SummitEventsBulkActionsPage}/>
                    <Route exact path={`${match.url}/new`} component={EditSummitEventPage}/>
                    <Route exact path={`${match.url}/:summit_event_id`} component={EditSummitEventPage}/>
                    <Route component={SummitEventListPage}/>
                </Switch>
            </div>
        );
    }

}

export default Restrict(withRouter(EventLayout), 'events');


