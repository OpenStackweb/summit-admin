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
import MarketingSettingForm from '../../components/forms/marketing-setting-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getMarketingSetting, resetSettingForm, saveMarketingSetting } from "../../actions/marketing-actions";
import '../../styles/edit-marketing-setting-page.less';

class EditMarketingSettingPage extends React.Component {

    constructor(props) {
        const settingId = props.match.params.setting_id;
        super(props);

        if (!settingId) {
            props.resetSettingForm();
        } else {
            props.getMarketingSetting(settingId);
        }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.setting_id;
        let newId = newProps.match.params.setting_id;

        if (oldId !== newId) {
            if (!newId) {
                this.props.resetSettingForm();
            } else {
                this.props.getMarketingSetting(newId);
            }
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let breadcrumb = (entity.id) ? entity.key : T.translate("general.new");

        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} />
                <h3>{title} {T.translate("marketing.marketing_setting")}</h3>
                <hr/>
                {currentSummit &&
                <MarketingSettingForm
                    currentSummit={currentSummit}
                    entity={entity}
                    errors={errors}
                    onSubmit={this.props.saveMarketingSetting}
                />
                }
            </div>

        )
    }
}

const mapStateToProps = ({ currentSummitState, marketingSettingState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...marketingSettingState
});

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getMarketingSetting,
        resetSettingForm,
        saveMarketingSetting,
    }
)(EditMarketingSettingPage);
