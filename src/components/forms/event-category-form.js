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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import {findElementPos} from '../../utils/methods'
import Input from '../inputs/text-input'
import TextEditor from '../inputs/editor-input'
import SimpleLinkList from '../simple-link-list/index'
import {queryTags} from '../../actions/base-actions'


class EventCategoryForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entity: {...props.entity},
            errors: props.errors
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagLink = this.handleTagLink.bind(this);
        this.handleTagEdit = this.handleTagEdit.bind(this);
        this.handleTagUnLink = this.handleTagUnLink.bind(this);
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            entity: {...nextProps.entity},
            errors: {...nextProps.errors}
        });

        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    handleChange(ev) {
        let entity = {...this.state.entity};
        let errors = {...this.state.errors};
        let {value, id} = ev.target;

        if (ev.target.type == 'checkbox') {
            value = ev.target.checked;
        }

        errors[id] = '';
        entity[id] = value;
        this.setState({entity: entity, errors: errors});
    }

    handleSubmit(ev) {
        let entity = {...this.state.entity};
        ev.preventDefault();

        this.props.onSubmit(this.state.entity, this.props.history);
    }

    hasErrors(field) {
        let {errors} = this.state;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    handleTagLink(value) {
        let tags = [...this.state.entity.tags];
        tags.push(value);

        let entity = {...this.state.entity, tags: tags};
        this.setState({entity: entity});
    }

    handleTagUnLink(value, ev) {
        ev.preventDefault();

        let tags = this.state.entity.tags.filter(t => t.id != value);

        let entity = {...this.state.entity, tags: tags};
        this.setState({entity: entity});
    }

    handleTagEdit() {
        let {currentSummit, history} = this.props;
        history.push(`/app/summits/${currentSummit.id}/event-categories/new`);
    }

    render() {
        let {entity} = this.state;
        let { currentSummit } = this.props;

        let tagsColumns = [
            { columnKey: 'tag', value: T.translate("edit_event_category.tag") },
            { columnKey: 'group', value: T.translate("edit_event_category.group") }
        ];

        return (
            <form className="event-type-form">
                <input type="hidden" id="id" value={entity.id} />
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.name")} *</label>
                        <Input
                            id="name"
                            value={entity.name}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('name')}
                        />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_event_category.code")} *</label>
                        <Input
                            id="code"
                            value={entity.code}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('code')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-12">
                        <label> {T.translate("edit_event_category.description")} </label>
                        <TextEditor
                            id="description"
                            value={entity.description}
                            onChange={this.handleChange}
                            error={this.hasErrors('description')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_sessions")}</label>
                        <Input
                            type="number"
                            id="session_count"
                            value={entity.session_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('session_count')}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_alternates")}</label>
                        <Input
                            type="number"
                            id="alternate_count"
                            value={entity.alternate_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('alternate_count')}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_lightning")}</label>
                        <Input
                            type="number"
                            id="lightning_count"
                            value={entity.lightning_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('lightning_count')}
                        />
                    </div>
                    <div className="col-md-3">
                        <label> {T.translate("edit_event_category.number_lightning_alternates")}</label>
                        <Input
                            type="number"
                            id="lightning_alternate_count"
                            value={entity.lightning_alternate_count}
                            onChange={this.handleChange}
                            className="form-control"
                            error={this.hasErrors('lightning_alternate_count')}
                        />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="voting_visible" checked={entity.voting_visible}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="voting_visible">
                                {T.translate("edit_event_category.visible_voters")}
                            </label>
                        </div>
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="chair_visible" checked={entity.chair_visible}
                                   onChange={this.handleChange} className="form-check-input"/>
                            <label className="form-check-label" htmlFor="chair_visible">
                                {T.translate("edit_event_category.visible_track_chairs")}
                            </label>
                        </div>
                    </div>
                </div>

                <SimpleLinkList
                    title={T.translate("edit_event_category.tags")}
                    values={entity.tags}
                    columns={tagsColumns}
                    valueKey="tag"
                    labelKey="tag"
                    onEdit={this.handleTagEdit}
                    onLink={this.handleTagLink}
                    onUnLink={this.handleTagUnLink}
                    queryOptions={queryTags}
                />

                <div className="row">
                    <div className="col-md-12 submit-buttons">
                        <input type="button" onClick={this.handleSubmit}
                               className="btn btn-primary pull-right" value={T.translate("general.save")}/>
                    </div>
                </div>
            </form>
        );
    }
}

export default EventCategoryForm;