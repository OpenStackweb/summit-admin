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
import T from "i18n-react/dist/i18n-react";

class FreeTextSearch extends React.Component {

    constructor(props){
        super(props);
        this.onSearchClick  = this.onSearchClick.bind(this);
        this.onClearClick   = this.onClearClick.bind(this);
        this.onKeyPressed   = this.onKeyPressed.bind(this);
        this.onChange       = this.onChange.bind(this);

        this.state = {
            value: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        let value = nextProps.value ? nextProps.value : '';

        if( nextProps.hasOwnProperty('value') && this.state.value != value ) {
            this.setState({
                value: value
            });
        }
    }

    onSearchClick(){
        this.doFiltering(this.state.value);
    }

    onClearClick(){
        this.doFiltering('');
    }

    doFiltering(term){
        this.props.onSearch(term.trim());
    }

    onKeyPressed(event){
        var code = event.keyCode || event.which;
        if(code === 13) {
            this.doFiltering(this.state.value);
        }
    }

    onChange(event){
        this.setState({
            value: event.target.value
        });
    }

    render(){
        let {value} = this.state;

        return(
            <div className="row search-container">
                <div className="col-md-12">
                    <div className="input-group">
                        <input type="text"
                               value={value}
                               className="form-control"
                               placeholder={this.props.placeholder}
                               onKeyPress={this.onKeyPressed}
                               onChange={this.onChange}
                        />
                        <span className="input-group-btn" style={{width: 5 +'%'}}>
                            <button onClick={this.onSearchClick} className="btn btn-default" title={T.translate("general.search")}>
                                <i className="fa fa-search"></i>
                            </button>
                            <button onClick={this.onClearClick} className="btn btn-default" title={T.translate("general.clear")}>
                                <i className="fa fa-times"></i>
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}

export default FreeTextSearch;