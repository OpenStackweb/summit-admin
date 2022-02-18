import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";


const EventTypeDropdown = ({id, value, onChange, eventTypes, ...rest}) => {
    const options = eventTypes.map(et => ({value: et.id, label: et.name}));

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

export default EventTypeDropdown;