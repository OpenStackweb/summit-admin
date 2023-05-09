import React from "react";
import Select, {createFilter} from "react-select";

const RoomLabel = ({room}) => (<span>{room.name} <i style={{color: 'gray', fontSize: '0.8em'}}>- {room.id}</i></span>);

const LocationGroupedDropdown = ({value, locations, className, placeholder, ...rest}) => {
  let options = [];
  let theValue = null;
  
  const filterOptions = (candidate, input) => {
    if (input) {
      return candidate.label.props.room?.name.toLowerCase().includes(input.toLowerCase());
    }
    return true;
  };
  
  locations.forEach(loc => {
    const roomsWithoutFloors = loc.rooms?.filter(rm => rm.floor_id === 0) || [];
    
    options.push({label:<i><b>All {loc.name} locations</b></i>, value: loc.id});
    options = options.concat(roomsWithoutFloors.map(rm => ({label: <RoomLabel room={rm} />, value: rm.id})));
    
    loc.floors?.forEach(fl => {
      const floorRooms = loc.rooms.filter(rm => rm.floor_id === fl.id);
      options.push({
        label: fl.name,
        options: floorRooms.map(rm => ({label: <RoomLabel room={rm} />, value: rm.id}))
      });
    })
  });
  
  options.forEach(op => {
    if (op.value === value) {
      theValue = op;
      return;
    }
    if (op.options) {
      const foundOption = op.options.find(opp => opp.value === value)
      if (foundOption) {
        theValue = foundOption;
        return;
      }
    }
  });
  
  return (
    <Select
      options={options}
      value={theValue}
      placeholder={placeholder}
      filterOption={filterOptions}
      styles={{
        group: (baseStyles) => ({
          ...baseStyles,
          borderTop: '1px solid lightgray'
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          zIndex: 2000
        })
      }}
      {...rest}
    />
  
  );
};

export default LocationGroupedDropdown;