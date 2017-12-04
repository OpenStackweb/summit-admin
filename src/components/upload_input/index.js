import React from 'react';
import Dropzone from 'react-dropzone';

export default class UploadInput extends React.Component {
    constructor(props) {
        super(props);
    }

    onImageDrop(files) {
        this.props.handleUpload(files[0]);
    }

    render() {
        return (
            <div className="FileUpload">
                <Dropzone
                    onDrop={this.onImageDrop.bind(this)}
                    multiple={true}
                    accept="image/*">
                    <div>Drop images or click to select files to upload.</div>
                </Dropzone>
            </div>
        )
    }
}