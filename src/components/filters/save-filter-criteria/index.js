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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react/dist/i18n-react';
import { Input, RadioList } from 'openstack-uicore-foundation/lib/components';
import { hasErrors } from "../../../utils/methods";

import styles from './index.module.less'
import { VISIBILITY_OPTION_EVERYONE, VISIBILITY_OPTION_ME } from '../../../utils/filter-criteria-constants';

const SaveFilterCriteria = ({ onSave, selectedFilterCriteria }) => {

    const [customName, setCustomName] = useState('');
    const [visibility, setVisibility] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (selectedFilterCriteria?.name) setCustomName(selectedFilterCriteria.name);
        if (selectedFilterCriteria?.visibility) setVisibility(selectedFilterCriteria.visibility);
        if (!selectedFilterCriteria) {
            setCustomName('');
            setVisibility(null);
        }
    }, [selectedFilterCriteria])

    const visibility_options = [
        { value: VISIBILITY_OPTION_ME, label: T.translate("save_filter_criteria.me") },
        { value: VISIBILITY_OPTION_EVERYONE, label: T.translate("save_filter_criteria.everyone") }
    ]

    const handleSaveFilter = () => {
        if (!customName) {
            setErrors({ filter_name: 'Enter a name to save the filter' });
            return
        }
        if (!visibility) {
            setErrors({ visibility: 'Select an option' });
            return
        }
        const filterToSave = { id: selectedFilterCriteria?.id, name: customName, visibility: visibility };
        onSave(filterToSave);
        setCustomName('');
        setVisibility(null);
        setErrors({})
    }

    return (
        <div className={`${styles.saveFilterWrapper} row`}>
            <div className={`${styles.saveAs} col-xs-4`}>
                {T.translate("save_filter_criteria.save_as")}
                <Input
                    id={'filter_name'}
                    value={customName}
                    placeholder={T.translate("save_filter_criteria.placeholders.custom_name")}
                    onChange={(ev) => setCustomName(ev.target.value)}
                    error={hasErrors('filter_name', errors)}
                />
            </div>
            <div className={`${styles.visibleTo} col-xs-4`}>
                {T.translate("save_filter_criteria.visible_to")}
                <RadioList
                    id='visibility'
                    value={visibility}
                    options={visibility_options}
                    onChange={(ev) => setVisibility(ev.target.value)}
                    error={hasErrors('visibility', errors)}
                    inline
                />
            </div>
            <div className={`${styles.button} col-xs-2`}>
                <button className='btn btn-default' onClick={() => handleSaveFilter()}>
                    {T.translate("save_filter_criteria.save")}
                </button>
            </div>
        </div>
    );
}

SaveFilterCriteria.propTypes = {
    onSave: PropTypes.func.isRequired,
    selectedFilterCriteria: PropTypes.object,
}

export default SaveFilterCriteria;
