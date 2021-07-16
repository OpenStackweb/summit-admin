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
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getBadgeTypes, deleteBadgeType } from "../../actions/badge-actions";

class BadgeTypeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewBadgeType = this.handleNewBadgeType.bind(this);

        this.state = {}

    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getBadgeTypes();
        }
    }

    handleEdit(badge_type_id) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/badge-types/${badge_type_id}`);
    }

    handleDelete(badgeTypeId) {
        const {deleteBadgeType, badgeTypes} = this.props;
        let badgeType = badgeTypes.find(t => t.id === badgeTypeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("badge_type_list.remove_warning") + ' ' + badgeType.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteBadgeType(badgeTypeId);
            }
        });
    }

    handleSort(index, key, dir, func) {
        this.props.getBadgeTypes(key, dir);
    }

    handleNewBadgeType(ev) {
        const {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/badge-types/new`);
    }

    render(){

        let {currentSummit, badgeTypes, order, orderDir, totalBadgeTypes} = this.props;

        badgeTypes = badgeTypes.map((bt) => { return {...bt, is_default: bt.is_default ? 'Yes': 'No'}});

        const columns = [
            { columnKey: 'name', value: T.translate("badge_type_list.name"), sortable: true },
            { columnKey: 'is_default', value: T.translate("badge_type_list.is_default") },
            { columnKey: 'description', value: T.translate("badge_type_list.description") },
            { columnKey: 'access_level_names', value: T.translate("badge_type_list.access_levels") }
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div/>);

        return(
            <div className="container">
                <h3> {T.translate("badge_type_list.badge_type_list")} ({totalBadgeTypes})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewBadgeType}>
                            {T.translate("badge_type_list.add_badge_type")}
                        </button>
                    </div>
                </div>

                {badgeTypes.length === 0 &&
                <div>{T.translate("badge_type_list.no_badge_types")}</div>
                }

                {badgeTypes.length > 0 &&
                    <Table
                        options={table_options}
                        data={badgeTypes}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentBadgeTypeListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentBadgeTypeListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getBadgeTypes,
        deleteBadgeType
    }
)(BadgeTypeListPage);
