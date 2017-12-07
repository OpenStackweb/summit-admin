import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import T from "i18n-react/dist/i18n-react";

class ScheduleAdminTrackSelector extends React.Component {

    constructor(props) {
        super(props);
        this.onChange     = this.onChange.bind(this);
    }

    onChange(selectedOption){
        this.props.onTrackChanged(selectedOption ? selectedOption.value : null);
    }

    render() {
        let {tracks, currentValue} = this.props;
        return (
            <Select
                placeholder={T.translate("placeholders.select_track")}
                className="track-selector"
                name="form-field-name"
                value={currentValue}
                onChange={this.onChange}
                options={tracks}
            />);
    }
}

export default ScheduleAdminTrackSelector;