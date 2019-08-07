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
import NoMatchPage from "../pages/no-match-page";
import EditSelectionPlanPage from "../pages/summits/edit-selection-plan-page";


class SelectionPlanLayout extends React.Component {

    render(){
        let { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("edit_selection_plan.selection_plans"), pathname: match.url }} ></Breadcrumb>
                <Switch>
                    <Route strict exact path={`${match.url}/new`} component={EditSelectionPlanPage} />
                    <Route strict exact path={`${match.url}/:selection_plan_id(\\d+)`} component={EditSelectionPlanPage} />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default withRouter(SelectionPlanLayout);


