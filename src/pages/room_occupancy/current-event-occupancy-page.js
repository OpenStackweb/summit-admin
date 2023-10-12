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
import { getCurrentEventForOccupancy, saveOccupancy } from "../../actions/event-actions";
import FragmentParser from "../../utils/fragmen-parser";

import '../../styles/room-occupancy-page.less';

class CurrentEventOccupancyPage extends React.Component {

    constructor(props) {
        super(props);

        this.interval       = null;
        this.fragmentParser = new FragmentParser();

    }

    componentDidMount() {
        let roomId = this.props.match.params.room_id;
        const {getCurrentEventForOccupancy} = this.props;
        let eventIdHash = this.fragmentParser.getParam('event');

        getCurrentEventForOccupancy(roomId, eventIdHash);

        this.interval = setInterval(getCurrentEventForOccupancy, 1000*60*5, roomId, eventIdHash); //every 2 minutes
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldId = prevProps.match.params.room_id;
        const newId = this.props.match.params.room_id;
        let eventIdHash = this.fragmentParser.getParam('event');

        if (newId !== oldId) {
            this.props.getCurrentEventForOccupancy(newId, eventIdHash);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    changeOccupancy(event, add, ev) {
        let values = ['EMPTY', '25%', '50%', '75%', 'FULL'];

        let key = values.indexOf(event.occupancy);

        ev.preventDefault();

        if (add) {
            if (event.occupancy === 'FULL') return;
            event.occupancy = values[key + 1];
        } else {
            if (event.occupancy === 'EMPTY') return;
            event.occupancy = values[key - 1];
        }

        this.props.saveOccupancy(event);

    }


    render(){
        const {currentEvent, match} = this.props;

        if (!currentEvent.id) {
            return (
                <div className="currentEventView text-center">
                    <Breadcrumb data={{ title: match.params.room_id, pathname: match.url }}/>
                    <div>{T.translate("room_occupancy.no_current_event")}</div>
                </div>
            );
        }

        return(
            <div className="currentEventView text-center">
                <Breadcrumb data={{ title: currentEvent.room, pathname: match.url }}/>

                <div className="container">
                    <h3>{currentEvent.title}</h3>

                    <label>Speakers:</label>
                    <div>{currentEvent.speakers}</div>

                    <label>From:</label>
                    <div>{currentEvent.start_date}</div>

                    <label>To:</label>
                    <div>{currentEvent.end_date}</div>

                    <div className="form-inline occupancy">
                        <button className="btn btn-default" onClick={this.changeOccupancy.bind(this, currentEvent, false)}>
                            <i className="fa fa-minus"/>
                        </button>
                        <span>{currentEvent.occupancy}</span>
                        <button className="btn btn-default" onClick={this.changeOccupancy.bind(this, currentEvent, true)}>
                            <i className="fa fa-plus"/>
                        </button>
                    </div>

                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentRoomOccupancyState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    currentEvent    : currentRoomOccupancyState.currentEvent
})

export default connect (
    mapStateToProps,
    {
        getCurrentEventForOccupancy,
        saveOccupancy
    }
)(CurrentEventOccupancyPage);
