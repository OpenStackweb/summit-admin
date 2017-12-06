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
import './upload.css';

export default class UploadInput extends React.Component {
    constructor(props) {
        super(props);
    }

    onImageDrop(files) {
        this.props.handleUpload(files[0]);
    }

    render() {
        let {value, handleRemove} = this.props;

        return (
            <div className="file-upload">
                <Dropzone
                    onDrop={this.onImageDrop.bind(this)}
                    className="dropzone col-md-6"
                    multiple={true}
                    accept="image/*">
                    <div>Drop images or click to select files to upload.</div>
                </Dropzone>
                <div className="selected-files-box col-md-6">
                    <p>Selected Files</p>
                    <div className="selected-files">
                        {value && value.map(f => (
                            <div className="file-box">
                                <img src={f.url} />
                                <p>{f.name}</p>
                                <i className="fa fa-times" onClick={handleRemove(f.id)}></i>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}