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
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { loadSummits, setCurrentSummit, deleteSummit } from '../../actions/summit-actions';
import { formatEpoch } from 'openstack-uicore-foundation/lib/utils/methods';
import Member from '../../models/member'
import {Pagination} from "react-bootstrap";

import '../../styles/summit-directory-page.less';

class SummitDirectoryPage extends React.Component {

    constructor(props){
        super(props);

        props.setCurrentSummit(null);
        props.loadSummits();

        this.handlePageChange = this.handlePageChange.bind(this);
    }

    handlePageChange(page) {
        const {perPage} = this.props;
        this.props.loadSummits(page, perPage);
    }

    onSelectedSummit(event, summit){
        event.preventDefault();
        this.props.setCurrentSummit(summit);
        return false;
    }

    onEditSummit(summit, ev){
        const {history} = this.props;
        ev.preventDefault();

        history.push(`/app/summits/${summit.id}`);
    }

    onNewSummit(ev){
        const {history} = this.props;
        ev.preventDefault();

        history.push(`/app/summits/new`);
    }

    onDeleteSummit(summit, ev){
        const {deleteSummit} = this.props;

        ev.preventDefault();

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: T.translate("directory.remove_warning") + ' ' + summit.name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_delete")
        }).then(function(result){
            if (result.value) {
                deleteSummit(summit.id);
            }
        });
    }

    render() {
        const { summits, member, lastPage, currentPage, totalSummits } = this.props;
        const memberObj = new Member(member);

        const canEditSummit =  memberObj.canEditSummit();
        const canAddSummits = memberObj.canAddSummits();
        const canDeleteSummits = memberObj.canDeleteSummits();

        return (
            <div className="container">
                <h3> {T.translate("directory.summits")} ({totalSummits})</h3>
                {canAddSummits &&
                <div className={'row'}>
                    <div className="col-md-6 col-md-offset-6 text-right">
                        <button className="btn btn-primary right-space" onClick={this.onNewSummit.bind(this)}>
                            {T.translate("directory.add_summit")}
                        </button>
                    </div>
                </div>
                }
                <div>
                    <table className="table" id="summit_table">
                        <tbody>
                        {summits && summits.map((summit,i) => (
                            <tr key={"summit_"+summit.id}>
                                <td className="summit_id"> {summit.id} </td>
                                <td className="summit_name"> {summit.name} </td>
                                <td> {formatEpoch(summit.start_date, 'MMMM Do YYYY')} </td>
                                <td> {formatEpoch(summit.end_date, 'MMMM Do YYYY')} </td>
                                <td>
                                    {summit.invite_only_registration &&
                                        <span className="badge badge-warning">  {T.translate("directory.invitation_only")}</span>
                                    }
                                </td>
                                <td className="center_text actions">
                                    <a href="" onClick={ (e) => { return this.onSelectedSummit(e, summit) }} className="btn btn-default btn-sm">
                                        {T.translate("directory.select")}
                                    </a>
                                    {canEditSummit &&
                                    <a href="" onClick={this.onEditSummit.bind(this, summit)}
                                       className="btn btn-default btn-sm">
                                        {T.translate("general.edit")}
                                    </a>
                                    }
                                    {canDeleteSummits &&
                                    <a href="" onClick={this.onDeleteSummit.bind(this, summit)}
                                       className="btn btn-danger btn-sm">
                                        {T.translate("general.delete")}
                                    </a>
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <Pagination
                        bsSize="medium"
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        maxButtons={10}
                        items={lastPage}
                        activePage={currentPage}
                        onSelect={this.handlePageChange}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ directoryState, loggedUserState }) => ({
    ...directoryState,
    member: loggedUserState.member
});

export default connect (
    mapStateToProps,
    {
        loadSummits,
        setCurrentSummit,
        deleteSummit
    }
)(SummitDirectoryPage);
