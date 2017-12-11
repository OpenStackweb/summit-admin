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
import TinyMCE from 'tinymce-react'


export default class TextEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.value != nextProps.value) {
            this.setState({value: nextProps.value});
        }
    }

    handleChange(text) {
        if (!text) return;

        this.setState({
            value: text.getContent()
        });

        let ev = {target: {
            id: this.props.id,
            value: text.getContent(),
            type: 'texteditor'
        }};

        this.props.onChange(ev);
    }

    render() {

        let {onChange, value, ...rest} = this.props;

        return (
            <TinyMCE
                config={{ height: 200, plugins: 'image table' }}
                content={this.state.value}
                onContentChanged={this.handleChange}
            />
        );

    }
}