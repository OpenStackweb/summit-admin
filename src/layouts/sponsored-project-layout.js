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
import Restrict from '../routes/restrict'
import NoMatchPage from "../pages/no-match-page";
import SponsoredProjectListPage from "../pages/sponsored_projects/sponsored-project-list-page";
import SponsoredProjectLayoutId from "./sponsored-project-layout-id";

class SponsoredProjectLayout extends React.Component {

    render(){
        const { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("sponsored_project_list.sponsored_projects"), pathname: match.url }} />
                <Switch>
                    <Route strict exact path={match.url} component={SponsoredProjectListPage}/>
                    <Route path={`${match.url}/:sponsored_project_id(\\d+)`} component={SponsoredProjectLayoutId} />
                    <Route exact strict path={`${match.url}/new`} component={SponsoredProjectLayoutId} />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default Restrict(withRouter(SponsoredProjectLayout), 'sponsored-projects');


