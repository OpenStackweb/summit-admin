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
import {FreeTextSearch, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getMediaFileTypes, deleteMediaFileType } from "../../actions/media-file-type-actions";

class MediaFileTypeListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewMediaFileType = this.handleNewMediaFileType.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.state = {
        }
    }

    componentDidMount() {
        this.props.getMediaFileTypes();
    }

    handleEdit(media_file_type_id) {
        let {history} = this.props;
        history.push(`/app/media-file-types/${media_file_type_id}`);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getMediaFileTypes(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getMediaFileTypes(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getMediaFileTypes(term, page, perPage, order, orderDir);
    }

    handleNewMediaFileType(ev) {
        let {history} = this.props;
        ev.preventDefault();

        history.push(`/app/media-file-types/new`);
    }

    handleDelete(typeId) {
        let {deleteMediaFileType, media_file_types} = this.props;
        let media_file_type = media_file_types.find(t => t.id === typeId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("media_file_type.delete_warning") + ' ' + media_file_type.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteMediaFileType(accessId);
            }
        });
    }

    canEdit = (item) => !item.is_system_defined;

    render(){
        let {media_file_types, lastPage, currentPage, term, order, orderDir} = this.props;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'name', value: T.translate("media_file_type.name"), sortable: true },
            { columnKey: 'description', value: T.translate("media_file_type.description") },
            { columnKey: 'allowed_extensions', value: T.translate("media_file_type.allowed_extensions")},
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleEdit},
                delete: { onClick: this.handleDelete, display: this.canEdit }
            }
        };

        return(
            <div className="container">
                <h3> {T.translate("media_file_type.media_file_type_list")}</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("media_file_type.placeholders.search")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewMediaFileType}>
                            {T.translate("media_file_type.add")}
                        </button>
                    </div>
                </div>

                {media_file_types.length === 0 &&
                <div>{T.translate("media_file_type.no_results")}</div>
                }

                {media_file_types.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={media_file_types}
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

const mapStateToProps = ({ directoryState, mediaFileTypeListState }) => ({
    summits         : directoryState.summits,
    ...mediaFileTypeListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getMediaFileTypes,
        deleteMediaFileType
    }
)(MediaFileTypeListPage);
