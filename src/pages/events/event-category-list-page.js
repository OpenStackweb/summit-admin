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
import swal from "sweetalert2";
import Table from "../../components/table/Table";
import { getSummitById }  from '../../actions/summit-actions';
import { getEventCategories, deleteEventCategory } from "../../actions/event-category-actions";
import SummitDropdown from '../../components/summit-dropdown';

class EventCategoryListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleNew = this.handleNew.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.state = {};
    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getEventCategories();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getEventCategories();
        }
    }

    handleEdit(categoryId) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/${categoryId}`);
    }

    handleNew(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/new`);
    }

    handleDelete(categoryId, ev) {
        let {deleteEventCategory, eventCategories} = this.props;
        let category = eventCategories.find(c => c.id == categoryId);

        ev.preventDefault();

        swal({
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
        }).catch(swal.noop);
    }

    render(){
        let {currentSummit, eventCategories, summits} = this.props;

        summits = summits.filter(s => s.id != currentSummit.id);

        let columns = [
            { columnKey: 'id', value: T.translate("general.id") },
            { columnKey: 'name', value: T.translate("event_category_list.name") }
        ];

        let table_options = {
            className: "dataTable",
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDelete }
            }
        }

        if(currentSummit == null) return null;

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
                            onClick={this.handleNew}
                            actionLabel={T.translate("event_category_list.copy_categories")}
                        />
                    </div>
                </div>

                {eventCategories.length == 0 &&
                <div>{T.translate("event_category_list.no_items")}</div>
                }

                {eventCategories.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={eventCategories}
                        columns={columns}
                        className="dataTable"
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ directoryState, currentSummitState, currentEventCategoryListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    summits         : directoryState.items,
    ...currentEventCategoryListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEventCategories,
        deleteEventCategory
    }
)(EventCategoryListPage);