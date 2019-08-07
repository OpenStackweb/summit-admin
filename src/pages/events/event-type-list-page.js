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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getEventTypes, deleteEventType, seedEventTypes } from "../../actions/event-type-actions";

class EventTypeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.isNotDefault = this.isNotDefault.bind(this);

        this.state = {
        }
    }

    componentWillMount() {
        this.props.getEventTypes();
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getEventTypes();
        }
    }

    handleEdit(eventTypeId) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-types/${eventTypeId}`);
    }

    handleNew(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-types/new`);
    }

    handleDelete(eventTypeId) {
        let {deleteEventType, eventTypes} = this.props;
        let eventType = eventTypes.find(e => e.id == eventTypeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("event_type_list.remove_warning") + ' ' + eventType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteEventType(eventTypeId);
            }
        });
    }

    isNotDefault(eventTypeId) {
        let {eventTypes} = this.props;
        let eventType = eventTypes.find(e => e.id == eventTypeId);

        return !eventType.is_default;
    }

    render(){
        let {currentSummit, eventTypes} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("event_type_list.name") },
            { columnKey: 'class_name', value: T.translate("event_type_list.class") }
        ];

        let table_options = {
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDelete, display: this.isNotDefault }
            }
        }

        if(!currentSummit.id) return(<div></div>);

        return(
            <div className="container">

                <h3> {T.translate("event_type_list.event_type_list")} </h3>
                <div className="row">
                    <div className="col-md-6 col-md-offset-6 text-right">
                        <button className="btn btn-default right-space" onClick={this.props.seedEventTypes}>
                            {T.translate("event_type_list.seed_event_types")}
                        </button>
                        <button className="btn btn-primary" onClick={this.handleNew}>
                            {T.translate("event_type_list.add_event_type")}
                        </button>
                    </div>
                </div>

                {eventTypes.length == 0 &&
                <div>{T.translate("event_type_list.no_items")}</div>
                }

                {eventTypes.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={eventTypes}
                        columns={columns}
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentEventTypeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentEventTypeListState
})

export default connect (
    mapStateToProps,
    {
        getEventTypes,
        deleteEventType,
        seedEventTypes
    }
)(EventTypeListPage);
