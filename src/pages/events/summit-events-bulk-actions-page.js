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
import SummitEventBulkEditorForm from '../../components/summit-event-bulk-actions/summit-event-bulk-editor-form';
import {
    getSummitEventsById,
    updateEventLocationLocal,
    updateEventTitleLocal,
    updateEventStartDateLocal,
    updateEventEndDateLocal,
    updateEvents,
    updateAndPublishEvents,
    updateEventsLocationLocal,
    updateEventsStartDateLocal,
    updateEventsEndDateLocal,
} from '../../actions/summit-event-bulk-actions';
import {getSummitById} from "../../actions/summit-actions";
import T from 'i18n-react/dist/i18n-react'

class SummitEventsBulkActionsPage extends React.Component {

    constructor(props) {
        super(props);
        // get events ids from query string
        let { location, history } = this.props;
        let query      = URI.parseQuery(location.search);
        if(!query.hasOwnProperty('id[]')) {
            history.push('/app/directory');
            return;
        }
        let eventIds =  query['id[]'];
        if(!Array.isArray(eventIds)) eventIds = [eventIds];
        this.state = {
            eventIds
        }
    }

    componentDidMount(){
        let summitId           = this.props.match.params.summit_id;
        let { currentSummit }  = this.props;
        if(this.state == null || !this.state.hasOwnProperty('eventIds')) return;
        if(currentSummit == null){
            this.props.getSummitById(summitId).then(() => {
                this.props.getSummitEventsById(summitId, this.state.eventIds);
            });
            return;
        }
        this.props.getSummitEventsById(summitId, this.state.eventIds);
    }

    render(){
        let {
            events,
            currentSummit,
            updateEventLocationLocal,
            updateEventTitleLocal,
            updateEventStartDateLocal,
            updateEventEndDateLocal,
            updateEvents,
            updateAndPublishEvents,
            updateEventsLocationLocal,
            updateEventsStartDateLocal,
            updateEventsEndDateLocal,
        } = this.props;
        if(currentSummit == null) return null;

        return (
            <div className="bulk-actions-editor-container">
                <h2>{T.translate("bulk_actions_page.title")}</h2>
                <SummitEventBulkEditorForm
                    events={events}
                    currentSummit={currentSummit}
                    updateEventLocationLocal={updateEventLocationLocal}
                    updateEventTitleLocal={updateEventTitleLocal}
                    updateEventStartDateLocal={updateEventStartDateLocal}
                    updateEventEndDateLocal={updateEventEndDateLocal}
                    updateEvents={updateEvents}
                    updateAndPublishEvents={updateAndPublishEvents}
                    updateEventsLocationLocal={updateEventsLocationLocal}
                    updateEventsStartDateLocal={updateEventsStartDateLocal}
                    updateEventsEndDateLocal={updateEventsEndDateLocal}
                    history={this.props.history}
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
    events          : summitEventsBulkActionsState.eventOnBulkEdition
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
        updateAndPublishEvents,
        updateEventsLocationLocal,
        updateEventsStartDateLocal,
        updateEventsEndDateLocal,
    }
)(SummitEventsBulkActionsPage);