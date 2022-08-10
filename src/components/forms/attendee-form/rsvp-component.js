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
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import { epochToMoment } from 'openstack-uicore-foundation/lib/utils/methods'


export default class RsvpComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};

        this.handleDelete = this.handleDelete.bind(this);

    }

    handleDelete(rsvpId, ev) {
        let {onDelete, member} = this.props;

        ev.preventDefault();
        let msg = {
            title: T.translate("general.are_you_sure"),
            text: T.translate("edit_attendee.remove_rsvp_from_attendee"),
            type: 'warning'
        };

        Swal.fire(msg).then(function(){
            onDelete(member.id, rsvpId);
        });
    }

    render() {
        let {member} = this.props;

        return (
            <div className="row form-group">
                <div className="col-md-12">
                    <legend>{T.translate("edit_attendee.rsvp")}</legend>
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>{T.translate("edit_attendee.event")}</th>
                            <th>{T.translate("edit_attendee.created")}</th>
                            <th>{T.translate("edit_attendee.seat")}</th>
                            <th>&nbsp;</th>
                        </tr>
                        </thead>
                        <tbody>
                        {member.rsvp.map(r =>
                            <tr key={r.id} >
                                <td>{member.schedule_summit_events.find(e => e.id === r.event_id).title}</td>
                                <td>{epochToMoment(r.created).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                <td>{r.seat_type}</td>
                                <td>
                                    <a href="" onClick={this.handleDelete.bind(this, r.id)} >
                                        <i className="fa fa-trash-o"/>
                                    </a>
                                </td>
                            </tr>

                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        );

    }
}

