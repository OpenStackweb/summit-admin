/**
 * Copyright 2019 OpenStack Foundation
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
import { Table, FreeTextSearch } from 'openstack-uicore-foundation/lib/components';
import { getSummitById } from '../../actions/summit-actions';
import { getViewTypes, deleteViewType } from "../../actions/badge-actions";

class ViewTypeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewViewType = this.handleNewViewType.bind(this);

        this.state = {}

    }

    componentDidMount() {
        const { currentSummit } = this.props;
        if (currentSummit) {
            this.props.getViewTypes();
        }
    }

    handleEdit(view_type_id) {
        const { currentSummit, history } = this.props;
        history.push(`/app/summits/${currentSummit.id}/view-types/${view_type_id}`);
    }

    handleDelete(viewTypeId) {
        const { deleteViewType, viewTypes } = this.props;
        let viewType = viewTypes.find(t => t.id === viewTypeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("view_type_list.remove_warning") + ' ' + viewType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function (result) {
            if (result.value) {
                deleteViewType(viewTypeId);
            }
        });
    }

    handleSort(index, key, dir, func) {
        this.props.getViewTypes(key, dir);
    }

    handleSearch(newTerm) {
        this.props.getViewTypes(newTerm);
    }

    handleNewViewType(ev) {
        const { currentSummit, history } = this.props;
        history.push(`/app/summits/${currentSummit.id}/view-types/new`);
    }

    render() {
        const { currentSummit, viewTypes, term = '', order, orderDir, totalViewTypes } = this.props;

        const columns = [
            { columnKey: 'name', value: T.translate("view_type_list.name"), sortable: true },
            { columnKey: 'is_default', value: T.translate("view_type_list.is_default"), render: (vt) => vt.is_default === true ? 'Yes' : 'No' }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if (!currentSummit.id) return (<div />);

        return (
            <div className="container">
                <h3> {T.translate("view_type_list.view_types")} ({totalViewTypes})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term ?? ''}
                            placeholder={T.translate("view_type_list.placeholders.search_view_type")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewViewType}>
                            {T.translate("view_type_list.add_view_type")}
                        </button>
                    </div>
                </div>

                {viewTypes.length === 0 &&
                    <div>{T.translate("view_type_list.no_view_type")}</div>
                }

                {viewTypes.length > 0 &&
                    <Table
                        options={table_options}
                        data={viewTypes}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentViewTypeListState }) => ({
    currentSummit: currentSummitState.currentSummit,
     ...currentViewTypeListState,    
})

export default connect(
    mapStateToProps,
    {
        getSummitById,
        getViewTypes,        
        deleteViewType
    }
)(ViewTypeListPage);
