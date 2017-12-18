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
import {connect} from "react-redux"
import URI from "urijs"
import SummitEventBulkEditorForm from '../components/summit-event-bulk-actions/summit-event-bulk-editor-form';
import {getSummitEventsById, updateEventLocationLocal, updateEventTitleLocal, updateEventStartDateLocal, updateEventEndDateLocal, updateEvents, updateAndPublishEvents } from '../actions/summit-event-bulk-actions';
import {getSummitById} from "../actions/summit-actions";
import T from 'i18n-react/dist/i18n-react'

class SummitEventsBulkActionsPage extends React.Component {

    constructor(props) {
        super(props);
        // get events ids from query string
        let { search } = this.props.location;
        let query      = URI.parseQuery(search);
        console.log(query.id);
        this.state = {
            eventIds : query.id.split(',')
        }
    }

    componentDidMount(){
        let summitId           = this.props.match.params.summit_id;
        let { currentSummit } = this.props;
        if(currentSummit == null){
            this.props.getSummitById(summitId).then(() => {
                this.props.getSummitEventsById(summitId, this.state.eventIds);
            });
            return;
        }
        this.props.getSummitEventsById(summitId, this.state.eventIds);
    }

    render(){
        let {events, currentSummit, updateEventLocationLocal, updateEventTitleLocal, updateEventStartDateLocal, updateEventEndDateLocal, updateEvents, updateAndPublishEvents } = this.props;
        if(currentSummit == null) return null;

        return (
            <div>
                <h2>{T.translate("titles.bulk_actions_title")}</h2>
                <SummitEventBulkEditorForm
                    events={events}
                    currentSummit={currentSummit}
                    updateEventLocationLocal={updateEventLocationLocal}
                    updateEventTitleLocal={updateEventTitleLocal}
                    updateEventStartDateLocal={updateEventStartDateLocal}
                    updateEventEndDateLocal={updateEventEndDateLocal}
                    updateEvents={updateEvents}
                    updateAndPublishEvents={updateAndPublishEvents}
                ></SummitEventBulkEditorForm>
            </div>
        );
    }
}

const mapStateToProps = ({
                             currentSummitState,
                             summitEventsBulkActionsState,
                         }) => ({
    currentSummit   : currentSummitState.currentSummit,
    events          : summitEventsBulkActionsState.selectedEvents
})

export default connect (
    mapStateToProps,
    {
        getSummitEventsById,
        getSummitById,
        updateEventLocationLocal,
        updateEventTitleLocal,
        updateEventStartDateLocal,
        updateEventEndDateLocal,
        updateEvents,
        updateAndPublishEvents
    }
)(SummitEventsBulkActionsPage);