/**
 * Copyright 2021 OpenStack Foundation
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

import React, { Component } from "react";
import Switch from "react-switch";
import styles from '../../styles/edit-label-slider.module.less';

class EditNameInput extends Component {

    constructor(props) {
        super(props);

        this.state = {
            editing: false,
            value: props.value,
        }
        this.handleChange = this.handleChange.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onEdit = this.onEdit.bind(this);
    }

    handleChange(ev){
        let {value, id} = ev.target;
        this.setState({...this.state, value: value});
    }

    onEdit(ev){
        ev.preventDefault();
        this.setState({...this.state, editing: true});
    }

    onSave(ev){
        ev.preventDefault();
        this.setState({...this.state, editing: false});
        // send event
        this.props.onSave(this.state.value);
    }

    onCancel(ev){
        ev.preventDefault();
        this.setState({...this.state, editing: false});
    }

    render(){
        let { editing, value} = this.state;
        let { id } = this.props;
        return (
            <>
            {
                !editing &&
                <a className={styles.action_link} href="#" onClick={this.onEdit}>Edit Name</a>
            }
            {
                editing &&
                <span>
                    <input className={styles.input_text} type="text" id={id} name={id} value={value} onChange={this.handleChange}/>
                    <a className={styles.action_link} href="#" onClick={this.onSave}>Save</a>
                    <a className={styles.action_link} href="#" onClick={this.onCancel}>Cancel</a>
                </span>
            }
            </>
        );
    }
}

export default class EditLabelSlider extends Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onSave = this.onSave.bind(this);
    }

    handleChange(checked) {
        this.props.onStatusChanged(this.props.id, checked);
    }

    onSave(value){
        this.props.onValueChanged(this.props.id, value);
    }

    render() {
        let {value, id, checked} = this.props;
        return (
                <label htmlFor="material-switch" className={styles.editLabelSlider}>
                    <Switch
                        checked={checked}
                        onChange={this.handleChange}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        className="react-switch"
                        id={id}
                    />
                    <span className={styles.label}>{value}</span>
                    <EditNameInput value={value} id={id} onSave={this.onSave}/>
                </label>
        )
    }
}