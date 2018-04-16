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
import SummitForm from '../../components/forms/summit-form';
import { getSummitById, resetSummitForm, saveSummit }  from '../../actions/summit-actions';
import '../../styles/edit-summit-page.less';
import '../../components/form-validation/validate.less';


class EditSummitPage extends React.Component {

    constructor(props) {
        super(props);
    }

    render(){
        let {currentSummit, errors, history} = this.props;

        return(
            <div className="container">
                <h3>{T.translate("general.summit")}</h3>
                <hr/>
                <SummitForm
                    history={history}
                    entity={currentSummit}
                    errors={errors}
                    onSubmit={this.props.saveSummit}
                />
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit: currentSummitState.currentSummit,
    errors: currentSummitState.errors
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        saveSummit,
        resetSummitForm
    }
)(EditSummitPage);