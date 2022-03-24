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
import {FreeTextSearch, SpeakerInput, SortableTable, Table} from 'openstack-uicore-foundation/lib/components';
import { getFeaturedSpeakers, removeFeaturedSpeaker, addFeaturedSpeaker, updateFeaturedSpeakerOrder } from "../../actions/speaker-actions";

class FeaturedSpeakersPage extends React.Component {

    constructor(props) {
        super(props);

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
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getFeaturedSpeakers();
        }
    }

    handleSearch(term) {
        const {page, perPage} = this.props;
        this.props.getFeaturedSpeakers(term, page, perPage);
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
        const {currentSummit, history} = this.props;
        history.push(`/app/speakers/${speakerId}`);
    }

    render(){
        const {currentSummit, speakers, term, totalSpeakers} = this.props;
        const {speakerToAdd} = this.state;

        const columns = [
            { columnKey: 'id', value: T.translate("general.id"), sortable: true },
            { columnKey: 'name', value: T.translate("general.name") },
            { columnKey: 'email', value: T.translate("general.email") },
            { columnKey: 'title', value: T.translate("featured_speakers.title") },
            { columnKey: 'pic_bool', value: T.translate("featured_speakers.pic") },
            { columnKey: 'big_pic_bool', value: T.translate("featured_speakers.big_pic") },
        ];

        const table_options = {
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
                            value={term ?? ''}
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
                    <SortableTable
                        options={table_options}
                        data={speakers}
                        columns={columns}
                        dropCallback={this.props.updateFeaturedSpeakerOrder}
                        orderField="order"
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
        addFeaturedSpeaker,
        updateFeaturedSpeakerOrder
    }
)(FeaturedSpeakersPage);
