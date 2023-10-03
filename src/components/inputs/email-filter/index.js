import React, { useState } from 'react'
import T from 'i18n-react/dist/i18n-react';
import Select from 'react-select'
import {Input} from "openstack-uicore-foundation/lib/components";
import styles from './index.module.less';
const Index = ({ onChange, id, operatorInitialValue, filterInitialValue }) => {

    const operatorOptions = [
        { label: T.translate("email_filter.operator_contains"), value: 'owner_email=@' },
        { label: T.translate("email_filter.operator_not_contains"), value: 'not_owner_email=@' },
        { label:T.translate("email_filter.operator_equal"), value: 'owner_email==' },
    ];

    const [operatorValue, setOperatorValue] = useState(operatorInitialValue ? operatorOptions.find(o => o.value === operatorInitialValue) : null);
    const [filterValue, setFilterValue] = useState(filterInitialValue? filterInitialValue : '');

    const onChangeOperator = (newOperatorValue) => {
        setOperatorValue(newOperatorValue);
        if(!newOperatorValue) setFilterValue('');

        let ev = {
            target: {
                id: id,
                value: filterValue,
                type: 'email_filter',
                operator: newOperatorValue ? newOperatorValue.value: null,
            }
        };
        onChange(ev);
    }

    const onChangeValue= (ev) => {
        let {value} = ev.target;
        setFilterValue(value);
        let e = {
            target: {
                id: id,
                value: value,
                type: 'email_filter',
                operator: operatorValue ? operatorValue?.value: null,
            }
        };
        onChange(e);
    }

    return (
        <div className={`${styles.filter_container} row`} id={id}>
            <div className="col-md-5">
                <Select
                    id="email_filter_operator"
                    value={operatorValue}
                    placeholder={T.translate("email_filter.placeholders.operator")}
                    options={operatorOptions}
                    onChange={onChangeOperator}
                    isClearable={true}
                />
            </div>
            <div className="col-md-7">
                <Input
                    id='email_filter_value'
                    value={filterValue}
                    placeholder={T.translate("email_filter.placeholders.value")}
                    onChange={onChangeValue}
                />
            </div>
        </div>
    );
}

export default Index;