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
import T from 'i18n-react/dist/i18n-react'

class MergeSpeakerForm extends React.Component {
    constructor(props) {
        super(props);

    }

    handleClick(field, ev) {
        let {column} = this.props;

        this.props.onSelect(field, column);
    }

    getFieldClass(field) {
        let {selected, column} = this.props;

        if (selected[field] == column) return 'selected';

        return '';
    }

    render() {
        let {entity, column} = this.props;
        let show_label = (column == 1);

        if (!entity)
            return (<div>{T.translate("merge_speakers.select_speaker")}</div>);

        return (
            <div className="merge-speaker-col">
                <input type="hidden" id={column + "_id"} value={entity.id} />
                <div className="row field-box">
                    {show_label &&
                    <div className="col-md-2">
                         <label>
                             {T.translate("merge_speakers.title")}
                         </label>
                    </div>
                    }
                    <div className="col-md-10">
                        <input onClick={this.handleClick.bind(this,'title')} className={this.getFieldClass('title') + ' form-control field'} defaultValue={entity.title} />
                    </div>
                </div>
                <div className="row field-box">
                    {show_label &&
                    <div className="col-md-2">
                        <label>
                            {T.translate("merge_speakers.first_name")}
                        </label>
                    </div>
                    }
                    <div className="col-md-10">
                        <input className="form-control field" defaultValue={entity.first_name} disabled />
                    </div>
                </div>
                <div className="row field-box">
                    {show_label &&
                    <div className="col-md-2">
                        <label>
                            {T.translate("merge_speakers.last_name")}
                        </label>
                    </div>
                    }
                    <div className="col-md-10">
                        <input className="form-control field" defaultValue={entity.last_name} disabled />
                    </div>
                </div>
                <div className="row field-box">
                    {show_label &&
                    <div className="col-md-2">
                        <label>
                            {T.translate("merge_speakers.email")}
                        </label>
                    </div>
                    }
                    <div className="col-md-10">
                        <input className="form-control field" defaultValue={entity.email} disabled />
                    </div>
                </div>


            </div>
        );
    }
}

export default MergeSpeakerForm;