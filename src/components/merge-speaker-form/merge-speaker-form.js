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

import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import SelectableMergeRow from './selectable-merge-row'
import MergeableMergeRow from './mergeable-merge-row'


class MergeSpeakerForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    drawSelectableRow(name, mapFunction) {
        let {selectedFields, speakers} = this.props;
        let disabled = false;

        let values = speakers.map(s => {
            if (s === null) {
                disabled = true;
                return null;
            }

            if (mapFunction) return mapFunction(s);
            return s[name];
        })

        return (
            <SelectableMergeRow
                name={name}
                selected={selectedFields[name]}
                values={values}
                onClick={this.handleClick}
                disabled={disabled}
            />
        );
    }

    drawMergeableRow(name, mapFunction) {
        let {speakers} = this.props;
        let disabled = false;

        let values = speakers.map(s => {
            if (s === null) {
                disabled = true;
                return null;
            }
            if (mapFunction) return mapFunction(s);
            return s[name];
        })

        return (
            <MergeableMergeRow
                name={name}
                values={values}
                disabled={disabled}
            />
        );
    }

    handleClick(field, column)  {
        this.props.onSelect(field, column);
    }

    handlePresentationLink(event_id, ev) {
        let {currentSummit} = this.props;
        ev.preventDefault();
        let event_detail_url = currentSummit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');
        window.open(event_detail_url, '_blank');
    }

    render() {
        let {speakers} = this.props;

        return (
            <div className="merge-speaker-form col-md-12">
                { speakers[0] && <input type="hidden" id="0_id" value={speakers[0].id} /> }
                { speakers[1] && <input type="hidden" id="1_id" value={speakers[1].id} /> }
                {this.drawSelectableRow('title', null)}
                {this.drawSelectableRow('first_name', null)}
                {this.drawSelectableRow('last_name', null)}
                {this.drawSelectableRow('reg_email', null)}
                {this.drawMergeableRow('presentations',
                    speaker => {
                        return speaker.all_presentations.map(p => {
                            return (
                                <div key={p.id + '_pres'}>
                                    Summit {p.summit_id}:
                                    <a href="" onClick={this.handlePresentationLink.bind(this, p.id)} >{p.title}</a>
                                </div>
                            );
                        })
                    }
                )}
                {this.drawSelectableRow('twitter', null)}
                {this.drawSelectableRow('irc', null)}
                {this.drawSelectableRow('bio', null)}
                {this.drawSelectableRow('pic',
                    speaker => {
                        return (<img src={speaker.pic} />);
                    }
                )}
                {this.drawSelectableRow('expertise',
                    speaker => {
                        return 'expertise missing';
                    }
                )}

                {this.drawSelectableRow('travel',
                    speaker => {
                        return 'travel missing';
                    }
                )}
                {this.drawSelectableRow('languages',
                    speaker => {
                        return 'languages missing';
                    }
                )}
                {this.drawMergeableRow('promo_codes',
                    speaker => {
                        return 'registration missing';
                    }
                )}
                {this.drawMergeableRow('attendance',
                    speaker => {
                        return 'attendance missing';
                    }
                )}
                {this.drawMergeableRow('org_roles',
                    speaker => {
                        return 'org roles missing';
                    }
                )}
                {this.drawMergeableRow('involvements',
                    speaker => {
                        return 'involvements missing';
                    }
                )}


            </div>
        );
    }
}

export default MergeSpeakerForm;