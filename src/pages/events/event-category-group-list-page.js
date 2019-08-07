/**
 * Copyright 2018 OpenStack Foundation
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
import { getEventCategoryGroups, deleteEventCategoryGroup } from "../../actions/event-category-actions";

class EventCategoryGroupListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getEventCategoryGroups();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getEventCategoryGroups();
        }
    }

    handleEdit(groupId) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-category-groups/${groupId}`);
    }

    handleNew(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-category-groups/new`);
    }

    handleDelete(groupId) {
        let {deleteEventCategoryGroup, eventCategoryGroups} = this.props;
        let group = eventCategoryGroups.find(g => g.id == groupId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("event_category_group_list.delete_warning") + ' ' + group.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteEventCategoryGroup(groupId);
            }
        });
    }

    render(){
        let {currentSummit, eventCategoryGroups, summits} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("event_category_group_list.name") },
            { columnKey: 'type', value: T.translate("event_category_group_list.type") },
            { columnKey: 'categories', value: T.translate("event_category_group_list.categories") },
            { columnKey: 'color', value: T.translate("event_category_group_list.color") }
        ];

        let table_options = {
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return(<div></div>);

        return(
            <div className="container">
                <h3> {T.translate("event_category_list.event_category_list")} </h3>
                <div className={'row'}>
                    <div className="col-md-6 col-md-offset-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNew}>
                            {T.translate("event_category_group_list.add_category_group")}
                        </button>
                    </div>
                </div>

                {eventCategoryGroups.length == 0 &&
                <div>{T.translate("event_category_group_list.no_items")}</div>
                }

                {eventCategoryGroups.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={eventCategoryGroups}
                        columns={columns}
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ directoryState, currentSummitState, currentEventCategoryGroupListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentEventCategoryGroupListState
})

export default connect (
    mapStateToProps,
    {
        getEventCategoryGroups,
        deleteEventCategoryGroup
    }
)(EventCategoryGroupListPage);
