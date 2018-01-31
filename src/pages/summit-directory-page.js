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

import React from 'react';
import { connect } from 'react-redux';
import { loadSummits, setCurrentSummit } from '../actions/summit-actions';
import { formatEpoch } from '../utils/methods';

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
        this.props.loadSummits();
    }

    render() {
        let { summits } = this.props;
        let orderedSummits = summits.sort(
            (a, b) => (a.start_date < b.start_date ? 1 : (a.start_date > b.start_date ? -1 : 0))
        );

        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <table className="table" id="summit_table">
                            <tbody>
                                {summits && orderedSummits.map((summit,i) => (
                                    <tr key={"summit_"+summit.id}>
                                        <td className="summit_name"> {summit.name} </td>
                                        <td> {formatEpoch(summit.start_date, 'MMMM Do YYYY')} </td>
                                        <td> {formatEpoch(summit.end_date, 'MMMM Do YYYY')} </td>
                                        <td className="center_text">
                                            <a href="" onClick={ (e) => { return this.onSelectedSummit(e, summit) }} className="btn btn-primary btn-sm">
                                                Control Panel
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
