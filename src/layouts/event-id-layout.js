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
import EditSummitEventPage from '../pages/events/edit-summit-event-page';
import EditEventMaterialPage from '../pages/events/edit-event-material-page';
import NoMatchPage from "../pages/no-match-page";
import { getEvent, resetEventForm } from '../actions/event-actions';
import { getRsvpTemplates } from '../actions/rsvp-template-actions';
import {connect} from "react-redux";


class EventIdLayout extends React.Component {

    componentWillMount () {
        let eventId = this.props.match.params.event_id;

        if (!eventId) {
            this.props.resetEventForm();
        } else {
            this.props.getEvent(eventId);
        }

        this.props.getRsvpTemplates();
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.event_id;
        let newId = newProps.match.params.event_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetEventForm();
            } else {
                this.props.getEvent(newId);
            }
        }
    }

    render(){
        let { match, entity } = this.props;
        let eventId = this.props.match.params.event_id;
        let breadcrumb = entity.id ? entity.title : T.translate("general.new");

        if(!entity.id || entity.id != eventId) return(<div></div>);

        return(
            <div>
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>

                <Switch>
                    <Route exact strict path={match.url} component={EditSummitEventPage}/>
                    <Route path={`${match.url}/materials`} render={
                        props => (
                            <div>
                                <Breadcrumb data={{ title: T.translate("edit_event.materials"), pathname: match.url }} ></Breadcrumb>
                                <Switch>
                                    <Route strict exact path={`${props.match.url}/new`} component={EditEventMaterialPage} />
                                    <Route strict exact path={`${props.match.url}/:material_id`} component={EditEventMaterialPage} />
                                    <Route component={NoMatchPage}/>
                                </Switch>
                            </div>
                        )}
                    />
                    <Route component={NoMatchPage}/>
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = ({ currentSummitEventState }) => ({
    ...currentSummitEventState
})

export default connect (
    mapStateToProps,
    {
        getEvent,
        resetEventForm,
        getRsvpTemplates
    }
)(EventIdLayout);


