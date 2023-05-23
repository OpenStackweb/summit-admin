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

const OrderQuestionFilter = ({questions, value, onChange, ...rest}) => {
  
    const handleFilterChange = (value) => {
        let theValue = rest.isMulti ? value.map(v => v.value) : value.value;
        onChange(theValue);
    }
    
    let theValue = null;
    const options = questions.reduce((result, q) => {
      if (q.values) {
        const quesAns = q.values.map(ans => {
          return ({label: `${q.label_text}: ${ans.label}`, value: `${q.id}:${ans.id}`})
        })
        return [...result, ...quesAns];
      } else { // free form
        const quesAns = [
          ({label: `${q.label_text}: empty`, value: `${q.id}:empty`}),
          ({label: `${q.label_text}: not empty`, value: `${q.id}:notempty`})
        ];
        return [...result, ...quesAns];
      }
      
    }, [])
    
    if (value) {
        theValue = rest.isMulti ? options.filter(op => value.includes(op.value)) : options.find(op => op.value === value);
    }
    
    return (
      <div className="order-question-filter">
          <label>Filter by Question</label>
          <Select
            value={theValue}
            id="order-question-filter"
            options={options}
            onChange={handleFilterChange}
            {...rest}
          />
      </div>
    );
}

export default OrderQuestionFilter;