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
import { connect } from 'react-redux';
import Dropdown from './dropdown';
import {getCountryList} from '../../actions/base-actions';

class CountryDropdown extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentWillMount () {
        let {countries} = this.props;

        if(countries.length == 0){
            this.props.getCountryList();
        }
    }

    render() {

        let options = this.props.countries.map(c => ({label: c.name, value: c.alpha2Code}));

        return (
            <Dropdown options={options} {...this.props} />
        );

    }
}

const mapStateToProps = ({ baseState }) => ({
    countries : baseState.countries
})

export default connect (
    mapStateToProps,
    {
        getCountryList
    }
)(CountryDropdown);