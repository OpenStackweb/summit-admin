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
import swal from "sweetalert2";
import { SortableTable } from 'openstack-uicore-foundation/lib/components';
import { getTagGroups, deleteTagGroup, updateTagGroupsOrder,seedTagGroups } from "../../actions/tag-actions";

class TagGroupListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleNewTagGroup = this.handleNewTagGroup.bind(this);
        this.handleSeedTagGroups = this.handleSeedTagGroups.bind(this);

        this.state = {}

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getTagGroups();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getTagGroups();
        }
    }

    handleEdit(tag_group_id) {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/tag-groups/${tag_group_id}`);
    }

    handleDelete(tagGroupId) {
        let {deleteTagGroup, tagGroups} = this.props;
        let tagGroup = tagGroups.find(tg => tg.id == tagGroupId);

        swal({
            title: T.translate("general.are_you_sure"),
            text: T.translate("tag_group_list.remove_tag_group_warning") + ' ' + tagGroup.label,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteTagGroup(tagGroupId);
            }
        }).catch(swal.noop);
    }

    handleNewTagGroup(ev) {
        let {currentSummit, history} = this.props;

        ev.preventDefault();
        history.push(`/app/summits/${currentSummit.id}/tag-groups/new`);
    }

    handleSeedTagGroups(ev) {
        let {currentSummit, history} = this.props;
        ev.preventDefault();

        this.props.seedTagGroups();
    }


    render(){
        let {currentSummit, tagGroups} = this.props;

        let columns = [
            { columnKey: 'name', value: T.translate("tag_group_list.name") },
            { columnKey: 'label', value: T.translate("tag_group_list.label") }
        ];

        let table_options = {
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return(<div></div>);

        let sortedTagGroups = [...tagGroups];
        sortedTagGroups.sort(
            (a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0))
        );

        return(
            <div className="container">
                <h3> {T.translate("tag_group_list.tag_groups")} </h3>
                <div className={'row'}>
                    <div className="col-md-6 col-md-offset-6 text-right">
                        <button className="btn btn-default right-space" onClick={this.handleSeedTagGroups}>
                            {T.translate("tag_group_list.seed_tag_groups")}
                        </button>
                        <button className="btn btn-primary" onClick={this.handleNewTagGroup}>
                            {T.translate("tag_group_list.add_tag_group")}
                        </button>
                    </div>
                </div>

                {tagGroups.length == 0 &&
                <div>{T.translate("tag_group_list.no_tag_groups")}</div>
                }

                {tagGroups.length > 0 &&
                <div>
                    <SortableTable
                        options={table_options}
                        data={sortedTagGroups}
                        columns={columns}
                        dropCallback={this.props.updateTagGroupsOrder}
                        orderField="order"
                    />
                </div>
                }

            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentTagGroupListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentTagGroupListState
})

export default connect (
    mapStateToProps,
    {
        getTagGroups,
        deleteTagGroup,
        updateTagGroupsOrder,
        seedTagGroups
    }
)(TagGroupListPage);
