/**
 * Copyright 2019 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react'
import Select from 'react-select'

const BadgeFeatureFilter = ({features, value, onChange, ...rest}) => {
  
    const handleFilterChange = (value) => {
        let theValue = rest.isMulti ? value.map(v => v.value) : value.value;
        onChange(theValue);
    }
    
    let theValue = null;
    const options = features?.map(t => ({value: t.id, label: t.name})) || [];
    
    if (value) {
        theValue = rest.isMulti ? options.filter(op => value.includes(op.value)) : options.find(op => op.value === value);
    }
    
    return (
      <div className="feature-filter">
          <label>Filter by Badge Feature</label>
          <Select
            value={theValue}
            id="badge-feature-filter"
            options={options}
            onChange={handleFilterChange}
            {...rest}
          />
      </div>
    );
}

export default BadgeFeatureFilter;