/**
 * Copyright 2017 OpenStack Foundation
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
import T from 'i18n-react/dist/i18n-react';
import MenuItem from './menu-item';

export default class SubMenuItem extends React.Component {


    render() {
        let {name, iconClass, show, subMenuOpen, onClick, onItemClick, childs} = this.props;

        if(!show) return null;

        return (
            <div>
                <a id={name + '-menu'} className="menu-item" onClick={onClick} >
                    <i className={iconClass + ' fa'} />
                    {T.translate('menu.' + name)}
                </a>
                {subMenuOpen === name &&
                <div className="submenu">
                    {childs.map(ch =>
                        <MenuItem
                            key={ch.name}
                            {...ch}
                            show={true}
                            iconClass="fa-chevron-right"
                            onClick={(e) => onItemClick(e, ch.linkUrl)}
                        />
                    )}
                </div>
                }
            </div>
        );

    }
}

