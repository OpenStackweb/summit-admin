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
import T from "i18n-react/dist/i18n-react";
import { Breadcrumb } from 'react-breadcrumbs';
import { getReport} from "../../actions/report-actions";
import history from "../../history"

//import '../../styles/report-page.less';

class ReportPage extends React.Component {

    constructor(props) {
        super(props);

    }

    componentWillMount () {
        let reportName = this.props.match.params.report_name;

        if (!reportName) {
            history.push('reports');
        } else {
            this.props.getReport(reportName);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.report_name;
        let newId = newProps.match.params.report_name;

        if (oldId != newId) {
            if (!newId) {
                history.push('reports');
            } else {
                this.props.getReport(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.label : T.translate("general.new");

        let categoryOptions = currentSummit.tracks.map(c => ({value: c.id, label: c.name}));

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <div className="row">
                    <div className="col-md-8">
                        <h3>{title} {T.translate("edit_tag_group.tag_group")}</h3>
                    </div>

                </div>
                <hr/>
                REPORT
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentReportState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentReportState
})

export default connect (
    mapStateToProps,
    {
        getReport,
    }
)(ReportPage);
