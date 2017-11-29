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
import { Editor } from '@tinymce/tinymce-react'
import Dropdown from './dropdown'
import GroupedDropdown from './grouped_dropdown'
import DateTimePicker from './datetimepicker'
import TagInput from './tag_input'
import SpeakerInput from './speaker_input'

class EventForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            entity: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(ev) {
        let entity = this.state.entity;
        let value = '';

        if (ev.target.type == 'setupeditor') {
            value = ev.target.getContent();
        } else {
            value = ev.target.value;
        }

        entity[ev.target.id] = value;
        this.setState({entity: entity});
    }

    handleSubmit(ev) {
        alert('A name was submitted');
        ev.preventDefault();
    }

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let event_types_ddl = [
            {label: 'Presentation', value: 'presentation'},
            {label: 'Keynotes', value: 'keynotes'},
            {label: 'Panel', value: 'panel'}
        ];

        let tracks_ddl = [
            {label: 'Architecture & Operations', value: 'architecture'},
            {label: 'Birds of a Feather', value: 'birds'},
            {label: 'Enterprise', value: 'enterprise'}
        ];

        let locations_ddl = [
            {label: 'TBA', value: 'TBA'},
            {label: 'SYDNEY CONVENTION CENTRE', value: [
                {label: 'C2.4', value: 'C2.4'},
                {label: 'C2.5', value: 'C2.5'},
                {label: 'Main Foyer', value: 'main foyer'},
            ]}
        ];

        let levels_ddl = [
            {label: 'N/A', value: 'N/A'},
            {label: 'Beginner', value: 'Beginner'},
            {label: 'Intermediate', value: 'Intermediate'},
            {label: 'Advanced', value: 'Advanced'}
        ];

        return (
            <form onSubmit={this.handleSubmit}>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> Title </label>
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> Short Description / Abstract </label>
                        <Editor
                            id="description"
                            init={{
                                plugins: 'link image code',
                                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
                            }}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> Social Summary </label>
                        <textarea className="form-control" id="social_summary" value={entity.social_summary} onChange={this.handleChange} />
                    </div>
                </div>
                {entity.type == 'presentation' &&
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> What can attendees expect to learn? </label>
                        <Editor
                            id="expect_to_learn"
                            init={{
                                plugins: 'link image code',
                                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
                            }}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                }
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> Head Count </label>
                        <input className="form-control" type="number" id="head_count" value={entity.head_count} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-8">
                        <label> RSVP Link </label>
                        <input className="form-control" id="rsvp_link" value={entity.rsvp_link} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> Location </label>
                        <GroupedDropdown
                            id="location"
                            value={entity.location}
                            options={locations_ddl}
                            placeholder="-- Select a Venue --"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="col-md-4" style={{paddingTop: '24px'}}>
                        <DateTimePicker
                            id="start_date"
                            onChange={this.handleChange}
                            validation={{after: currentSummit.start_date, before: entity.end_date}}
                            format={{date:"YYYY-MM-DD", time: "HH:mm:ss"}}
                            value={entity.start_date}
                            inputProps={{placeholder: 'Start Date'}}
                            timezone={currentSummit.time_zone.name}
                        />
                    </div>
                    <div className="col-md-4" style={{paddingTop: '24px'}}>
                        <DateTimePicker
                            id="end_date"
                            onChange={this.handleChange}
                            validation={{after: entity.start_date, before: currentSummit.end_date}}
                            format={{date:"YYYY-MM-DD", time: "HH:mm:ss"}}
                            value={entity.end_date}
                            inputProps={{placeholder: 'End Date'}}
                            timezone={currentSummit.time_zone.name}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> Event Type </label>
                        <Dropdown
                            id="type"
                            value={entity.type}
                            onChange={this.handleChange}
                            placeholder="-- Select a Type --"
                            options={event_types_ddl}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> Track </label>
                        <Dropdown
                            id="track"
                            value={entity.track}
                            onChange={this.handleChange}
                            placeholder="-- Select a Track --"
                            options={tracks_ddl}
                        />
                    </div>
                    {entity.type == 'presentation' &&
                    <div className="col-md-4">
                        <label> Level </label>
                        <Dropdown
                            id="level"
                            value={entity.level}
                            onChange={this.handleChange}
                            placeholder="-- Select a Level --"
                            options={levels_ddl}
                        />
                    </div>
                    }
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> Feedback </label>
                        <input type="checkbox" id="feedback" checked={entity.feedback} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> Does this talk feature an OpenStack cloud? </label>
                        <input type="radio" id="feature_cloud" value={1} checked={entity.feature_cloud} onChange={this.handleChange} />
                        <input type="radio" id="feature_cloud" value={0} checked={!entity.feature_cloud} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> Tags </label>
                        <TagInput
                            id="tags"
                            value={entity.tags}
                            onChange={this.handleChange}
                            allow_new={false}
                        />
                    </div>
                </div>
                {entity.type == 'presentation' &&
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> Speakers </label>
                        <SpeakerInput
                            id="speakers"
                            value={entity.speakers}
                            onChange={this.handleChange}
                            allow_new={false}
                            summitId={currentSummit.id}
                        />
                    </div>
                </div>
                }

                <input type="submit" className="btn btn-primary" value="Submit" />
            </form>
        );
    }
}

export default EventForm;