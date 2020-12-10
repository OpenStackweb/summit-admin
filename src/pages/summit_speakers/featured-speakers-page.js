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
import { Pagination } from 'react-bootstrap';
import {FreeTextSearch, SpeakerInput, Table} from 'openstack-uicore-foundation/lib/components';
import { getFeaturedSpeakers, removeFeaturedSpeaker, addFeaturedSpeaker } from "../../actions/speaker-actions";

class FeaturedSpeakersPage extends React.Component {

    constructor(props) {
        super(props);

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleLink = this.handleLink.bind(this);

        this.state = {
            speakerToAdd: null
        };
    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getFeaturedSpeakers();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id !== newProps.currentSummit.id) {
            this.props.getFeaturedSpeakers();
        }
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage} = this.props;
        this.props.getFeaturedSpeakers(term, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage} = this.props;
        this.props.getFeaturedSpeakers(term, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage} = this.props;
        this.props.getFeaturedSpeakers(term, page, perPage, order, orderDir);
    }

    handleDelete(speakerId) {
        this.props.removeFeaturedSpeaker(speakerId);
    }

    handleChange(ev) {
        const {value} = ev.target;
        this.setState({speakerToAdd: value[0]});
    }

    handleAdd() {
        const {speakerToAdd} = this.state;
        if (speakerToAdd) {
            this.props.addFeaturedSpeaker(speakerToAdd);
            this.setState({speakerToAdd: null})
        }
    }

    handleLink(speakerId,) {
        let {currentSummit, history} = this.props;
        history.push(`/app/speakers/${speakerId}`);
    }

    render(){
        let {currentSummit, speakers, lastPage, currentPage, term, order, orderDir, totalSpeakers} = this.props;
        const {speakerToAdd} = this.state;

        let columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'email', value: T.translate("general.email") },
            { columnKey: 'title', value: T.translate("featured_speakers.title") },
            { columnKey: 'pic_bool', value: T.translate("featured_speakers.pic") },
            { columnKey: 'big_pic_bool', value: T.translate("featured_speakers.big_pic") },
        ];

        let table_options = {
            sortCol: order,
            sortDir: orderDir,
            actions: {
                edit: {onClick: this.handleLink},
                delete: { onClick: this.handleDelete }
            }
        }

        if(!currentSummit.id) return(<div/>);

        return(
            <div className="container">
                <h3> {T.translate("featured_speakers.featured_speakers")} ({totalSpeakers})</h3>
                <div className={'row'}>
                    <div className={'col-md-6'}>
                        <FreeTextSearch
                            value={term}
                            placeholder={T.translate("featured_speakers.placeholders.search_featured_speakers")}
                            onSearch={this.handleSearch}
                        />
                    </div>
                    <div className={'col-md-4'}>
                        <SpeakerInput
                            id="speakers"
                            summitId={currentSummit.id}
                            value={speakerToAdd}
                            onChange={this.handleChange}
                            multi={false}
                            history={history}
                        />
                    </div>
                    <div className={'col-md-2'}>
                        <button className="btn btn-primary pull-right left-space" onClick={this.handleAdd}>
                            {T.translate("featured_speakers.add")}
                        </button>
                    </div>
                </div>

                {speakers.length === 0 &&
                <div>{T.translate("featured_speakers.no_speakers")}</div>
                }

                {speakers.length > 0 &&
                <div>
                    <Table
                        options={table_options}
                        data={speakers}
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

const mapStateToProps = ({ currentSummitState, featuredSpeakersState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...featuredSpeakersState
})

export default connect (
    mapStateToProps,
    {
        getFeaturedSpeakers,
        removeFeaturedSpeaker,
        addFeaturedSpeaker
    }
)(FeaturedSpeakersPage);
