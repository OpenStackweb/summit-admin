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
import { SummitDropdown } from 'openstack-uicore-foundation/lib/components';
import { SortableTable } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import {
    getEventCategories,
    deleteEventCategory,
    copyEventCategories,
    updateEventCategoryOrder
} from "../../actions/event-category-actions";

class EventCategoryListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleCopyCategories = this.handleCopyCategories.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.state = {};
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getEventCategories();
        }
    }

    handleEdit(categoryId) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/${categoryId}`);
    }

    handleCopyCategories(fromSummitId) {
        this.props.copyEventCategories(fromSummitId);
    }

    handleNew(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/new`);
    }

    handleDelete(categoryId) {
        const {deleteEventCategory, eventCategories} = this.props;
        let category = eventCategories.find(c => c.id === categoryId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("event_category_list.delete_warning") + ' ' + category.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteEventCategory(categoryId);
            }
        });
    }

    render(){
        const {currentSummit, eventCategories, allSummits} = this.props;
        const summits = allSummits.filter(s => s.id !== currentSummit.id);

        const columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("event_category_list.name") },
            { columnKey: 'code', value: T.translate("event_category_list.code") },
            { columnKey: 'color', value: T.translate("event_category_list.color") }
        ];

        const table_options = {
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDelete }
            }
        };

        if(!currentSummit.id) return null;

        return(
            <div className="container">
                <h3> {T.translate("event_category_list.event_category_list")} </h3>
                <div className={'row'}>
                    <div className="col-md-6 col-md-offset-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNew}>
                            {T.translate("event_category_list.add_category")}
                        </button>
                        <SummitDropdown
                            summits={summits}
                            onClick={this.handleCopyCategories}
                            actionLabel={T.translate("event_category_list.copy_categories")}
                        />
                    </div>
                </div>

                {eventCategories.length === 0 &&
                <div className="no-items">{T.translate("event_category_list.no_items")}</div>
                }

                {eventCategories.length > 0 &&
                <div>
                    <SortableTable
                        options={table_options}
                        data={eventCategories}
                        columns={columns}
                        dropCallback={this.props.updateEventCategoryOrder}
                        orderField="order"
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ directoryState, currentSummitState, currentEventCategoryListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    allSummits      : directoryState.allSummits,
    ...currentEventCategoryListState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEventCategories,
        deleteEventCategory,
        copyEventCategories,
        updateEventCategoryOrder,
    }
)(EventCategoryListPage);
