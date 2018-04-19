/**
 * Copyright 2018 OpenStack Foundation
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
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import SimpleForm from '../../components/forms/simple-form';
import { getSummitById }  from '../../actions/summit-actions';
import { getPushNotification, resetPushNotificationForm, savePushNotification } from "../../actions/push-notification-actions";

class EditPushNotificationPage extends React.Component {

    componentWillMount () {
        let {entity} = this.props;
        let pushNotificationId = this.props.match.params.push_notification_id;

        if (!pushNotificationId) {
            this.props.resetPushNotificationForm();
        } else if (pushNotificationId != entity.id){
            this.props.getPushNotification(pushNotificationId);
        }
    }

    render(){
        let {currentSummit, entity, errors, match} = this.props;
        let title = (entity.id) ? T.translate("general.edit") : T.translate("general.add");
        let fields = [
            {type: 'text', name: 'name', label: T.translate("edit_push_notification.name")},
            {type: 'text', name: 'external_id', label: T.translate("edit_push_notification.external_id")},
            {type: 'textarea', name: 'description', label: T.translate("edit_push_notification.description")}
        ];
        let breadcrumb = (entity.id) ? entity.name : T.translate("general.new");


        return(
            <div className="container">
                <Breadcrumb data={{ title: breadcrumb, pathname: match.url }} ></Breadcrumb>
                <h3>{title} {T.translate("edit_push_notification.push_notification")}</h3>
                <hr/>
                {currentSummit &&
                <SimpleForm
                    history={this.props.history}
                    entity={entity}
                    errors={errors}
                    fields={fields}
                    onSubmit={this.props.savePushNotification}
                />
                }
            </div>
        )
    }
}

const mapStateToProps = ({ currentSummitState, currentPushNotificationState }) => ({
    currentSummit : currentSummitState.currentSummit,
    ...currentPushNotificationState
})

export default connect (
    mapStateToProps,
    {
        getSummitById,
        getPushNotification,
        resetPushNotificationForm,
        savePushNotification
    }
)(EditPushNotificationPage);