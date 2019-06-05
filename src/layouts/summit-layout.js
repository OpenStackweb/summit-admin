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
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

import EditSummitPage from '../pages/summits/edit-summit-page';
import SummitIdLayout from './summit-id-layout'
import NoMatchPage from "../pages/no-match-page";


class SummitLayout extends React.Component {

    render(){
        let { match } = this.props;

        return(
            <div>
                <Switch>
                    <Route exact strict path={`${match.url}/new`} component={EditSummitPage}/>
                    <Route path={`${match.url}/:summit_id`} component={SummitIdLayout}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default withRouter(SummitLayout);


