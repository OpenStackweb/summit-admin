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
import SummitDocForm from '../../components/forms/summitdoc-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getSummitDoc, resetSummitDocForm, saveSummitDoc } from "../../actions/summitdoc-actions";
//import '../../styles/edit-summitdoc-page.less';

class EditSummitDocPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount () {
        let summitDocId = this.props.match.params.summitdoc_id;

        if (!summitDocId) {
            this.props.resetSummitDocForm();
        } else {
            this.props.getSummitDoc(summitDocId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.summitdoc_id;
        let newId = newProps.match.params.summitdoc_id;

        if (oldId != newId) {
            if (!newId) {
                this.props.resetSummitDocForm();
            } else {
                this.props.getSummitDoc(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.label : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("summitdoc.summitdoc")}</h3>
                <hr/>
                {currentSummit &&
                <SummitDocForm
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveSummitDoc}
                />
                }
            </div>

        )
    }
}

const mapStateToProps = ({ currentSummitState, summitDocState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...summitDocState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getSummitDoc,
        resetSummitDocForm,
        saveSummitDoc,
    }
)(EditSummitDocPage);
