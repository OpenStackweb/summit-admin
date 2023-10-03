/**
 * Copyright 2023 OpenStack Foundation
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

import React from "react";
import AsyncSelect from 'react-select/lib/Async';
import {queryMediaUploads} from "../../actions/media-upload-actions";
import T from 'i18n-react/dist/i18n-react';

const MediaUploadTypeInput = ({ summitId, id, value, onChange, ...rest }) => {
    
    const handleChange = (ev) => {
        if (onChange) onChange({target: {value: ev, type: 'media_upload_type_filter', id}});  
    }
    
    const getOptionValue = (mediaUploadType) => {
        return mediaUploadType.id;
    }

    const getOptionLabel = (mediaUploadType) => {
        return `${mediaUploadType.name}`;
    }

    const getTemplates = (input, callback) => {
        // we need to map into value/label because of a bug in react-select 2
        // https://github.com/JedWatson/react-select/issues/2998

        const translateOptions = (options) => {
            const newOptions = options.map(c => ({ id: c.id, name: c.name, value: c.id, label: c.name }));
            callback(newOptions);
        };

        queryMediaUploads(summitId, input, translateOptions);
    }

    return (
        <AsyncSelect
            value={value}
            onChange={handleChange}
            loadOptions={getTemplates}
            getOptionValue={m => getOptionValue(m)}
            getOptionLabel={m => getOptionLabel(m)}    
            isMulti={true}
            cacheOptions
            defaultOptions
            {...rest}
        />
    );
};

export default MediaUploadTypeInput;