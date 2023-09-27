/**
 * Copyright 2018 OpenStack Foundation
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
import T from 'i18n-react/dist/i18n-react'
import 'awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'
import { Input } from 'openstack-uicore-foundation/lib/components';
import { isEmpty, shallowEqual } from "../../utils/methods";
import CreatableSelect from 'react-select/lib/Creatable';

const SponsorSocialNetworkForm = ({ entity, errors, onSubmit }) => {

    const [stateEntity, setStateEntity] = useState({});
    const [theValue, setTheValue] = useState(null);
    const [iconsDDL, setIconsDDL] = useState([
        { label: 'Facebook', value: 'fa-facebook' },
        { label: 'Twitter', value: 'fa-twitter' },
        { label: 'Youtube', value: 'fa-youtube' },
        { label: 'Linkedin', value: 'fa-linkedin' },
    ]);

    useEffect(() => {
        const customIcon = entity.icon_css_class && !iconsDDL.some(e => e.value === entity.icon_css_class);
        if (customIcon) {
            setIconsDDL([...iconsDDL, { label: entity.icon_css_class, value: entity.icon_css_class }]);
        }
        if (!entity.icon_css_class) {
            setIconsDDL([
                { label: 'Facebook', value: 'fa-facebook' },
                { label: 'Twitter', value: 'fa-twitter' },
                { label: 'Youtube', value: 'fa-youtube' },
                { label: 'Linkedin', value: 'fa-linkedin' },
            ]);
        }
        const ddl_value = (entity.icon_css_class instanceof Object || entity.icon_css_class == null) ? entity.icon_css_class : iconsDDL.find(opt => opt.value == entity.icon_css_class);
        setTheValue(ddl_value);
        setStateEntity({ ...entity });
    }, [entity]);

    useEffect(() => {
        // Select the DDL value after create a new option
        const ddl_value = (stateEntity.icon_css_class instanceof Object || stateEntity.icon_css_class == null) ? stateEntity.icon_css_class : iconsDDL.find(opt => opt.value == stateEntity.icon_css_class);
        setTheValue(ddl_value);
    }, [iconsDDL, stateEntity.icon_css_class]);


    const handleSubmit = (ev) => {
        ev.preventDefault();
        onSubmit(stateEntity);
    }

    const handleChange = (ev) => {
        const newEntity = { ...stateEntity };
        let { value, id } = ev.target;

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.id === 'icon_css_class') {
            // we need to map into value/label because of a bug in react-select 2
            // https://github.com/JedWatson/react-select/issues/2998        
            value = { label: ev.target.label, value: ev.target.value };
        }

        newEntity[id] = value;
        setStateEntity(newEntity);
    }

    const handleNewSocialNetwork = (ev) => {
        const newEntity = { ...stateEntity };

        const newOption = { label: ev, value: ev }
        newEntity['icon_css_class'] = newOption.value;
        setIconsDDL([...iconsDDL, newOption]);
        setStateEntity(newEntity);
    }


    return (
        <form className="material-form">
            <input type="hidden" id="id" value={stateEntity.id} />
            <div className="sponsor-material-form form-group">
                <div className="row form-group">
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsor.link")} </label>
                        <Input className="form-control" id="link" value={stateEntity.link} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <label> {T.translate("edit_sponsor.icon_css_class")} </label>
                        <CreatableSelect isClearable id="icon_css_class" value={theValue}
                            onChange={(ev) => handleChange({ target: { ...ev, id: 'icon_css_class' } })} onCreateOption={handleNewSocialNetwork}
                            options={iconsDDL} />
                    </div>
                    <div className="col-md-4 checkboxes-div">
                        <div className="form-check abc-checkbox">
                            <input type="checkbox" id="is_enabled" checked={stateEntity.is_enabled}
                                onChange={handleChange} className="form-check-input" />
                            <label className="form-check-label" htmlFor="is_enabled">
                                {T.translate("edit_sponsor.is_enabled")}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12 submit-buttons">
                    <input type="button" onClick={handleSubmit}
                        className="btn btn-primary pull-right" value={T.translate("general.save")} />
                </div>
            </div>
        </form>
    );

}

export default SponsorSocialNetworkForm;
