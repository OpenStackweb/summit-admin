/**
 * Copyright 2022 OpenStack Foundation
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

import React, {useEffect, useState, useMemo} from 'react'
import {connect} from 'react-redux';
import T from "i18n-react";
import {Pie} from "react-chartjs-2";
import {Chart} from 'chart.js';
import {trim} from "../../utils/methods";
import {Breadcrumb} from "react-breadcrumbs";
import DateIntervalFilter from "../../components/filters/date-interval-filter";
import {getRegistrationStats} from "../../actions/summit-stats-actions";

const DATA_POOLING_INTERVAL = 4000;


const RegistrationStatsPage = ({currentSummit, summitStats, match, getRegistrationStats}) => {
    const [chartLoaded, setChartLoaded] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const getSuitableY = (y, yArray = [], direction) => {
        let result = y;
        yArray.forEach((existedY) => {
            if (existedY - 14 < result && existedY + 14 > result) {
                if (direction === "right") {
                    result = existedY + 14;
                } else {
                    result = existedY - 14;
                }
            }
        });
        return result;
    };

    const getOriginPoints = (source, center, l) => {
        let a = {x: 0, y: 0};
        let dx = (center.x - source.x) / l
        let dy = (center.y - source.y) / l
        a.x = center.x + l * dx
        a.y = center.y + l * dy
        return a
    };

    const ChartJSOutSideLabelsPlugin = {
        id: 'chartJSOutSideLabelsPlugin',
        afterDraw(chart, args, options) {

            const ctx = chart.ctx;
            ctx.save();
            ctx.font = "10px 'Averta Std CY'";
            const leftLabelCoordinates = [];
            const rightLabelCoordinates = [];
            const chartCenterPoint = {
                x:
                    (chart.chartArea.right - chart.chartArea.left) / 2 +
                    chart.chartArea.left,
                y:
                    (chart.chartArea.bottom - chart.chartArea.top) / 2 +
                    chart.chartArea.top
            };

            chart.config.data.labels.forEach((label, i) => {

                const meta = chart.getDatasetMeta(0);
                const arc = meta.data[i];

                const dataset = chart.config.data.datasets[0];
                let sum = chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);

                // Prepare data to draw
                // important point 1
                const centerPoint = arc.getCenterPoint();
                let color = chart.config._config.data.datasets[0].backgroundColor[i];
                let labelColor = chart.config._config.data.datasets[0].backgroundColor[i];

                const angle = Math.atan2(
                    centerPoint.y - chartCenterPoint.y,
                    centerPoint.x - chartCenterPoint.x
                );
                // important point 2, this point overlapsed with existed points
                // so we will reduce y by 14 if it's on the right
                // or add by 14 if it's on the left
                let originPoint = getOriginPoints(chartCenterPoint, centerPoint, arc.outerRadius)
                const point2X =
                    chartCenterPoint.x + Math.cos(angle) * (centerPoint.x < chartCenterPoint.x ? arc.outerRadius + 10 : arc.outerRadius + 10);
                let point2Y =
                    chartCenterPoint.y + Math.sin(angle) * (centerPoint.y < chartCenterPoint.y ? arc.outerRadius + 15 : arc.outerRadius + 15);

                let suitableY;
                if (point2X < chartCenterPoint.x) {
                    // on the left
                    suitableY = getSuitableY(point2Y, leftLabelCoordinates, "left");
                } else {
                    // on the right
                    suitableY = getSuitableY(point2Y, rightLabelCoordinates, "right");
                }

                point2Y = suitableY;

                let edgePointX = point2X < chartCenterPoint.x ? chartCenterPoint.x - arc.outerRadius - 10 : chartCenterPoint.x + arc.outerRadius + 10;

                if (point2X < chartCenterPoint.x) {
                    leftLabelCoordinates.push(point2Y);
                } else {
                    rightLabelCoordinates.push(point2Y);
                }

                //DRAW CODE
                // first line: connect between arc's center point and outside point
                ctx.lineWidth = 2;
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(originPoint.x, originPoint.y);
                ctx.lineTo(point2X, point2Y);
                ctx.stroke();
                // second line: connect between outside point and chart's edge
                ctx.beginPath();
                ctx.moveTo(point2X, point2Y);
                ctx.lineTo(edgePointX, point2Y);
                ctx.stroke();
                //fill custom label
                const labelAlignStyle = edgePointX < chartCenterPoint.x ? "right" : "left";
                const labelX = edgePointX < chartCenterPoint.x ? edgePointX : edgePointX + 0;
                const labelY = point2Y + 7;
                ctx.textAlign = labelAlignStyle;
                ctx.textBaseline = "bottom";
                ctx.font = "bold 16px Arial";
                ctx.fillStyle = labelColor;
                let value = dataset.data[i];
                if (options.hasOwnProperty('formatter')) {
                    value = options.formatter(value, {chart, dataset});
                }
                ctx.fillText(value, labelX, labelY);
            });
            ctx.restore();
        }
    };

    useEffect(() => {
        //Chart.register(ChartDataLabels);
        //Chart.register(ChartJSPluginLegendSize);
        Chart.register(ChartJSOutSideLabelsPlugin);
        setChartLoaded(true);
    }, []);

    useEffect(() => {
        // initial load
        getRegistrationStats(fromDate, toDate);

        // pooling
        const interval = setInterval(() => {
            getRegistrationStats(fromDate, toDate, false);
        }, DATA_POOLING_INTERVAL);

        return () => clearInterval(interval);
    }, [fromDate, toDate]);

    const chartOptions = {
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 80,
                left: 80,
                right: 80,
                bottom: 80
            }
        },
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return context.label || '';
                    }
                }
            },
            legend: {
                display: true,
                position: 'bottom',
                maxWidth: 100,
                align: 'start',
            },
            chartJSOutSideLabelsPlugin: {
                formatter: (value, ctx) => {
                    let datasets = ctx.chart.data.datasets;
                    if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
                        let sum = datasets[0].data.reduce((a, b) => a + b, 0);
                        if (!sum) return '0%';
                        return ((value / sum) * 100).toFixed(2)+ '%';
                    }
                    return '';
                },
            }
        }
    };

    const dataTickets = useMemo(() => (
        {
            labels: [
                `Actives : ${summitStats.total_active_tickets}`,
                `Inactives : ${summitStats.total_inactive_tickets}`,
            ],
            datasets: [
                {
                    label: '# of Tickets',
                    data: [
                        summitStats.total_active_tickets,
                        summitStats.total_inactive_tickets
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderColor: "#fff",
                    borderWidth: 1,
                },
            ],
        }
    ), [summitStats.total_active_tickets, summitStats.total_inactive_tickets]);

    const dataTicketTypesBackgroundColor = useMemo(() => summitStats.total_tickets_per_type.map(tt => {
        let r = Math.floor(Math.random() * 200);
        let g = Math.floor(Math.random() * 200);
        let b = Math.floor(Math.random() * 200);
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }), [summitStats.total_tickets_per_type?.length]);

    const dataTicketTypes = useMemo(() => ({
        labels: summitStats.total_tickets_per_type.map(tt => `${trim(tt.type, 75)} : ${parseInt(tt.qty)}`),
        datasets: [
            {
                label: 'Ticket Types',
                data: summitStats.total_tickets_per_type.map(tt => parseInt(tt.qty)),
                backgroundColor: dataTicketTypesBackgroundColor,
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    }), [summitStats.total_tickets_per_type]);

    const totalTicketTypes = summitStats.total_tickets_per_type.reduce(function (accumulator, currentValue) {
        return accumulator + parseInt(currentValue.qty);
    }, 0);

    const dataBadgeTypesBackgroundColor = useMemo(() => summitStats.total_badges_per_type.map(tt => {
        let r = Math.floor(Math.random() * 200);
        let g = Math.floor(Math.random() * 200);
        let b = Math.floor(Math.random() * 200);
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }), [summitStats.total_badges_per_type?.length]);

    const dataBadgeTypes = useMemo(() => ({
        labels: summitStats.total_badges_per_type.map(tt => `${trim(tt.type, 75)} : ${parseInt(tt.qty)}`),
        datasets: [
            {
                label: 'Badge Types',
                data: summitStats.total_badges_per_type.map(tt => parseInt(tt.qty)),
                backgroundColor: dataBadgeTypesBackgroundColor,
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    }), [summitStats.total_badges_per_type]);

    const totalBadgeTypes = summitStats.total_badges_per_type.reduce(function (accumulator, currentValue) {
        return accumulator + parseInt(currentValue.qty);
    }, 0);

    const dataTicketsPerBadgeFeaturesBackgroundColor = useMemo(() =>
        summitStats.total_tickets_per_badge_feature.map(tt => {
            let r = Math.floor(Math.random() * 200);
            let g = Math.floor(Math.random() * 200);
            let b = Math.floor(Math.random() * 200);
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }), [summitStats.total_tickets_per_badge_feature?.length]);

    const dataTicketsPerBadgeFeatures = useMemo(() => ({
        labels: summitStats.total_tickets_per_badge_feature.map(tt => `${tt.type} : ${parseInt(tt.tickets_qty)}`),
        datasets: [
            {
                label: 'Badge Features1',
                data: summitStats.total_tickets_per_badge_feature.map(tt => parseInt(tt.tickets_qty)),
                backgroundColor: dataTicketsPerBadgeFeaturesBackgroundColor,
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    }), [summitStats.total_tickets_per_badge_feature]);

    const dataCheckinsPerBadgeFeaturesBackgroundColor = useMemo(() =>
        summitStats.total_tickets_per_badge_feature.map(tt => {
            let r = Math.floor(Math.random() * 200);
            let g = Math.floor(Math.random() * 200);
            let b = Math.floor(Math.random() * 200);
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }), [summitStats.total_tickets_per_badge_feature?.length]);

    const dataCheckinsPerBadgeFeatures = useMemo(() => ({
        labels: summitStats.total_tickets_per_badge_feature.map(tt => `${tt.type} : ${parseInt(tt.checkin_qty)}`),
        datasets: [
            {
                label: 'Badge Features1',
                data: summitStats.total_tickets_per_badge_feature.map(tt => parseInt(tt.checkin_qty)),
                backgroundColor: dataCheckinsPerBadgeFeaturesBackgroundColor,
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    }), [summitStats.total_tickets_per_badge_feature]);

    const dataAttendees = {
        labels: [`Checked In : ${summitStats.total_checked_in_attendees}`,
            `Non Checked In: ${summitStats.total_non_checked_in_attendees}`,
        ],
        datasets: [
            {
                label: 'In Person Attendees',
                data: [
                    summitStats.total_checked_in_attendees,
                    summitStats.total_non_checked_in_attendees,
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    };

    const dataVirtualAttendees = {
        labels: [
            `Virtual Check In ${summitStats.total_virtual_attendees}`,
            `Non Virtual Checked In: ${summitStats.total_virtual_non_checked_in_attendees}`,
        ],
        datasets: [
            {
                label: 'Virtual Attendees',
                data: [
                    summitStats.total_virtual_attendees,
                    summitStats.total_virtual_non_checked_in_attendees,
                ],
                backgroundColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    };

    if (!chartLoaded) return null;

    return (
        <div className="container">
            <Breadcrumb data={{title: T.translate("dashboard.registration_stats"), pathname: match.url}}/>
            <div className="filters">
                <DateIntervalFilter onFilter={(from, to) => {
                    setFromDate(from);
                    setToDate(to);
                    getRegistrationStats(from, to)
                }} timezone={currentSummit.time_zone_id}/>
            </div>
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <i className="fa fa-money"/>&nbsp;{T.translate("dashboard.payment_amount_collected")}&nbsp;
                        <strong>$&nbsp;{parseFloat(summitStats.total_payment_amount_collected).toFixed(2)}</strong>
                    </div>
                    <div className="col-md-6">
                        {T.translate("dashboard.refund_amount_emitted")}&nbsp;
                        <strong>$&nbsp;{parseFloat(summitStats.total_refund_amount_emitted).toFixed(2)}</strong>
                    </div>
                </div>
                {(summitStats.total_active_tickets + summitStats.total_inactive_tickets) > 0 &&
                <>
                    <h5><i
                        className="fa fa-ticket"/>&nbsp;{T.translate("dashboard.total_tickets")} ({summitStats.total_active_tickets + summitStats.total_inactive_tickets})
                        / {T.translate("dashboard.orders")} ({summitStats.total_orders})</h5>
                    <div className="row">
                        <div className="col-md-12">
                            <Pie data={dataTickets}
                                 width={625}
                                 height={625}
                                 options={chartOptions}
                            />
                        </div>
                    </div>
                </>
                }
                {totalTicketTypes > 0 &&
                <div className="row">
                    <div className="col-md-6">
                        <h5>{T.translate("dashboard.ticket_types")} ({totalTicketTypes})</h5>
                        <div className="row">
                            <div className="col-md-12">
                                <Pie data={dataTicketTypes}
                                     width={625}
                                     height={625}
                                     options={chartOptions}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <h5>{T.translate("dashboard.badge_types")} ({totalBadgeTypes})</h5>
                        <div className="row">
                            <div className="col-md-12">
                                <Pie data={dataBadgeTypes}
                                     width={625}
                                     height={625}
                                     options={chartOptions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                }
                {summitStats.total_tickets_per_badge_feature.some(t => t.tickets_qty > 0) &&
                <div className="row">
                    <div className="col-md-12">
                        <h5>{T.translate("dashboard.badge_features_tickets")}</h5>
                        <div className="row">
                            <div className="col-md-12">
                                <Pie data={dataTicketsPerBadgeFeatures}
                                     width={625}
                                     height={625}
                                     options={chartOptions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                }
                {summitStats.total_tickets_per_badge_feature.some(t => t.checkin_qty > 0) &&
                <div className="row">
                    <div className="col-md-12">
                        <h5>{T.translate("dashboard.badge_features_checkins")}</h5>
                        <div className="row">
                            <div className="col-md-12">
                                <Pie data={dataCheckinsPerBadgeFeatures}
                                     width={625}
                                     height={625}
                                     options={chartOptions}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                }
                {(summitStats.total_checked_in_attendees +
                    summitStats.total_non_checked_in_attendees +
                    summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees) > 0 &&
                <>
                    <div className="row">
                        <div className="col-md-6">
                            <h5>
                                <i className="fa fa-users"/>
                                &nbsp;
                                {T.translate("dashboard.in_person_attendees")} ({summitStats.total_checked_in_attendees + summitStats.total_non_checked_in_attendees})
                            </h5>
                        </div>
                        <div className="col-md-6">
                            <h5>
                                <i className="fa fa-users"/>
                                &nbsp;
                                {T.translate("dashboard.virtual_attendees")} ({summitStats.total_virtual_attendees + summitStats.total_virtual_non_checked_in_attendees})
                            </h5>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Pie data={dataAttendees}
                                 width={625}
                                 height={625}
                                 options={chartOptions}
                            />
                        </div>
                        <div className="col-md-6">
                            <Pie data={dataVirtualAttendees}
                                 width={625}
                                 height={625}
                                 options={chartOptions}
                            />
                        </div>
                    </div>
                </>
                }
            </div>
        </div>
    );
}

const mapStateToProps = ({currentSummitState, summitStatsState}) => ({
    currentSummit: currentSummitState.currentSummit,
    summitStats: summitStatsState
})

export default connect(
    mapStateToProps,
    {getRegistrationStats}
)(RegistrationStatsPage);
