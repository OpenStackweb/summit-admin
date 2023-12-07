import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";
import T from "i18n-react";


const InvitationStatusDropdown = ({id, value, onChange, ...rest}) => {
    const options =[
        {label: 'Pending', value: 'Pending'},
        {label: 'Accepted', value: 'Accepted'},
        {label: 'Rejected', value: 'Rejected'}
    ];

    return (
        <Dropdown
            id={id}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={T.translate("general.placeholders.select_invitation_status")}
            {...rest}
        />
    );
};

export default InvitationStatusDropdown;