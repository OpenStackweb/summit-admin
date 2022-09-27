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
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch, Table } from 'openstack-uicore-foundation/lib/components';
import { getTags, deleteTag } from '../../actions/tag-actions';


class TagListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewTag = this.handleNewTag.bind(this);

        this.state = {}
    }

    componentDidMount() {
        const {term} = this.props;
        this.props.getTags(term);
    }

    handleEdit(tag_id) {
        const {history} = this.props;
        history.push(`/app/tags/${tag_id}`);
    }

    handleDelete(tagId) {
        const {deleteTag, tags} = this.props;
        let tag = tags.find(s => s.id === tagId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("tag_list.delete_tag_warning") + ' ' + tag.tag,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteTag(tagId);
            }
        });
    }

    handlePageChange(page) {
        const {term, order, orderDir, perPage} = this.props;
        this.props.getTags(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        const {term, page, perPage} = this.props;
        this.props.getTags(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        const {order, orderDir, page, perPage} = this.props;
        this.props.getTags(term, page, perPage, order, orderDir);
    }

    handleNewTag(ev) {
        const {history} = this.props;
        history.push(`/app/tags/new`);
    }

    render(){
        const {tags, lastPage, currentPage, term, order, orderDir, totalTags } = this.props;

        const columns = [
            { columnKey: 'id', value: 'Id', sortable: true },
            { columnKey: 'tag', value: T.translate("general.name"), sortable: true },
            { columnKey: 'created', value: T.translate("tag_list.created")},
            { columnKey: 'updated', value: T.translate("tag_list.updated")}
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: {onClick: this.handleDelete}
            }
        };

        return(
            <div className="container">
                <h3> {T.translate("tag_list.tag_list")} ({totalTags}) </h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("tag_list.placeholders.search_tags")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary" onClick={this.handleNewTag}>
                            {T.translate("tag_list.add_tag")}
                        </button>
                    </div>
                </div>

                {tags.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={tags}
                        columns={columns}
                        onSort={this.handleSort}
                    />
                    <Pagination
                        bsSize="medium"
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        maxButtons={10}
                        items={lastPage}
                        activePage={currentPage}
                        onSelect={this.handlePageChange}
                    />
                </div>
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentTagListState }) => ({
    ...currentTagListState
});

export default connect (
    mapStateToProps,
    {
        getTags,
        deleteTag,        
    }
)(TagListPage);
