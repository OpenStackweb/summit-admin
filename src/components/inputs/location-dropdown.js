import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";

const LocationDropdown = ({id, value, onChange, locations, ...rest}) => {
    const options = locations.map(r => ({label: r.name, value: r.id}) );
    const theValue = rest.isMulti ? value.map(parseInt) : value;

    return (
        <Dropdown
            id={id}
            value={theValue}
            options={options}
            onChange={onChange}
            {...rest}
        />
    );
};

export default LocationDropdown;