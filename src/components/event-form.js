import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

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
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> Event Type </label>
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> Track </label>
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input className="form-control" id="title" value={entity.title} onChange={this.handleChange} />
                    </div>
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
                        <input className="form-control" id="tags" value={entity.tags} onChange={this.handleChange} />
                    </div>
                </div>

                <input type="submit" className="btn btn-primary" value="Submit" />
            </form>
        );
    }
}

export default EventForm;