import React from 'react';
import {FILTER_TYPES} from '../../../actions/schedule-settings-actions';
import LevelDropdown from "../../inputs/level-dropdown";
import EventTypeDropdown from "../../inputs/event-type-dropdown";
import TrackDropdown from "../../inputs/track-dropdown";
import TrackGroupDropdown from "../../inputs/track-group-dropdown";
import {CompanyInput, SpeakerInput, TagInput} from "openstack-uicore-foundation/lib/components";
import LocationDropdown from "../../inputs/location-dropdown";
import T from "i18n-react";


const PreFilterInput = ({type, values, onChange, summit, disabled}) => {
    let input = null;

    switch (type) {
        case FILTER_TYPES.track: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.track")}</label>
                    <TrackDropdown id={type} value={values} onChange={onChange} tracks={summit.tracks} isMulti disabled={disabled} />
                </>
            );
            break;
        }
        case FILTER_TYPES.track_groups: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.track_groups")}</label>
                    <TrackGroupDropdown id={type} value={values} onChange={onChange} trackGroups={summit.track_groups} isMulti disabled={disabled} />
                </>
            );
            break;
        }
        case FILTER_TYPES.venues: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.locations")}</label>
                    <LocationDropdown id={type} value={values} onChange={onChange} locations={summit.locations} isMulti disabled={disabled} />
                </>
            );
            break;
        }
        case FILTER_TYPES.level: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.levels")}</label>
                    <LevelDropdown id={type} value={values} onChange={onChange} isMulti disabled={disabled} />
                </>
            );
            break;
        }
        case FILTER_TYPES.event_types: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.event_types")}</label>
                    <EventTypeDropdown id={type} value={values} onChange={onChange} eventTypes={summit.event_types} isMulti disabled={disabled} />
                </>
            );
            break;
        }
        case FILTER_TYPES.tags: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.tags")}</label>
                    <TagInput id={type} value={values} summitId={summit.id} onChange={onChange} isDisabled={disabled} />
                </>
            );
            break;
        }
        case FILTER_TYPES.company: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.companies")}</label>
                    <CompanyInput
                        id={type}
                        value={values}
                        onChange={onChange}
                        summitId={summit.id}
                        multi
                        isDisabled={disabled}
                    />
                </>
            );
            break;
        }
        case FILTER_TYPES.speakers: {
            input = (
                <>
                    <label>{T.translate("edit_schedule_settings.speakers")}</label>
                    <SpeakerInput
                        id={type}
                        value={values}
                        onChange={onChange}
                        summitId={summit.id}
                        isDisabled={disabled}
                    />
                </>
            );
            break;
        }
    }


    return input;
}

export default PreFilterInput;