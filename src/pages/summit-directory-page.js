import React from 'react';
import { connect } from 'react-redux';
import { loadSummits, setCurrentSummit } from '../actions';

class SummitDirectoryPage extends React.Component {

    constructor(props){
        super(props);
    }

    onSelectedSummit(event, summit){
        event.preventDefault();
        this.props.setCurrentSummit(summit, this.props.history);
        return false;
    }

    componentWillMount () {
        this.props.setCurrentSummit(null);
        if(!this.props.summits || !this.props.summits.length) {
            this.props.loadSummits();
        }
    }

    render() {
        let { summits } = this.props;
        return (
            <div className="container">
                {summits && summits.map((summit,i) => (
                    <a key={summit.id} className="btn btn-default" href="#" onClick={ (e) => { return this.onSelectedSummit(e, summit) }}>
                        {summit.name}
                    </a>
                ))}
            </div>
        );
    }
}

const mapStateToProps = ({ directoryState }) => ({
    summits : directoryState.items,
})

export default connect (
    mapStateToProps,
    {
        loadSummits,
        setCurrentSummit,
    }
)(SummitDirectoryPage);
