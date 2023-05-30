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

import NoMatchPage from "../pages/no-match-page";
import TrackChairListPage from "../pages/track_chairs/track-chair-list-page";
import ProgressFlagsPage from "../pages/track_chairs/progress-flags-page";
import TrackTimeframeListPage from "../pages/track_chairs/track-timeframe-list-page";
import TrackTimeframePage from "../pages/track_chairs/track-timeframe-page";
import EditEventMaterialPage from "../pages/events/edit-event-material-page";
import EditEventCommentPage from "../pages/events/edit-event-comment-page";


class TrackChairsLayout extends React.Component {

    render(){
        const { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("track_chairs.track_chairs"), pathname: match.url }} />

                <Switch>
                    <Route strict exact path={match.url} component={TrackChairListPage}/>
                    <Route strict exact path={`${match.url}/progress-flags`} component={ProgressFlagsPage}/>
                    <Route path={`${match.url}/track-timeframes`} render={
                      props => (
                        <div>
                          <Breadcrumb data={{ title: T.translate("track_timeframes.track_timeframes"), pathname: props.match.url }} />
                          <Switch>
                            <Route strict exact path={props.match.url} component={TrackTimeframeListPage}/>
                            <Route strict exact path={`${props.match.url}/:track_id(\\d+)`} component={TrackTimeframePage}/>
                            <Route strict exact path={`${props.match.url}/new`} component={TrackTimeframePage}/>
                            <Route component={NoMatchPage}/>
                          </Switch>
                        </div>
                      )}
                     />
                    <Route component={NoMatchPage} />
                </Switch>
            </div>
        );
    }

}

export default Restrict(withRouter(TrackChairsLayout), 'track-chairs');


