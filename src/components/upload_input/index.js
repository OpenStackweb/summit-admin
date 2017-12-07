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
import Dropzone from 'react-dropzone';
import './upload.less';

export default class UploadInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            show_veil: false
        }
    }

    onImageDrop(files) {
        this.props.handleUpload(files[0]);
    }

    showVeil() {
        this.setState({show_veil:true});
    }

    hideVeil() {
        this.setState({show_veil:false});
    }

    render() {
        let {value, handleRemove, handleUpload, ...rest} = this.props;

        return (
            <div className="file-upload">
                <Dropzone
                    onDrop={this.onImageDrop.bind(this)}
                    {...rest}
                >
                    <div>Drop images or click to select files to upload.</div>
                </Dropzone>
                <div className="selected-files-box col-md-6">
                    <p>Selected Files</p>
                    <div className="selected-files">
                        {value &&
                        <div className="file-box" onMouseEnter={this.showVeil.bind(this)} onMouseLeave={this.hideVeil.bind(this)}>
                            <img src={value} />
                            <a href={value} target="_blank">link</a>
                            {this.state.show_veil &&
                            <div className="veil">
                                <p onClick={handleRemove}>Remove</p>
                            </div>
                            }
                        </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}