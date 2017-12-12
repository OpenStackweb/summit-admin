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
//import TinyMCEInput from 'react-tinymce-input'
import TinyMCE from 'react-tinymce';

export default class TextEditor extends React.Component {

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {

        let ev = {target: {
            id: this.props.id,
            value: e.target.getContent(),
            type: 'texteditor'
        }};

        this.props.onChange(ev);
    }

    render() {

        let {onChange, value, ...rest} = this.props;

        return (
            <TinyMCE
                config={{ height: 200, plugins: 'image table' }}
                content={value}
                onChange={this.handleChange}
            />
        );

    }
}