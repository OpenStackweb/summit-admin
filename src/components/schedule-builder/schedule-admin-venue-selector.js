import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminVenueSelector extends React.Component {

    constructor(props){
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    renderOption(option) {
        let location = option.value;
        if (location.class_name == 'SummitVenue')
            return (<span className="location-option-venue">{location.name}</span>);
        return (<span className="location-option-room">-&nbsp;{location.name}</span>);
    }

    onChange(selectedOption){
        this.props.onVenueChanged(selectedOption ? selectedOption.value : null);
    }

    render(){
        let { venues, currentValue } = this.props;
        return (
            <Select
                placeholder={T.translate("placeholders.select_venue")}
                className="venues-selector"
                name="form-field-name"
                value={currentValue}
                onChange={this.onChange}
                options={venues}
                optionRenderer={this.renderOption}
            />
        )
    }
}

export default ScheduleAdminVenueSelector;