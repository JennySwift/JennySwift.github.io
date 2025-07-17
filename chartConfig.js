function getAnnotationZones(borderWidth) {
    return {
        lowZone: {
            type: "box",
            yMin: 0,
            yMax: 4,
            backgroundColor: "rgba(255, 0, 0, 0.6)",
            borderWidth,
            borderColor: "rgba(0,0,0,0.4)",
        },
        inRangeZone: {
            type: "box",
            yMin: 4,
            yMax: 8,
            backgroundColor: "rgba(0, 255, 0, 0.5)",
            borderWidth,
            borderColor: "rgba(0,0,0,0.4)",
        },
        highYellowZone: {
            type: "box",
            yMin: 8,
            yMax: 10,
            backgroundColor: "rgba(0, 255, 0, 0.4)",
            borderWidth,
            borderColor: "rgba(0,0,0,0.4)",
        },
        veryHighZone: {
            type: "box",
            yMin: 10,
            yMax: 20,
            backgroundColor: "rgba(255, 0, 0, 0.6)",
            borderWidth,
            borderColor: "rgba(0,0,0,0.4)",
        },
        dynamicLine: {
            type: "line",
            scaleID: "x",
            borderColor: "blue",
            borderWidth: 2,
            display: ctx => ctx.chart.options.plugins.annotation.annotations.dynamicLine.value !== null,
            label: { display: false },
        },
    };
}

function getChartTooltip() {
    return {
        callbacks: {
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
            },
        },
        titleFont: { size: 18 },
        bodyFont: { size: 18 },
        footerFont: { size: 14 },
        padding: 14,
        usePointStyle: true,
        labelPointStyle: {
            pointStyle: "circle",
            rotation: 0,
        },
        displayColors: false,
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
                data: [], // we'll set this in updateFoodChartForDate
                backgroundColor: "green",
                borderColor: "green",
                pointRadius: 8,
                pointStyle: "rectRot",
                showLine: false,
                parsing: false // allow full control over tooltip contents
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
                        source: "auto", // Let Chart.js choose nice intervals (usually hourly)
                        autoSkip: false
                      },
                      grid: {
                        display: true,
                        color: "#ccc",
                        lineWidth: 1,
                        drawTicks: true,
                        drawBorder: true,
                      }

                },
                y: {
                    title: { display: true, text: "Net Carbs (g)" },
                    ticks: {
                        stepSize: 10
                    },
                    grid: {
                        display: true,        // ✅ enables horizontal lines
                        color: "#888",
                        lineWidth: 1.5,
                        drawTicks: true,
                        drawBorder: true,
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
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
                },
                legend: { display: false },
                annotation: {
                  annotations: {
                    backgroundZone: {
                      type: "box",
                      xMin: null, // entire x-range
                      xMax: null,
                      yMin: 0,
                      yMax: 100,
                        backgroundColor: "rgba(255, 0, 0, 0.4)"
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
    let borderWidth = 2;
    
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
                        source: "auto", // Let Chart.js choose nice intervals (usually hourly)
                        autoSkip: false
                      },
                    grid: {
                      display: true,
                      color: "#ccc",
                      lineWidth: 1,
                      drawTicks: true,
                      drawBorder: true,
                    },
                    //                    ticks: {
                    //                        autoSkip: true,
                    //                        maxTicksLimit: 48,
                    //                        maxRotation: 0,
                    //                        minRotation: 0,
                    //                    },
                    //                    grid: {
                    //                        display: true,
                    //                        drawTicks: true,
                    //                        color: "#ccc",
                    //                        lineWidth: 1.2,
                    //                    },
                    title: { display: true, text: "Time" }
                },
                y: {
                    min: 2,
                    max: 12,
                    title: { display: true, text: "mmol/L" },
                    grid: {
                        display: true,
                        color: "#888",
                        lineWidth: 1.5,
                        drawTicks: true,
                        drawBorder: true,
                    },
                }
            },
            plugins: {
                tooltip: getChartTooltip(),
                legend: { display: true },
                annotation: {
                    annotations: getAnnotationZones(borderWidth),
                },
            },
            interaction: {
                mode: "nearest",
                intersect: false,
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
