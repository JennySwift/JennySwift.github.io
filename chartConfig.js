
// === Global Chart Styling Properties ===
const chartProps = {
    lineWidth: 2,
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
    label: context => {
        const point = context.raw;
        return [
            `🍽 ${point.foodName}`,
            `🔥 ${point.calories} cal`,
            `🍌 ${point.netCarbs}g net carbs`,
            `🥑 ${point.fat}g fat`
        ];
    }
}

const tooltipCallbacks = {
    title: (context) => context[0].label,
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
                pointStyle: "rectRot",
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
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createBGChart(ctx) {
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
            },
            interaction: {
                mode: "index",
                intersect: false,
                axis: "x",
            },
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
