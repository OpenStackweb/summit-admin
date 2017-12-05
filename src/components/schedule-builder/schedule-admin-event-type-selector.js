import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminEventTypeSelector extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            selectedOption: props.currentValue
        }
        this.onChange = this.onChange.bind(this);
    }

    onChange(selectedOption){
        this.setState({ ...this.state, selectedOption: selectedOption});
        this.props.onEventTypeChanged(selectedOption ? selectedOption.value : null);
    }

    render(){
        let { eventTypes } = this.props;
        return (
            <Select
                placeholder={T.translate("placeholders.select_event_type")}
                className="event-type-selector"
                name="form-field-name"
                value={this.state.selectedOption}
                onChange={this.onChange}
                options={eventTypes}
            />
        )
    }
}

export default ScheduleAdminEventTypeSelector;