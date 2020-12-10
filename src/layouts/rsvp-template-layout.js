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
import T from "i18n-react/dist/i18n-react";
import { Switch, Route } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';
import Restrict from '../routes/restrict';

import RsvpTemplateListPage from '../pages/rsvps/rsvp-template-list-page';
import RsvpTemplateIdLayout from './rsvp-template-id-layout';
import NoMatchPage from "../pages/no-match-page";


class RsvpTemplateLayout extends React.Component {

    render(){
        let { match } = this.props;

        return(
            <div>
                <Breadcrumb data={{ title: T.translate("rsvp_template_list.rsvp_template_list"), pathname: match.url }} />

                <Switch>
                    <Route exact strict path={match.url} component={RsvpTemplateListPage} />
                    <Route path={`${match.url}/:rsvp_template_id(\\d+)`} component={RsvpTemplateIdLayout} />
                    <Route exact strict path={`${match.url}/new`} component={RsvpTemplateIdLayout} />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

export default Restrict(RsvpTemplateLayout, 'rsvp');
