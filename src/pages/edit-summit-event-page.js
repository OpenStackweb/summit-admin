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
import EventForm from '../components/event-form';
import { getTracks, getVenues, getEventTypes } from '../actions';

class EditSummitEventPage extends React.Component {

    componentWillMount () {
        if(!this.props.track_options)
            this.props.getTracks(this.props.currentSummit.id);

        if(!this.props.location_options)
            this.props.getVenues(this.props.currentSummit.id);

        if(!this.props.type_options)
            this.props.getEventTypes(this.props.currentSummit.id);
    }

    render(){
        let {currentSummit} = this.props;
        return(
            <div className="container">
                <h3>Summit Event</h3>
                <hr/>
                <EventForm
                    currentSummit={currentSummit}
                    levelopts={this.props.level_options}
                    trackopts={this.props.track_options}
                    typeopts={this.props.type_options}
                    locationopts={this.props.location_options}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentSummitEventState }) => ({
    currentSummit: currentSummitState.currentSummit,
    level_options: currentSummitEventState.level_options,
    type_options: currentSummitEventState.type_options,
    track_options: currentSummitEventState.track_options,
    location_options: currentSummitEventState.location_options
})

export default connect (
    mapStateToProps,
    {
        getTracks,
        getVenues,
        getEventTypes,
    }
)(EditSummitEventPage);