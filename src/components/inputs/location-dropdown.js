import React from "react";
import {Dropdown, GroupedDropdown} from "openstack-uicore-foundation/lib/components";

const LocationDropdown = ({id, value, onChange, locations, ...rest}) => {
    const options = locations.map(r => ({label: r.name, value: r.id}) );

    return (
        <Dropdown
            id={id}
            value={value.map( v => parseInt(v))}
            options={options}
            onChange={onChange}
            {...rest}
        />
    );
};

export default LocationDropdown;