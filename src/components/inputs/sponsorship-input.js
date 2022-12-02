/**
 * Copyright 2020 OpenStack Foundation
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

 import React from 'react';
 import AsyncSelect from 'react-select/lib/Async';
 import { querySponsorships } from '../../actions/sponsorship-actions';

 export default class SponsorshipTypeInput extends React.Component {

     constructor(props) {
         super(props);

         this.handleChange = this.handleChange.bind(this);
         this.getTemplates = this.getTemplates.bind(this);
     }

     handleChange(value, { action }) {
         const { plainValue } = this.props;
         let theValue = null;

         if (action === 'clear') {
             theValue = plainValue ? '' : { id: '', name: '' };
         } else {
             theValue = plainValue ? value.label : { id: parseInt(value.value), name: value.label };
         }

         const ev = {
             target: {
                 id: this.props.id,
                 value: theValue,
                 type: 'sponsorshipinput'
             }
         };

         this.props.onChange(ev);
     }

     getTemplates(input, callback) {         

         if (!input) {
             return Promise.resolve({ options: [] });
         }

         // we need to map into value/label because of a bug in react-select 2
         // https://github.com/JedWatson/react-select/issues/2998

         const translateOptions = (options) => {
             const newOptions = options.map(c => ({ value: c.id.toString(), label: c.name }));
             console.log('new options...', newOptions);
             callback(newOptions);
         };

         querySponsorships(input, translateOptions);
     }

     render() {
         const { error, value, onChange, id, multi, plainValue, ...rest } = this.props;
         const has_error = (this.props.hasOwnProperty('error') && error !== '');

         // we need to map into value/label because of a bug in react-select 2
         // https://github.com/JedWatson/react-select/issues/2998
         let theValue = null;

         if (value) {
             theValue = plainValue ? { value: value, label: value } : { value: value.id?.toString(), label: value.name }
         }

         return (
             <div>
                 <AsyncSelect
                     value={theValue}
                     onChange={this.handleChange}
                     loadOptions={this.getTemplates}                    
                     isMulti={false}
                     {...rest}
                 />
                 {has_error &&
                     <p className="error-label">{error}</p>
                 }
             </div>
         );

     }
 }