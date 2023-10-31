/**
 * Copyright 2019 OpenStack Foundation
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

import React, { useEffect, useState } from 'react'
import T from 'i18n-react/dist/i18n-react';
import MediaUploadTypeInput from '../../inputs/media-upload-type-input';
import Select from 'react-select'

import styles from './index.module.less'

const MediaTypeFilter = ({ onChange, operatorInitialValue, filterInitialValue, id, summitId }) => {

    const operatorOptions = [
        { label: T.translate("media_upload_type_filter.has_media_upload"), value: 'has_media_upload_with_type==' },
        { label: T.translate("media_upload_type_filter.has_not_media_upload"), value: 'has_not_media_upload_with_type==' }
    ];

    const [operatorValue, setOperatorValue] = useState(operatorInitialValue ? operatorOptions.find(o => o.value === operatorInitialValue) : null);
    const [filterValue, setFilterValue] = useState(filterInitialValue ? filterInitialValue : null);

    const onChangeOperator = (newOperatorValue) => {
        setOperatorValue(newOperatorValue);
        let ev = {
            target: {
                id: id,
                value: filterValue,
                type: 'mediatypeinput',
                operator: newOperatorValue.value
            }
        };
        onChange(ev);
    }

    const onChangeFilterValue = (newFilterValue) => {
        const { value } = newFilterValue.target;
        setFilterValue(value);
        let ev = {
            target: {
                id: id,
                value: value,
                type: 'mediatypeinput',
                operator: operatorValue.value
            }
        };
        onChange(ev);
    }

    return (
        <div className={`${styles.mediaTypeFilterWrapper} row`} id={id}>
            <div className="col-xs-3">
                {T.translate("media_upload_type_filter.media_type")}
            </div>
            <div className="col-xs-3">
                <Select
                    id={`${id}_operator`}
                    value={operatorValue}
                    placeholder={T.translate("media_upload_type_filter.placeholders.operator")}
                    options={operatorOptions}
                    onChange={onChangeOperator}
                />
            </div>
            <div className="col-xs-6">
                <MediaUploadTypeInput
                    id={`${id}_value`}
                    value={filterValue}
                    placeholder={T.translate(`${operatorValue?.value ? `media_upload_type_filter.placeholders.${operatorValue.value}` : ''}`)}
                    summitId={summitId}
                    onChange={onChangeFilterValue}
                />
            </div>
        </div>
    );
}

export default MediaTypeFilter;
