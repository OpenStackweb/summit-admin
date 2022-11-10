import React, { useState } from 'react';
import AsyncSelect from 'react-select/lib/Async';
import './index.less';
/**
 *
 * @param id
 * @param CSSClass
 * @param fetchOptions
 * @param getOptionValue
 * @param getOptionLabel
 * @param onAdd
 * @param rest
 * @returns {JSX.Element}
 * @constructor
 */
const Many2ManyDropDown = ({id, CSSClass= 'col-md-6',fetchOptions, getOptionValue = (e) => e.id, getOptionLabel= (e) => e.name, onAdd = () => {},  ...rest}) => {

    const [value, setValue] = useState(null);
    const [disabledAdd, setDisabledAdd] = useState(true)

    const handleChange = (newValue) => {
       setValue(newValue);
       setDisabledAdd(!newValue);
    }

    const handleLink = (ev) =>{
        ev.preventDefault();
        onAdd(value);
        setValue(null);
        setDisabledAdd(true)
    }

    return (<div className={`${CSSClass} many-2-many-ddl-container`}>
        <AsyncSelect
            className={'many-2-many-ddl'}
            value={value}
            onChange={handleChange}
            loadOptions={fetchOptions}
            getOptionValue={m => getOptionValue(m)}
            getOptionLabel={m => getOptionLabel(m)}
            {...rest}
        />
        <button type="button" className="btn btn-default add-button many-2-many-ddl-button" onClick={handleLink} disabled={disabledAdd}>
            Link
        </button>
    </div>)
};

export default Many2ManyDropDown;