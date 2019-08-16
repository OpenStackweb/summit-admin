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
import swal from "sweetalert2";
import { Table } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getAccessLevels, deleteAccessLevel } from "../../actions/badge-actions";

class AccessLevelListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewAccessLevel = this.handleNewAccessLevel.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getAccessLevels();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getAccessLevels();
        }
    }

    handleEdit(access_level_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/access-levels/${access_level_id}`);
    }

    handleDelete(accessLevelId) {
        let {deleteAccessLevel, accessLevels} = this.props;
        let accessLevel = accessLevels.find(t => t.id == accessLevelId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("access_level_list.remove_warning") + ' ' + accessLevel.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteAccessLevel(accessLevelId);
            }
        }).catch(swal.noop);
    }

    handleSort(index, key, dir, func) {
        this.props.getAccessLevels(key, dir);
    }

    handleNewAccessLevel(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/access-levels/new`);
    }

    render(){
        let {currentSummit, accessLevels, order, orderDir, totalAccessLevels} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("access_level_list.name"), sortable: true },
            { columnKey: 'description', value: T.translate("access_level_list.description") },
            { columnKey: 'tag_name', value: T.translate("access_level_list.tag_name") }
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return (<div></div>);

        return(
            <div className="container">
                <h3> {T.translate("access_level_list.access_level_list")} ({totalAccessLevels})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewAccessLevel}>
                            {T.translate("access_level_list.add_access_level")}
                        </button>
                    </div>
                </div>

                {accessLevels.length == 0 &&
                <div>{T.translate("access_level_list.no_access_levels")}</div>
                }

                {accessLevels.length > 0 &&
                    <Table
                        options={table_options}
                        data={accessLevels}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentAccessLevelListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentAccessLevelListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getAccessLevels,
        deleteAccessLevel
    }
)(AccessLevelListPage);
