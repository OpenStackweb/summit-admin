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
import {Breadcrumb} from "react-breadcrumbs";
import { Pagination } from 'react-bootstrap';
import {Dropdown, FreeTextSearch, MemberInput, Table} from 'openstack-uicore-foundation/lib/components';
import { getTrackChairs, deleteTrackChair, saveTrackChair, addTrackChair, exportTrackChairs } from "../../actions/track-chair-actions";

import '../../styles/track-chair-list-page.less';

class TrackChairListPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showForm: false,
            member: null,
            trackIds: [],
            trackId: null
        }
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getTrackChairs();
        }
    }

    toggleForm = (open) => {
      this.setState(state => ({showForm: open, member: null, trackIds: []}));
    };

    handleChange = ev => {
      const {value, id} = ev.target;
      const isNew = id === 'member';

      this.setState(state => ({[id]: value, trackId: isNew ? 0 : state.trackId}));
    };

    handleEdit = (trackChairId) => {
        const {trackChairs} = this.props;
        const trackChair = trackChairs.find(s => s.id === trackChairId);

        this.setState({
            member: trackChair.member,
            trackIds: trackChair.categories.map(c => c.id),
            showForm: true,
            trackId: trackChairId
        })
    };

    handleSave = () => {
        const {member, trackIds, trackId} = this.state;

        if (trackId) {
            this.props.saveTrackChair(trackId, trackIds).then(() => {
                this.setState({member: null, trackIds: [], showForm: false})
            });
        } else {
            this.props.addTrackChair(member, trackIds).then(() => {
                this.setState({member: null, trackIds: [], showForm: false})
            });
        }

    };

    handleFilterByTrack = (ev) => {
        const {value} = ev.target;
        const {term, page, order, orderDir, perPage} = this.props;
        this.props.getTrackChairs(value, term, page, perPage, order, orderDir);
    };

    handlePageChange = (page) => {
        const {trackId, term, order, orderDir, perPage} = this.props;
        this.props.getTrackChairs(trackId, term, page, perPage, order, orderDir);
    };

    handleSort = (index, key, dir, func) => {
        const {trackId, term, page, perPage} = this.props;

        this.props.getTrackChairs(trackId, term, page, perPage, key, dir);
    };

    handleSearch = (term) => {
        const {trackId, order, orderDir, page, perPage} = this.props;
        this.props.getTrackChairs(trackId, term, page, perPage, order, orderDir);
    };

    handleDelete = (trackChairId) => {
        const {deleteTrackChair, trackChairs} = this.props;
        const trackChair = trackChairs.find(s => s.id === trackChairId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: `${T.translate("track_chairs.delete_warning")} ${trackChair.name}`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_remove")
        }).then(function(result){
            if (result.value) {
                deleteTrackChair(trackChairId);
            }
        });
    };

    handleExport = () => {
        const {trackChairs} = this.props;
        this.props.exportTrackChairs(trackChairs);
    };

    render(){
        const {currentSummit, trackChairs, lastPage, currentPage, term, order, orderDir, totalTrackChairs, match} = this.props;
        const {showForm, member, trackIds} = this.state;
        const disabledSave = trackIds.length === 0 || !member;

        const columns = [
            { columnKey: 'name', value: T.translate("track_chairs.name"), sortable: true },
            { columnKey: 'trackNames', value: T.translate("track_chairs.track") },
        ];

        const table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        };

        const tracks_ddl = currentSummit.tracks.filter(t => t.chair_visible).map(t => ({label: t.name, value: t.id}));

        if(!currentSummit.id) return(<div />);

        return(
            <>
                <Breadcrumb data={{ title: T.translate("track_chairs.track_chairs"), pathname: match.url }} />
                    <div className="container">
                        <h3> {T.translate("track_chairs.list")} ({totalTrackChairs})</h3>
                        <div className={'row'}>
                            <div className={'col-md-4'}>
                                <FreeTextSearch
                                    value={term}
                                    placeholder={T.translate("track_chairs.placeholders.search")}
                                    onSearch={this.handleSearch}
                                />
                            </div>
                            <div className={'col-md-3'}>
                                <Dropdown
                                    id="trackFilter"
                                    onChange={this.handleFilterByTrack}
                                    placeholder={T.translate("track_chairs.placeholders.select_track")}
                                    options={tracks_ddl}
                                    clearable
                                />
                            </div>
                            <div className="col-md-5 text-right">
                                <button className="btn btn-default right-space" onClick={this.handleExport}>
                                    {T.translate("general.export")}
                                </button>
                                <button className="btn btn-primary" onClick={() => this.toggleForm(true)}>
                                    {T.translate("track_chairs.add")}
                                </button>
                            </div>
                        </div>

                        {showForm &&
                        <div className="add-new-wrapper row">
                            <div className="col-md-5">
                                <MemberInput
                                    id="member"
                                    value={member}
                                    onChange={this.handleChange}
                                    getOptionLabel={
                                        (member) => {
                                            return member.hasOwnProperty("email") ?
                                                `${member.first_name} ${member.last_name} (${member.email})`:
                                                `${member.first_name} ${member.last_name} (${member.id})`;
                                        }
                                    }
                                    placeholder={T.translate("track_chairs.placeholders.select_track_chair")}
                                />
                            </div>
                            <div className="col-md-5">
                                <Dropdown
                                    id="trackIds"
                                    value={trackIds}
                                    onChange={this.handleChange}
                                    placeholder={T.translate("track_chairs.placeholders.select_track")}
                                    options={tracks_ddl}
                                    isMulti
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary right-space" onClick={this.handleSave} disabled={disabledSave}>
                                    {T.translate("general.save")}
                                </button>
                                <button className="btn btn-default" onClick={() => this.toggleForm(false)}>
                                    {T.translate("general.cancel")}
                                </button>
                            </div>
                        </div>
                        }

                        {trackChairs.length === 0 ?
                            (
                                <div className="no-items">{T.translate("track_chairs.no_items")}</div>
                            ) : (
                                <div>
                                    <Table
                                        options={table_options}
                                        data={trackChairs}
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
                            )
                        }
                    </div>
                </>
        )
    }
}

const mapStateToProps = ({ currentSummitState, trackChairListState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...trackChairListState
})

export default connect (
    mapStateToProps,
    {
        getTrackChairs,
        addTrackChair,
        saveTrackChair,
        deleteTrackChair,
        exportTrackChairs
    }
)(TrackChairListPage);
