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

    handlePresentationLink(summitId, event_id, ev) {
        let {allSummits} = this.props;
        let summit = allSummits.find(s => s.id == summitId);

        let event_detail_url = summit.schedule_event_detail_url.replace(':event_id',event_id).replace(':event_title','');

        ev.preventDefault();
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
                {this.drawSelectableRow('twitter', null)}
                {this.drawSelectableRow('irc', null)}
                {this.drawSelectableRow('bio', null)}
                {this.drawSelectableRow('pic',
                    speaker => {
                        return (<img src={speaker.pic} />);
                    }
                )}
                {this.drawMergeableRow('presentations',
                    speaker => {
                        let groupedPres = [];

                        for (var i in speaker.all_presentations) {
                            let pres = speaker.all_presentations[i];
                            if (!groupedPres.hasOwnProperty(pres.summit_id))
                                groupedPres[pres.summit_id] = [];

                            groupedPres[pres.summit_id].push(pres);
                        }

                        return groupedPres.map((pres,summitId) => {
                            return (
                                <div key={summitId + '_pres'}>
                                    <strong>Summit {summitId}:</strong><br/>
                                    {pres.map(p =>
                                        <div key={p.id + '_pres'}>
                                            -
                                            <a href="" onClick={this.handlePresentationLink.bind(this, summitId, p.id)} >
                                                {p.title}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                )}
                {this.drawMergeableRow('areas_of_expertise',
                    speaker => {
                        return speaker.areas_of_expertise.map(e => e.expertise).join(', ');
                    }
                )}
                {this.drawMergeableRow('other_presentation_links',
                    speaker => {
                        return speaker.other_presentation_links.map(p => {
                            return (
                                <div key={p.id + '_otherpres'}>
                                    <a href={p.link}>{p.title || p.link}</a>
                                </div>
                            );
                        })
                    }
                )}
                {this.drawMergeableRow('travel_preferences',
                    speaker => {
                        return speaker.travel_preferences.map(t => t.country).join(', ');
                    }
                )}
                {this.drawMergeableRow('languages',
                    speaker => {
                        return speaker.languages.map(l => l.language).join(', ');
                    }
                )}
                {this.drawMergeableRow('registration_codes',
                    speaker => {
                        return speaker.registration_codes.map(c => {
                            return (
                                <div key={c.id + '_pcode'}>
                                    <strong>Summit {c.summit_id}:</strong> {c.code} {c.redeemed ? '- redeemed' : ''}
                                </div>
                            );
                        })
                    }
                )}
                {this.drawMergeableRow('summit_assistances',
                    speaker => {
                        return speaker.summit_assistances.map(a => {
                            return (
                                <div key={a.id + '_assist'}>
                                    <strong>Summit {a.summit_id}:</strong> <br/>
                                    Ph: {a.on_site_phone} {a.registered ? '- Registered' : ''} {a.is_confirmed ? '- Confirmed' : ''}
                                </div>
                            );
                        })
                    }
                )}
                {this.drawMergeableRow('organizational_roles',
                    speaker => {
                        return speaker.organizational_roles.map(r => r.role).join(', ');
                    }
                )}
                {this.drawMergeableRow('active_involvements',
                    speaker => {
                        return speaker.active_involvements.map(i => i.id).join(', ');
                    }
                )}


            </div>
        );
    }
}

export default MergeSpeakerForm;