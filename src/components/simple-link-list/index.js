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

import React from 'react';
import 'react-select/dist/react-select.css';
import './simple-link-list.less';
import Select from 'react-select';
import Table from "../table/Table";
import T from 'i18n-react/dist/i18n-react';


export default class SimpleLinkList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.filterOptions = this.filterOptions.bind(this);
        this.getOptions = this.getOptions.bind(this);
        this.handleLink = this.handleLink.bind(this);

    }

    filterOptions(options, filterString, values) {
        return options.filter( op => {
            return this.props.values.map(val => val.id).indexOf( op.id ) < 0;
        } );
    }

    getOptions(input) {
        if (!input) {
            return Promise.resolve({ options: [] });
        }

        return this.props.queryOptions(input);
    }

    handleChange(value) {
        this.setState({value});
    }

    handleLink(ev) {
        ev.preventDefault();
        this.props.onLink(this.state.value);
    }

    render() {

        let {title, values, columns, valueKey, labelKey, onEdit, onUnLink} = this.props;

        let options = {
            className: "dataTable",
            actions: {
                edit: {onClick: onEdit},
                delete: { onClick: onUnLink }
            }
        }

        return (
            <div className="row simple-link-list">
                <div className="col-md-4 simple-link-list-title">
                    <h4>{title}</h4>
                </div>
                <div className="col-md pull-right btn-group">
                    <Select.Async
                        className="link-select btn-group text-left"
                        value={this.state.value}
                        valueKey={valueKey}
                        labelKey={labelKey}
                        onChange={this.handleChange}
                        loadOptions={this.getOptions}
                        filterOptions={this.filterOptions}
                    />
                    <button type="button" className="btn btn-default" onClick={this.handleLink}>
                        {T.translate("general.add")}
                    </button>
                </div>
                <div className="col-md-12">
                    <Table
                        className="dataTable"
                        options={options}
                        data={values}
                        columns={columns}
                    />
                </div>
            </div>
        );

    }
}

