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

import TicketTypeListPage from '../pages/tickets/ticket-type-list-page'
import EditTicketTypePage from '../pages/tickets/edit-ticket-type-page'
import NoMatchPage from "../pages/no-match-page";


class TicketTypeLayout extends React.Component {

    render(){
        let { match } = this.props;
        return(
            <div>
                <Breadcrumb data={{ title: T.translate("ticket_type_list.ticket_types"), pathname: match.url }} />

                <Switch>
                    <Route strict exact path={match.url} component={TicketTypeListPage}/>
                    <Route strict exact path={`${match.url}/new`} component={EditTicketTypePage}/>
                    <Route strict exact path={`${match.url}/:ticket_type_id(\\d+)`} component={EditTicketTypePage}/>
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default Restrict(withRouter(TicketTypeLayout), 'tickets');


