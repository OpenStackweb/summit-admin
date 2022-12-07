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
import { connect } from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import {Breadcrumb} from "react-breadcrumbs";
import Swal from "sweetalert2";
import {Input, Table} from 'openstack-uicore-foundation/lib/components';
import FragmentParser from "../../utils/fragmen-parser";

import { getProgressFlags, deleteProgressFlag, saveProgressFlag, addProgressFlag } from "../../actions/track-chair-actions";

import '../../styles/progress-flags-page.less';

class ProgressFlagsPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showForm: false,
            flagLabel: '',
            progressFlagId: null
        }

        this.progressFlagIdParam =  null;
    }

    componentDidMount() {
        const {currentSummit} = this.props;
        if(currentSummit) {
            this.props.getProgressFlags();
            const fragmentParser = new FragmentParser();
            this.progressFlagIdParam = fragmentParser.getParam('flag_id');
        }
    }

    toggleForm = (open) => {
      this.setState(state => ({showForm: open, flagLabel: ''}));
    };

    handleChange = ev => {
        ev.preventDefault();
        const {value, id} = ev.target;

        this.setState({flagLabel: value});
    };

    handleEdit = (progressFlagId) => {
        const {progressFlags} = this.props;
        const progressFlag = progressFlags.find(s => s.id === progressFlagId);

        this.setState({
            showForm: true,
            flagLabel: progressFlag.label,
            progressFlagId: progressFlagId
        })
    };

    handleSave = () => {
        const {flagLabel, progressFlagId} = this.state;

        if (progressFlagId) {
            this.props.saveProgressFlag(progressFlagId, {label: flagLabel}).then(() => {
                this.setState({flagLabel: '', progressFlagId: null, showForm: false})
            });
        } else {
            this.props.addProgressFlag(flagLabel).then(() => {
                this.setState({flagLabel: '', progressFlagId: null, showForm: false})
            });
        }

    };

    handleDelete = (progressFlagId) => {
        const {deleteProgressFlag, progressFlags} = this.props;
        const progressFlag = progressFlags.find(s => s.id === progressFlagId);

        Swal.fire({
            title: T.translate("general.are_you_sure"),
            text: `${T.translate("progress_flags.delete_warning")} ${progressFlag.label}`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: T.translate("general.yes_remove")
        }).then(function(result){
            if (result.value) {
                deleteProgressFlag(progressFlagId);
            }
        });
    };

    render(){
        const {currentSummit, progressFlags, match} = this.props;
        const {showForm, flagLabel} = this.state;

        const columns = [
            { columnKey: 'label', value: T.translate("progress_flags.label") },
        ];

        const table_options = {
            actions: {
                edit: { onClick: this.handleEdit },
                delete: { onClick: this.handleDelete }
            }
        };


        if(!currentSummit.id) return(<div />);

        if(progressFlags.length > 0 && this.progressFlagIdParam && !showForm) {
            setTimeout(() => {
                this.handleEdit(parseInt(this.progressFlagIdParam))
                this.progressFlagIdParam = null;
            }, 100);
        }

        return(
            <>
                <Breadcrumb data={{ title: T.translate("progress_flags.progress_flags"), pathname: match.url }} />
                    <div className="container">
                        <h3> {T.translate("progress_flags.list")} ({progressFlags.length})</h3>
                        <div className={'row'}>
                            <div className="col-md-3 col-md-offset-9 text-right">
                                <button className="btn btn-primary" onClick={() => this.toggleForm(true)}>
                                    {T.translate("progress_flags.add")}
                                </button>
                            </div>
                        </div>

                        {showForm &&
                        <div className="add-new-wrapper row">
                            <div className="col-md-6">
                                <Input
                                    id="flagLabel"
                                    value={flagLabel}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <button className="btn btn-primary right-space" onClick={this.handleSave} disabled={!flagLabel}>
                                    {T.translate("general.save")}
                                </button>
                                <button className="btn btn-default" onClick={() => this.toggleForm(false)}>
                                    {T.translate("general.cancel")}
                                </button>
                            </div>
                        </div>
                        }

                        {progressFlags.length === 0 ?
                            (
                                <div className="no-items">{T.translate("progress_flags.no_items")}</div>
                            ) : (
                                <div>
                                    <Table
                                        options={table_options}
                                        data={progressFlags}
                                        columns={columns}
                                    />
                                </div>
                            )
                        }
                    </div>
                </>
        )
    }
}

const mapStateToProps = ({ currentSummitState, progressFlagsState }) => ({
    currentSummit   : currentSummitState.currentSummit,
    ...progressFlagsState
});

export default connect (
    mapStateToProps,
    {
        getProgressFlags,
        addProgressFlag,
        saveProgressFlag,
        deleteProgressFlag
    }
)(ProgressFlagsPage);
