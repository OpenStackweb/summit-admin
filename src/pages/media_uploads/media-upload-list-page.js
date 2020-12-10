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
import {FreeTextSearch, SummitDropdown, Table} from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../../actions/summit-actions';
import { getMediaUploads, deleteMediaUpload, copyMediaUploads } from "../../actions/media-upload-actions";

class MediaUploadListPage extends React.Component {

    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleNewMediaUpload = this.handleNewMediaUpload.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCopyMediaUploads = this.handleCopyMediaUploads.bind(this);

        this.state = {
        }
    }

    componentDidMount() {
        this.props.getMediaUploads();
    }

    handleEdit(media_upload_id) {
        let {history, currentSummit} = this.props;
        history.push(`/app/summits/${currentSummit.id}/media-uploads/${media_upload_id}`);
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getMediaUploads(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getMediaUploads(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getMediaUploads(term, page, perPage, order, orderDir);
    }

    handleNewMediaUpload(ev) {
        let {history, currentSummit} = this.props;
        ev.preventDefault();

        history.push(`/app/summits/${currentSummit.id}/media-uploads/new`);
    }

    handleDelete(mediaUploadId) {
        let {deleteMediaUpload, media_uploads} = this.props;
        let media_upload = media_uploads.find(t => t.id === mediaUploadId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("media_upload.delete_warning") + ' ' + media_upload.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteMediaUpload(mediaUploadId);
            }
        });
    }

    handleCopyMediaUploads(fromSummitId) {
        this.props.copyMediaUploads(fromSummitId);
    }

    canEdit = (item) => !item.is_system_defined;

    render(){
        let {currentSummit, media_uploads, allSummits, lastPage, currentPage, term, order, orderDir} = this.props;
        const summits = allSummits.filter(s => s.id !== currentSummit.id);

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'name', value: T.translate("media_upload.name"), sortable: true },
            { columnKey: 'description', value: T.translate("media_upload.description") },
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
                <h3> {T.translate("media_upload.media_upload_list")}</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("media_upload.placeholders.search")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className="col-md-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.handleNewMediaUpload}>
                            {T.translate("media_upload.add")}
                        </button>
                        <SummitDropdown
                            summits={summits}
                            onClick={this.handleCopyMediaUploads}
                            actionLabel={T.translate("media_upload.copy_media_uploads")}
                        />
                    </div>
                </div>

                {media_uploads.length === 0 &&
                <div>{T.translate("media_upload.no_results")}</div>
                }

                {media_uploads.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={media_uploads}
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

const mapStateToProps = ({ directoryState, currentSummitState, mediaUploadListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    allSummits      : directoryState.allSummits,
    ...mediaUploadListState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getMediaUploads,
        deleteMediaUpload,
        copyMediaUploads
    }
)(MediaUploadListPage);
