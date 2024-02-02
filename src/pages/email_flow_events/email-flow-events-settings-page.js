/**
 * Copyright 2020 OpenStack Foundation
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
import EmailFlowEventSettingsForm from '../../components/forms/email-flow-event-settings-form';
import { getSummitById }  from '../../actions/summit-actions';
import {getMarketingEmailSettings, saveMarketingEmailSettings} from '../../actions/email-actions';
import '../../styles/edit-email-flow-event-page.less';

class EmailFlowEventSettingsPage extends React.Component {

    constructor(props) {                
        super(props);

        props.getMarketingEmailSettings();
    }    

    render(){
        const {currentSummit, email_marketing_settings, errors, match, history} = this.props;

        return(
            <div className="container">                
                <h3>{T.translate("email_flow_events_settings.email_settings")}</h3>
                <hr/>
                {currentSummit &&
                <EmailFlowEventSettingsForm
                    entity={email_marketing_settings}
                    currentSummit={currentSummit}
                    errors={errors}
                    onSubmit={this.props.saveMarketingEmailSettings}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, emailFLowEventSettingsState, baseState }) => ({
    currentSummit : currentSummitState.currentSummit,
    loading: baseState.loading,
    ...emailFLowEventSettingsState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getMarketingEmailSettings,
        saveMarketingEmailSettings
    }
)(EmailFlowEventSettingsPage);
