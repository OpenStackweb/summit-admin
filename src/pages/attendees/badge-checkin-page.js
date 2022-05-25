/**
 * Copyright 2018 OpenStack Foundation
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

import React, {useState} from 'react'
import { connect } from 'react-redux';
import { Breadcrumb } from 'react-breadcrumbs';
import T from "i18n-react/dist/i18n-react";
import { checkInBadge } from "../../actions/badge-actions";
import QrReader from "react-qr-reader";
import Swal from "sweetalert2";
import {qrReaderContainer} from '../../styles/badge-checkin-page.module.less';
import {validateBadgeQR} from "../../utils/methods";

const BadgeCheckinPage = ({match, currentSummit, checkInBadge}) => {
    const [scanning, setScanning] = useState(false);

    const handleCheckIn = (data) => {
        if (data && !scanning) {
            setScanning(true);

            const qrValid = validateBadgeQR(data, currentSummit);

            if (qrValid) {
                checkInBadge(data)
                    .then(() => {
                        Swal.fire(T.translate("badge_checkin.checked_in"), `${qrValid[3]} (${qrValid[2]}) checked in!`, "success");
                    })
                    .finally(() => {
                        setScanning(false);
                    })
            } else {
                Swal.fire(T.translate("badge_checkin.wrong_qr_title"), T.translate("badge_checkin.wrong_qr_text"), "warning");
                setScanning(false);
            }
        }
    }

    const handleError = () => {
        Swal.fire({
            title: "Error",
            text: "cannot read QR code, please try again",
            type: "warning",
        });
    }

    return(
        <div className="container">
            <Breadcrumb data={{ title: T.translate("badge_checkin.checkin"), pathname: match.url }} />
            <h3>Scan badge to check in:</h3>
            <hr/>
            <div className={qrReaderContainer}>
                <QrReader
                    delay={2000}
                    onError={handleError}
                    onScan={handleCheckIn}
                    style={{ width: '100%' }}
                />
            </div>

        </div>
    )
}

const mapStateToProps = ({ currentSummitState }) => ({
    currentSummit   : currentSummitState.currentSummit,
})

export default connect (mapStateToProps, { checkInBadge })(BadgeCheckinPage);
