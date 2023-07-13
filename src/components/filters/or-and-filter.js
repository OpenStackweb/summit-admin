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
import T from 'i18n-react/dist/i18n-react';
import { ALL_FILTER, OR_FILTER } from '../../utils/constants';

const OrAndFilter = ({ entity, value, onChange, ...rest}) => {    

    const changeFilter = () => {
        onChange(value === ALL_FILTER ? OR_FILTER : ALL_FILTER);
    }

    const fitlerStyle = {
        cursor: 'pointer',
        textDecoration: 'underline'
    }
    
    return (
      <div className="and-or-filter" {...rest}>
          <label>{T.translate("and_or_filter.search", {entity: entity})}
            <span style={fitlerStyle} onClick={() => changeFilter()}>
                {value === ALL_FILTER ? T.translate("and_or_filter.all") : T.translate("and_or_filter.any")}</span> 
            {T.translate("and_or_filter.following")}</label>
      </div>
    );
}

export default OrAndFilter;