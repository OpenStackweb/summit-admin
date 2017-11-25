import React from 'react'
import { connect } from 'react-redux';

class SummitDashboardPage extends React.Component {

    constructor(props){
        super(props);
    }

    render() {
        let { currentSummit } = this.props;
        return (
            <div>
                <h1>{currentSummit.name} Summit</h1>
            </div>
        );
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit : currentSummitState.currentSummit,
})

export default connect (
    mapStateToProps,
    {

    }
)(SummitDashboardPage);
