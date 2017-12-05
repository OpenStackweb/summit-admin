import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminVenueSelector extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            selectedOption: props.currentValue
        }
        this.onChange = this.onChange.bind(this);
    }

    renderOption(option) {
        let location = option.value;
        if (location.class_name == 'SummitVenue')
            return (<span className="location-option-venue">{location.name}</span>);
        return (<span className="location-option-room">-&nbsp;{location.name}</span>);
    }

    onChange(selectedOption){
        this.setState({ ...this.state, selectedOption: selectedOption});
        this.props.onVenueChanged(selectedOption ? selectedOption.value : null);
    }

    render(){
        let { venues } = this.props;
        return (
            <Select
                placeholder={T.translate("placeholders.select_track")}
                className="venues-selector"
                name="form-field-name"
                value={this.state.selectedOption}
                onChange={this.onChange}
                options={venues}
                optionRenderer={this.renderOption}
            />
        )
    }
}

export default ScheduleAdminVenueSelector;