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
import 'react-select/dist/react-select.css';
import './summit-dropdown.less';
import Select from 'react-select';
import T from 'i18n-react/dist/i18n-react';

export default class SummitDropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            summitValue: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleChange(summit) {
        this.setState({summitValue: summit});
    }

    handleClick(ev) {
        ev.preventDefault();
        this.props.onClick(this.state.summitValue.value);
    }

    render() {

        let {summits, actionLabel, ...rest} = this.props;
        let summitOptions = summits
            .sort(
                (a, b) => (a.start_date < b.start_date ? 1 : (a.start_date > b.start_date ? -1 : 0))
            ).map(s => ({label: s.name, value: s.id}));

        let smallDdl = this.props.hasOwnProperty('small') ? 'small' : '';
        let smallBtn = this.props.hasOwnProperty('small') ? 'btn-group-sm' : 'normal';

        return (
            <div className={"summit-dropdown btn-group " + smallBtn}>
                <Select
                    id="summit-select"
                    value={this.state.summitValue}
                    onChange={this.handleChange}
                    options={summitOptions}
                    placeholder={T.translate("general.select_summit")}
                    className={"btn-group summit-select text-left" + smallDdl}
                    clearable={false}
                />
                <button type="button" className="btn btn-default" onClick={this.handleClick}>
                    {actionLabel}
                </button>
            </div>
        );

    }
}