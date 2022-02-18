import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";


const TrackDropdown = ({id, value, onChange, tracks, ...rest}) => {
    const options = tracks.map(t => ({label: t.name, value: t.id}));

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

export default TrackDropdown;