import React from 'react'
import { connect } from 'react-redux';

class EditSummitEventPage extends React.Component {
    render(){
        let {currentSummit} = this.props;
        return(
            <div>
               <h1>Edit Summit Event</h1>
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