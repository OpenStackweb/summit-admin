import React from "react";
import {Dropdown, GroupedDropdown} from "openstack-uicore-foundation/lib/components";

const LocationDropdown = ({id, value, onChange, locations, ...rest}) => {
    const options = locations.map(r => ({label: r.name, value: r.id}) );

    return (
        <Dropdown
            id={id}
            value={value}
            options={options}
            onChange={onChange}
            {...rest}
        />
    );
};

export default LocationDropdown;