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

export default class SelectableMergeRow extends React.Component {

    handleClick(field, column)  {
        if (this.props.values[column])
            this.props.onClick(field, column);
    }

    getFieldClass(field, column) {
        let {selected, disabled} = this.props;

        if (disabled) return '';
        if (selected == column) return 'selected';
        return 'unselected';
    }

    render() {
        let {name, values} = this.props;

        return (
            <div className="row field-box">
                <div className="col-md-2">
                    <label> {T.translate("merge_speakers." + name)} </label>
                </div>
                <div className="col-md-5">
                    <div onClick={this.handleClick.bind(this, name, 0)} className={this.getFieldClass(name, 0) + ' form-control field'}>
                        {values[0]}
                    </div>
                </div>
                <div className="col-md-5">
                    <div onClick={this.props.onClick.bind(this, name, 1)} className={this.getFieldClass(name, 1) + ' form-control field'}>
                        {values[1]}
                    </div>
                </div>
            </div>
        );

    }
}

