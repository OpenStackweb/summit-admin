import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";


const LevelDropdown = ({id, value, onChange, ...rest}) => {
    const options =['N/A', 'Beginner', 'Intermediate', 'Advanced' ];
    const levels_ddl = options.map(l => ({label: l, value: l}));

    return (
        <Dropdown
            id={id}
            value={value}
            onChange={onChange}
            options={levels_ddl}
            {...rest}
        />
    );
};

export default LevelDropdown;