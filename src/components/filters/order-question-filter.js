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

import React, {useEffect, useState} from 'react'
import Select from 'react-select'
import T from "i18n-react";
import Switch from "react-switch";
import OrAndFilter from "./or-and-filter";
import {ALL_FILTER, OR_FILTER} from "../../utils/constants";

const OrderQuestionFilter = ({questions, value, onChange, ...rest}) => {
  const [theValue, setTheValue] = useState(null);
  const [allOrAny, setAllOrAny] = useState(ALL_FILTER);

  useEffect(() => {
    if (value) {
      const _theValue = rest.isMulti ? options.filter(op => value.includes(op.value)) : options.find(op => op.value === value);
      setTheValue(_theValue);
    }
    const _allOrAny = value?.includes(OR_FILTER) ? OR_FILTER : ALL_FILTER;
    setAllOrAny(_allOrAny);
  }, [value]);

  const handleFilterChange = (inputValue) => {
      const _theValue = rest.isMulti ? inputValue.map(v => v.value) : inputValue.value;
      onChange([..._theValue, allOrAny]);
  }

  const handleAllOrAnyChange = (inputValue) => {
    const valueArray = value.split(',');
    valueArray.pop();

    onChange([...valueArray, inputValue]);
  }

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

  }, []);

  return (
    <div className="order-question-filter">
      <OrAndFilter value={allOrAny} entity="questions" onChange={handleAllOrAnyChange}/>
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