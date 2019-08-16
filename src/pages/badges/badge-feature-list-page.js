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
import { getBadgeFeatures, deleteBadgeFeature } from "../../actions/badge-actions";

class BadgeFeatureListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleNewBadgeFeature = this.handleNewBadgeFeature.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getBadgeFeatures();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getBadgeFeatures();
        }
    }

    handleEdit(badge_feature_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/badge-features/${badge_feature_id}`);
    }

    handleDelete(badgeFeatureId) {
        let {deleteBadgeFeature, badgeFeatures} = this.props;
        let badgeFeature = badgeFeatures.find(t => t.id == badgeFeatureId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("badge_feature_list.remove_warning") + ' ' + badgeFeature.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteBadgeFeature(badgeFeatureId);
            }
        }).catch(swal.noop);
    }

    handleSort(index, key, dir, func) {
        this.props.getBadgeFeatures(key, dir);
    }

    handleNewBadgeFeature(ev) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/badge-features/new`);
    }

    render(){
        let {currentSummit, badgeFeatures, order, orderDir, totalBadgeFeatures} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("badge_feature_list.name"), sortable: true },
            { columnKey: 'description', value: T.translate("badge_feature_list.description") },
            { columnKey: 'tag_name', value: T.translate("badge_feature_list.tag_name") }
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
                <h3> {T.translate("badge_feature_list.badge_feature_list")} ({totalBadgeFeatures})</h3>
                <div className={'row'}>
                    <div className="col-md-6 text-right col-md-offset-6">
                        <button className="btn btn-primary right-space" onClick={this.handleNewBadgeFeature}>
                            {T.translate("badge_feature_list.add_badge_feature")}
                        </button>
                    </div>
                </div>

                {badgeFeatures.length == 0 &&
                <div>{T.translate("badge_feature_list.no_badge_features")}</div>
                }

                {badgeFeatures.length > 0 &&
                    <Table
                        options={table_options}
                        data={badgeFeatures}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentBadgeFeatureListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentBadgeFeatureListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getBadgeFeatures,
        deleteBadgeFeature
    }
)(BadgeFeatureListPage);
