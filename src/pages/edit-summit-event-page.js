import React from 'react'
import { connect } from 'react-redux';
import EventForm from '../components/event-form';

class EditSummitEventPage extends React.Component {
    render(){
        let {currentSummit} = this.props;
        return(
            <div className="container">
                <h3>Summit Event</h3>
                <hr/>
                <EventForm/>
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit : currentSummitState.currentSummit,
})

export default connect (
    mapStateToProps,
    {

    }
)(EditSummitEventPage);