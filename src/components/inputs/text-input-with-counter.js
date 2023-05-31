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
import PropTypes from 'prop-types';
import { Input } from 'openstack-uicore-foundation/lib/components'

const TextInputWithCounter = ({ className, maxLength, id, value, onChange, ...rest }) => {

  return (
    <>
      <Input
        className={className}
        maxLength={maxLength}
        id={id}
        value={value}
        onChange={onChange}
        {...rest}
      />
      <span className='character-counter'>{`${value?.length}/${maxLength}`}</span>
    </>
  );
}

TextInputWithCounter.propTypes = {
    className: PropTypes.string,
    maxLength: PropTypes.number.isRequired,
    id: PropTypes.string,
    onChange: PropTypes.func.isRequired
}

export default TextInputWithCounter;
