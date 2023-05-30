import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";


const TrackDropdown = ({id, value, onChange, tracks, ...rest}) => {
    const options = tracks.map(t => ({label: t.name, value: t.id}));
    const theValue = rest.isMulti ? value.map(parseInt) : value;
    
    return (
        <Dropdown
            id={id}
            value={theValue}
            onChange={onChange}
            options={options}
            {...rest}
        />
    );
};

export default TrackDropdown;