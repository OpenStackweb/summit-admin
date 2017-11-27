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
                <div className="row justify-content-center">
                    {summits && summits.map((summit,i) => (
                        <div key={summit.id} className="col-md-4" style={{marginTop: '10px'}}>
                            <a className="btn btn-default form-control" onClick={ (e) => { return this.onSelectedSummit(e, summit) }}>
                                {summit.name}
                            </a>
                        </div>
                    ))}
                </div>
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
