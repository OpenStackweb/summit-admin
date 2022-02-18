import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";


const TrackGroupDropdown = ({id, value, onChange, trackGroups, ...rest}) => {
    const options = trackGroups.map(t => ({label: t.name, value: t.id}));

    return (
        <Dropdown
            id={id}
            value={value}
            onChange={onChange}
            options={options}
            {...rest}
        />
    );
};

export default TrackGroupDropdown;