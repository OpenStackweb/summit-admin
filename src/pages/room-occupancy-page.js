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
import { Breadcrumb } from 'react-breadcrumbs';
import { Pagination } from 'react-bootstrap';
import { FreeTextSearch, Dropdown } from 'openstack-uicore-foundation/lib/components';
import { getSummitById }  from '../actions/summit-actions';
import { getEventsForOccupancy, saveOccupancy } from "../actions/event-actions";
import OccupancyTable from "../components/tables/room-occupancy-table/OccupancyTable"

class RoomOccupancyPage extends React.Component {

    constructor(props) {
        super(props);

        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleRoomFilter = this.handleRoomFilter.bind(this);

    }

    componentDidMount() {
        let {currentSummit} = this.props;
        if(currentSummit !== null) {
            this.props.getEventsForOccupancy();
        }
    }

    componentWillReceiveProps(newProps) {
        let {currentSummit} = this.props;

        if (currentSummit !== null && currentSummit.id != newProps.currentSummit.id) {
            this.props.getEventsForOccupancy();
        }
    }

    handlePageChange(page) {
        let {term, order, orderDir, perPage, room} = this.props;
        this.props.getEventsForOccupancy(term, room, page, perPage, order, orderDir);
    }

    handleSort(index, key, dir, func) {
        let {term, page, perPage, room} = this.props;
        key = (key == 'name') ? 'last_name' : key;
        this.props.getEventsForOccupancy(term, room, page, perPage, key, dir);
    }

    handleSearch(term) {
        let {order, orderDir, page, perPage, room} = this.props;
        this.props.getEventsForOccupancy(term, room, page, perPage, order, orderDir);
    }

    handleRoomFilter(ev) {
        let {term, order, orderDir, page, perPage} = this.props;
        let room = ev.target.value;

        this.props.getEventsForOccupancy(term, room, page, perPage, order, orderDir);
    }

    changeOccupancy(eventId, add, ev) {
        let values = ['EMPTY', '25%', '50%', '75%', 'FULL'];
        let {events} = this.props;
        let event =  events.find(e => e.id == eventId);

        let key = values.indexOf(event.occupancy);

        ev.preventDefault();

        if (add) {
            if (event.occupancy == 'FULL') return;
            event.occupancy = values[key + 1];
        } else {
            if (event.occupancy == 'EMPTY') return;
            event.occupancy = values[key - 1];
        }

        this.props.saveOccupancy(event);

    }

    render(){
        let {currentSummit, events, lastPage, currentPage, term, order, orderDir, match, room} = this.props;
        let that = this;

        let columns = [
            { columnKey: 'room', value: T.translate("room_occupancy.room"), sortable: true },
            { columnKey: 'start', value: T.translate("room_occupancy.start"), sortable: true, width: '100px' },
            { columnKey: 'title', value: T.translate("room_occupancy.title"), sortable: true },
            { columnKey: 'speakers', value: T.translate("room_occupancy.speakers") },
        ];

        let table_options = {
            className: "dataTable",
            sortCol: (order == 'last_name') ? 'name' : order,
            sortDir: orderDir,
            actions: {
                valueRow: 'occupancy',
                onMore: function(eventId, ev) { that.changeOccupancy(eventId, true, ev); },
                onLess: function(eventId, ev) { that.changeOccupancy(eventId, false, ev); }
            }
        }

        if(!currentSummit.id) return(<div></div>);

        let room_ddl = currentSummit.locations.filter(v => (v.class_name == 'SummitVenueRoom')).map(r => {
            return {label: r.name, value: r.id};
        });


        return(
            <div>
                <Breadcrumb data={{ title: T.translate("room_occupancy.room_occupancy"), pathname: match.url }} ></Breadcrumb>

                <div className="container">
                    <h3> {T.translate("room_occupancy.room_occupancy")}</h3>
                    <div className={'row'}>
                        <div className={'col-md-6'}>
                            <FreeTextSearch
                                value={term}
                                placeholder={T.translate("room_occupancy.placeholders.search_events")}
                                onSearch={this.handleSearch}
                            />
                        </div>
                        <div className={'col-md-6'}>
                            <Dropdown id="room" value={room} placeholder={T.translate("room_occupancy.placeholders.select_room")}
                                      options={room_ddl} onChange={this.handleRoomFilter}
                            />
                        </div>
                    </div>

                    {events.length == 0 &&
                    <div>{T.translate("room_occupancy.no_events")}</div>
                    }

                    {events.length > 0 &&
                    <div>
                        <OccupancyTable
                            options={table_options}
                            data={events}
                            columns={columns}
                            onSort={this.handleSort}
                            className="dataTable"
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
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomOccupancyState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...currentRoomOccupancyState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getEventsForOccupancy,
        saveOccupancy
    }
)(RoomOccupancyPage);
