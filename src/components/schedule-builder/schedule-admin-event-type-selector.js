import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminEventTypeSelector extends React.Component {

    constructor(props){
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(selectedOption){
        this.props.onEventTypeChanged(selectedOption ? selectedOption.value : null);
    }

    render(){
        let { eventTypes, currentValue } = this.props;
        return (
            <Select
                placeholder={T.translate("placeholders.select_event_type")}
                className="event-type-selector"
                name="form-field-name"
                value={currentValue}
                onChange={this.onChange}
                options={eventTypes}
            />
        )
    }
}

export default ScheduleAdminEventTypeSelector;