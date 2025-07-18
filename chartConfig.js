
// === Global Chart Styling Properties ===
const chartProps = {
    lineWidth: 1,
    pointRadius: 8,
    pointHoverRadius: 12,
    dynamicLineColor: "rgba(100, 100, 100, 0.8)",
    annotationBorderColor: "rgba(0, 0, 0, 0.4)",
    inRangeColor: "rgba(0, 255, 0, 0.5)",
    highYellowColor: "rgba(0, 255, 0, 0.4)",
    lowColor: "rgba(255, 0, 0, 0.6)",
    veryHighColor: "rgba(255, 0, 0, 0.6)",
    foodLogColor: "green",
    xGridColor: "#ccc",
    yGridColor: "#888",
    backgroundZoneColor: "rgba(255, 0, 0, 0.4)"
};

const sharedTooltipStyle = {
    titleFont: { size: 18 },
    bodyFont: { size: 18 },
    footerFont: { size: 14 },
    padding: 14,
    usePointStyle: true,
    labelPointStyle: {
        pointStyle: "circle",
        rotation: 0,
    },
    displayColors: false
};

const foodChartTooltipCallbacks = {
    title: (context) => {
        const timestamp = context[0].parsed.x;
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).toLowerCase();
    },
    label: (context) => {
        const point = context.raw;
        return [
            `🍽 ${point.foodName}`,
            `🔥 ${point.calories} cal`,
            `🍌 ${point.netCarbs}g net carbs`,
            `🥑 ${point.fat}g fat`
        ];
    }
};

const tooltipCallbacks = {
    //This is the heading in the tooltip
    title: (context) => {
        const timestamp = context[0].parsed.x;
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).toLowerCase();
    },
    label: (context) => {
        const dataset = context.dataset;
        const point = context.raw;
        
        if (point?.type === "note") {
            const text = point?.text ?? "(no text)";
            return `📝 ${text}`;
        }
        
        if (point?.type === "foodLog") {
            return [
                `🍽 ${point.foodName}`,
                `🔥 ${point.calories} cal`,
                `🍌 ${point.netCarbs}g net carbs`,
                `🥑 ${point.fat}g fat`
            ];
        }
        
        if (point?.type === "bolus") {
            return `💉 ${point.y.toFixed(2)}U bolus`;
        }
//        if (point?.type === "bolus") {
//            return `💉 ${point.amount.toFixed(2)}U bolus`;
//        }
        
        
        // Default for BG readings
        const mmol = context.parsed.y;
        const mgdl = Math.round(mmol * 18);
        return [
            `🩸 ${mmol.toFixed(1)} mmol/L`,
            `🩸 ${mgdl} mg/dL`
        ];
    }
};


function getDynamicLineAnnotation() {
    return {
        type: "line",
        scaleID: "x",
        borderColor: chartProps.dynamicLineColor,
        borderWidth: chartProps.lineWidth,
        display: ctx => ctx.chart.options.plugins.annotation.annotations.dynamicLine.value !== null,
        label: { display: false },
    };
}

function getAnnotationZones() {
    return {
        lowZone: {
            type: "box",
            yMin: 0,
            yMax: 4,
            backgroundColor: chartProps.lowColor,
            borderWidth: chartProps.lineWidth,
            borderColor: chartProps.annotationBorderColor,
        },
        inRangeZone: {
            type: "box",
            yMin: 4,
            yMax: 8,
            backgroundColor: chartProps.inRangeColor,
            borderWidth: chartProps.lineWidth,
            borderColor: chartProps.annotationBorderColor,
        },
        highYellowZone: {
            type: "box",
            yMin: 8,
            yMax: 10,
            backgroundColor: chartProps.highYellowColor,
            borderWidth: chartProps.lineWidth,
            borderColor: chartProps.annotationBorderColor,
        },
        veryHighZone: {
            type: "box",
            yMin: 10,
            yMax: 20,
            backgroundColor: chartProps.veryHighColor,
            borderWidth: chartProps.lineWidth,
            borderColor: chartProps.annotationBorderColor,
        },
        dynamicLine: getDynamicLineAnnotation(),
    };
}



function getChartData() {
    return {
        datasets: [{
            label: "BG (mmol/L)",
            data: [],
            borderColor: "black",
            backgroundColor: "rgba(255, 99, 132, 0.1)",
            tension: 0.3,
            fill: false,
            borderWidth: 2.5,
            pointRadius: 0,
        }],
    };
}
function createFoodChart(ctx) {
    return new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Food Log",
                data: [],
                backgroundColor: chartProps.foodLogColor,
                borderColor: chartProps.foodLogColor,
                pointRadius: chartProps.pointRadius,
                pointHoverRadius: chartProps.pointHoverRadius,
                pointStyle: "circle",
                pointRadius: 6,
                pointHoverRadius: 10,
                backgroundColor: "#ffa726",     // orange fill
                borderColor: "#ef6c00",         // darker orange border
                borderWidth: 2,
                showLine: false,
                parsing: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "hour",
                        displayFormats: { hour: "h:mm a" }
                    },
                    title: { display: true, text: "Time" },
                    min: new Date().setHours(0, 0, 0, 0),
                    max: new Date().setHours(24, 0, 0, 0),
                    ticks: {
                        source: "auto",
                        autoSkip: false
                    },
                    grid: {
                        display: true,
                        color: chartProps.xGridColor,
                        lineWidth: chartProps.lineWidth,
                        drawTicks: true,
                        drawBorder: true,
                    }
                },
                y: {
                    title: { display: true, text: "Net Carbs (g)" },
                    ticks: { stepSize: 10 },
                    grid: {
                        display: true,
                        color: chartProps.yGridColor,
                        lineWidth: chartProps.lineWidth,
                        drawTicks: true,
                        drawBorder: true,
                    }
                }
            },
            plugins: {
                tooltip: {
                    ...sharedTooltipStyle,
                    callbacks: foodChartTooltipCallbacks
                },
                legend: { display: false },
                annotation: {
                    annotations: {
                        dynamicLine: getDynamicLineAnnotation(),
                        backgroundZone: {
                            type: "box",
                            xMin: null,
                            xMax: null,
                            yMin: 0,
                            yMax: 100,
                            backgroundColor: chartProps.backgroundZoneColor
                        }
                    }
                },
                datalabels: {
                        display: false
                    }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createBasalChart(ctx) {
    return new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                label: "Basal Rate (U/hr)",
                data: [], // will be populated in updateChartForDate
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                borderWidth: 2,
                stepped: "before", // 👈 this makes it a step line
                pointRadius: 0,
                fill: false
                
            }]
        },
        options: {
            interaction: {
              mode: "nearest",
              intersect: false
            },
            hover: {
              mode: "nearest",
              intersect: false
            },
            parsing: false,
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "hour",
                        tooltipFormat: "h:mm a"
                    },
                    ticks: {
                        maxTicksLimit: 12
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "U/hr"
                    }
                }
            },
            plugins: {
                datalabels: {
                        display: false
                    },

                legend: { display: false },
                tooltip: {
                    ...sharedTooltipStyle,
                    callbacks: {
                        label: function (context) {
                            const rate = context.parsed.y;
                            const start = context.raw.segmentStart ? new Date(context.raw.segmentStart) : null;
                            const end = context.raw.segmentEnd ? new Date(context.raw.segmentEnd) : null;

                            const formatTime = (d) => d.toLocaleTimeString([], {
                                hour: "numeric", minute: "2-digit", hour12: true
                            }).toLowerCase().replace(' ', '');

                            const startStr = start ? formatTime(start) : "unknown";
                            const endStr = end ? formatTime(end) : "ongoing";

                            return `⏱ ${startStr} to ${endStr}\n💧 ${rate.toFixed(2)} U/hr`;
                        }
                        
                    }
                }
                
                
                
               
            },
            responsive: true,
            //Needed for my CSS that sets the height to work
            maintainAspectRatio: false
        }
    });
}

function createBGChart(ctx) {
    Chart.register(ChartDataLabels);
    return new Chart(ctx, {
        type: "line",
        data: getChartData(),
        options: {
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "hour",
                        displayFormats: {
                            hour: "h:mm a"
                        }
                    },
                    ticks: {
                        source: "auto",
                        autoSkip: false
                    },
                    grid: {
                        display: true,
                        color: chartProps.xGridColor,
                        lineWidth: chartProps.lineWidth,
                        drawTicks: true,
                        drawBorder: true,
                    },
                    title: { display: true, text: "Time" }
                },
                y: {
                    min: 2,
                    max: 12,
                    title: { display: true, text: "mmol/L" },
                    grid: {
                        display: true,
                        color: chartProps.yGridColor,
                        lineWidth: chartProps.lineWidth,
                        drawTicks: true,
                        drawBorder: true,
                    },
                },
                //Create second y axis
                yBolus: {
                    position: "right",
                    title: { display: true, text: "Bolus (U)" },
                    grid: { display: false }, // optional: turn off bolus grid lines
                    min: 0,
                    max: 10, // adjust based on your typical max bolus
                }
            },
            plugins: {
                tooltip: {
                    ...sharedTooltipStyle,
                    callbacks: tooltipCallbacks
                },
                legend: { display: true },
                annotation: {
                    annotations: {
                        ...getAnnotationZones(chartProps.lineWidth),
                        dynamicLine: getDynamicLineAnnotation()
                    }
                },
                drawNoteIcons: drawNoteIconsPlugin,
            
                
                datalabels: {
                    display: (context) => context.dataset.label === "Bolus",
                    anchor: 'end',
                    align: 'top',
                    color: 'black',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, context) => value.amount?.toFixed(2).replace(/^0/, ""),  // Remove leading 0
//                    rotation: 90,
                    offset: (context) => {
                        const i = context.dataIndex;
                        return (i % 2 === 0) ? 10 : 30; // stagger labels vertically so they fit
                         
                    }
                }
                
            },
            //This is the most strict and precise configuration:
            //You must actually hover the point or bar.
            //Each dataset will show its tooltip independently.
            //No shared tooltips across x-axis.
            //Fixes your issue where hovering a bar shows a tooltip from 12:04 am, or mixes in notes/BG values.
            // Tooltip + Interaction Mode Guide:
            // ─────────────────────────────────────────────
            // interaction.mode options:
            //   "point"   → Only show tooltip when directly hovering a point/bar. (✔️ Precise)
            //   "nearest" → Show tooltip for nearest visible point even if not hovered directly.
            //   "index"   → Show tooltips for all datasets aligned at the same x position.
            //   "dataset" → Show tooltip for all points in the same dataset closest to cursor.
            //   "x"       → Tooltip for closest point with matching x (used with intersect: false).
            //   "y"       → Tooltip for closest point with matching y (used with intersect: false).
            //
            // interaction.intersect:
            //   true  → Tooltip only shows when cursor is directly over a point/bar.
            //   false → Tooltip shows when cursor is in the same x/y position, even if not over the point.
            //
            // Your current setup for precise tooltips:
            //   interaction: { mode: "point", intersect: true },
            //   hover: { mode: "point", intersect: true }
            //
            // Tip: For line charts, make sure `pointRadius` > 0 to allow hovering.
            interaction: {
                mode: "nearest",    // Show tooltip for closest point on the x-axis
                intersect: false,   // Don’t require the mouse to be *on* the point
              },
              hover: {
                mode: "nearest",
                intersect: false
              },
            
//            interaction: {
//                mode: "point",
//                intersect: true //true: must actually hover the point/bar. false: triggers tooltip even when you’re just aligned on the x or y axis (depending on mode).
//            },
//            hover: {
//                mode: "point",
//                intersect: true
//            },
            animation: {
                onComplete: () => {
                    updateAnnotationZonesFromYScale();
                    bgChart.update();
                }
            },
            resizeDelay: 0,
            onResize: () => {
                if (bgChart && bgChart.scales?.y) {
                    updateAnnotationZonesFromYScale();
                    bgChart.update();
                }
            },
        },
    });
}
