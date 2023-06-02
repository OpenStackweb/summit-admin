import React from "react";
import {Dropdown} from "openstack-uicore-foundation/lib/components";
import T from "i18n-react";


const AcceptanceCriteriaDropdown = ({id, value, onChange, ...rest}) => {
    const options =[
        {label: 'Any Ticket Type', value: 'ANY_TICKET_TYPE'},
        {label: 'All Ticket Types', value: 'ALL_TICKET_TYPES'}
    ];

    return (
        <Dropdown
            id={id}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={T.translate("general.placeholders.select_acceptance_criteria")}
            {...rest}
        />
    );
};

export default AcceptanceCriteriaDropdown;