/**
 * Copyright 2020 OpenStack Foundation
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
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import EmailFlowEventForm from '../../components/forms/email-flow-event-form';
import { getSummitById }  from '../../actions/summit-actions';
import {getEmailFlowEvent, resetEmailFlowEventForm, saveEmailFlowEvent} from '../../actions/email-flows-events-actions';
import '../../styles/edit-email-flow-event-page.less';

class EditEmailFlowEventPage extends React.Component {

    constructor(props) {
        const { match } = props;
        const eventId = match.params.event_id;
        super(props);

        props.getEmailFlowEvent(eventId);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.event_id;
        const newId = this.props.match.params.event_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetEmailFlowEventForm();
            } else {
                this.props.getEmailFlowEvent(newId);
            }
        }
    }

    render(){
        const {currentSummit, entity, errors, match, history} = this.props;
        const title = T.translate("general.edit")
        const breadcrumb = (entity.id) ? entity.flow_name : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {entity.flow_name} {T.translate("edit_email_flow_event.email_flow_event")}</h3>
                <hr/>
                {currentSummit &&
                <EmailFlowEventForm
                    entity={entity}
                    currentSummit={currentSummit}
                    errors={errors}
                    onSubmit={this.props.saveEmailFlowEvent}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, emailFLowEventState, baseState }) => ({
    currentSummit : currentSummitState.currentSummit,
    loading: baseState.loading,
    ...emailFLowEventState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEmailFlowEvent,
        resetEmailFlowEventForm,
        saveEmailFlowEvent
    }
)(EditEmailFlowEventPage);
