


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
            value: null,
            borderColor: "blue",
            borderWidth: 2,
            label: { display: false },
        },
    };
}



//function getChartOptions(borderWidth) {
//    return {
//        
////        scales: {
////            y: {
////                min: 2,
////                max: 12,
////                ticks: { stepSize: 1 },
////                grid: {
////                    display: true,
////                    color: "#888",
////                    lineWidth: 1.5,
////                    drawTicks: true,
////                    drawBorder: true,
////                },
////                title: { display: true, text: "mmol/L" },
////            },
////            x: {
////                type: "time",
////                time: {
////                        unit: "hour",
////                        displayFormats: {
////                            hour: "h:mm a",
////                            minute: "h:mm a"
////                        }
////                    },
////                ticks: {
////                    autoSkip: true,
////                    maxTicksLimit: 48,
////                    maxRotation: 0,
////                    minRotation: 0,
////                },
////                grid: {
////                    display: true,
////                    drawTicks: true,
////                    color: "#ccc",
////                    lineWidth: 1.2,
////                },
////                title: { display: true, text: "Time" },
////            },
////        },
//        plugins: {
//            tooltip: {
//                callbacks: {
//                    title: (context) => context[0].label,
//                    
//                    
//                    label: (context) => {
//                        const dataset = context.dataset;
//
//                        // Check if it's a note point
//                        if (dataset.label === "Notes") {
//                            const point = context.raw;
//                            const text = point?.text ?? "(no text)";
//                            return `📝 ${text}`;
//                            
//                            
//                        }
//
//                        // Default for BG readings
//                        const mmol = context.parsed.y;
//                        const mgdl = Math.round(mmol * 18);
//                        return [`🩸 ${mmol.toFixed(1)} mmol/L`, `🩸 ${mgdl} mg/dL`];
//                    },
//                    
//                    
//                    
////                    label: (context) => {
////                        const mmol = context.parsed.y;
////                        const mgdl = Math.round(mmol * 18);
////                        return [`🩸 ${mmol.toFixed(1)} mmol/L`, `🩸 ${mgdl} mg/dL`];
////                    },
//                },
//                titleFont: { size: 18 },
//                bodyFont: { size: 18 },
//                footerFont: { size: 14 },
//                padding: 14,
//                usePointStyle: true,
//                labelPointStyle: {
//                    pointStyle: "circle",
//                    rotation: 0,
//                },
//                displayColors: false,
//            },
//            legend: { display: false },
//            annotation: {
//                annotations: getAnnotationZones(borderWidth),
//            },
//        },
//    };
//}

function getChartTooltip() {
    return {
        callbacks: {
            label: (context) => {
                const mmol = context.parsed.y;
                return `🩸 ${mmol.toFixed(1)} mmol/L`;
            }
        }
    };
}

function getChartData() {
    
    
    return {
        datasets: [{
            label: "Dummy BG",
            data: [],
            borderColor: "red",
            tension: 0.3,
            fill: false,
            pointRadius: 5,
        }],
    };
    
    
//    return {
//        labels: [],
//        datasets: [{
//            label: "BG (mmol/L)",
//            data: [],
//            fill: false,
//            backgroundColor: "rgba(255, 99, 132, 0.1)",
//            borderColor: "black",
//            borderWidth: 2.5,
//            tension: 0.3,
//            pointRadius: 0
//        }],
//    };
}

function createChart(ctx) {
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
                    title: { display: true, text: "Time" }
                },
                y: {
                    min: 4,
                    max: 10,
                    title: { display: true, text: "mmol/L" }
                }
            },
            plugins: {
//                tooltip: {
//                    callbacks: {
//                        title: (context) => context[0].label,
//                        
//                        
//                        label: (context) => {
//                            const dataset = context.dataset;
//
//                            // Check if it's a note point
//                            if (dataset.label === "Notes") {
//                                const point = context.raw;
//                                const text = point?.text ?? "(no text)";
//                                return `📝 ${text}`;
//                                
//                                
//                            }
//
//                            // Default for BG readings
//                            const mmol = context.parsed.y;
//                            const mgdl = Math.round(mmol * 18);
//                            return [`🩸 ${mmol.toFixed(1)} mmol/L`, `🩸 ${mgdl} mg/dL`];
//                        },
//                        
//                        
//                        
//    //                    label: (context) => {
//    //                        const mmol = context.parsed.y;
//    //                        const mgdl = Math.round(mmol * 18);
//    //                        return [`🩸 ${mmol.toFixed(1)} mmol/L`, `🩸 ${mgdl} mg/dL`];
//    //                    },
//                    },
//                    titleFont: { size: 18 },
//                    bodyFont: { size: 18 },
//                    footerFont: { size: 14 },
//                    padding: 14,
//                    usePointStyle: true,
//                    labelPointStyle: {
//                        pointStyle: "circle",
//                        rotation: 0,
//                    },
//                    displayColors: false,
//                },
//                legend: { display: false },
//                annotation: {
//                    annotations: getAnnotationZones(borderWidth),
//                },
//                
//                
                
                
                
                
                
                tooltip: getChartTooltip(),
                legend: { display: true }
            },
            interaction: {
                mode: "nearest",
                intersect: false,
            },
//            animation: {
//                onComplete: () => {
//                    updateAnnotationZonesFromYScale();
//                    chart.update();
//                }
//            },
//            resizeDelay: 0,
//            onResize: () => {
//                if (chart && chart.scales?.y) {
//                    updateAnnotationZonesFromYScale();
//                    chart.update();
//                }
//            },
        },
    });
}









//function createChart(ctx) {
//    let borderWidth = 2;
//    return new Chart(ctx, {
//        type: "line",
//        data: {
//            labels: [],
//            datasets: [{
//                label: "BG (mmol/L)",
//                data: [],
//                fill: false,
//                backgroundColor: "rgba(255, 99, 132, 0.1)",
//                borderColor: "black",
//                borderWidth: 2.5,
//                tension: 0.3,
//                //Don't show the circles for the points
//                pointRadius: 0
//            }],
//        },
//        options: {
//            maintainAspectRatio: true,
//            interaction: {
//                mode: "nearest",
//                intersect: false,
//            },
//            animation: {
//                onComplete: () => {
//                  updateAnnotationZonesFromYScale();
//                  chart.update();
//                }
//              },
//            resizeDelay: 0,
//            onResize: () => {
//              if (chart && chart.scales?.y) {
//                updateAnnotationZonesFromYScale();
//                chart.update();
//              }
//            },
//            scales: {
//                y: {
//                    min: 2,
//                    max: 12,
//                    ticks: { stepSize: 1 },
//                    grid: {
//                        display: true,
//                        color: "#888",
//                        lineWidth: 1.5,
//                        drawTicks: true,
//                        drawBorder: true,
//                    },
//                    title: { display: true, text: "mmol/L" },
//                },
//                x: {
//                    ticks: {
//                        autoSkip: true,
//                        maxTicksLimit: 48,
//                        maxRotation: 0,
//                        minRotation: 0,
//                    },
//                    grid: {
//                        display: true,
//                        drawTicks: true,
//                        color: "#ccc",         // light grey grid line
//                        lineWidth: 1.2,        // slightly thicker for clarity
//                    },
//                    title: { display: true, text: "Time" },
//                },
//            },
//            plugins: {
//                tooltip: {
//                    callbacks: {
//                        title: (context) => context[0].label,
//                        label: (context) => {
//                            const mmol = context.parsed.y;
//                            const mgdl = Math.round(mmol * 18);
//                            return [`🩸 ${mmol.toFixed(1)} mmol/L`, `🩸 ${mgdl} mg/dL`];
//                        },
//                    },
//                    titleFont: { size: 18 },
//                    bodyFont: { size: 18 },
//                    footerFont: { size: 14 },
//                    padding: 14,
//                    usePointStyle: true,
//                    labelPointStyle: {
//                        pointStyle: "circle",
//                        rotation: 0,
//                    },
//                    displayColors: false,
//                },
//                legend: { display: false },
//                annotation: {
//                    annotations: {
//                        lowZone: {
//                            type: "box",
//                            yMin: 0,
//                            yMax: 4,
//                            backgroundColor: "rgba(255, 0, 0, 0.6)",
//                          borderWidth: borderWidth,
//                          borderColor: "rgba(0,0,0,0.4)",
//                        },
//                        inRangeZone: {
//                            type: "box",
//                            yMin: 4,
//                            yMax: 8,
//                            backgroundColor: "rgba(0, 255, 0, 0.5)",
//                                  borderWidth: borderWidth,
//                                  borderColor: "rgba(0,0,0,0.4)",
//                        },
//                        highYellowZone: {
//                            type: "box",
//                            yMin: 8,
//                            yMax: 10,
//                            backgroundColor: "rgba(0, 255, 0, 0.4)",
////                            backgroundColor: "rgba(255, 165, 0, 0.4)",
//                                  borderWidth: borderWidth,
//                                  borderColor: "rgba(0,0,0,0.4)",
//                        },
//                        veryHighZone: {
//                            type: "box",
//                            yMin: 10,
//                            yMax: 20,
//                            backgroundColor: "rgba(255, 0, 0, 0.6)", //
//                                  borderWidth: borderWidth,
//                                  borderColor: "rgba(0,0,0,0.4)",
//                        },
//                        dynamicLine: {
//                            type: "line",
//                            scaleID: "x",
//                            value: null,
//                            borderColor: "blue",
//                            borderWidth: 2,
//                            label: { display: false },
//                        },
//                    },
//                },
//            },
//        },
//    });
//}
