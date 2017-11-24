import React from 'react';
import { connect } from 'react-redux';
import { loadSummits } from '../actions';

class SummitDirectoryPage extends React.Component {

    componentDidMount () {
        if(!this.props.items) {
            this.props.loadItems();
        }
    }

    render() {
        return (
            <div className="container">
                {this.props.items && this.props.items.map((summit,i) => (
                    <a className="btn btn-default" href='/app/summit/${summit.id}/dashboard'>
                        {summit.name}
                    </a>
                ))}
            </div>
        );
    }
}

export default connect (
    state => {
        return {
            items: state.items,
        }
    },
    dispatch => ({
        loadItems () {
            dispatch(loadSummits());
        }
    })
)(SummitDirectoryPage);
