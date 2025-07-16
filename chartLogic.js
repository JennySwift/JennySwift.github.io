//
//  chartLogic.js
//
//
//  Created by Jenny Swift on 16/7/2025.
//

let chart;
let readings = [];

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("bgChart").getContext("2d");
    const selectedDateInput = document.getElementById("selectedDate");
    
    fetch("https://dl.dropboxusercontent.com/scl/fi/0udoq3x6gkchstkq2hqxg/glucoseData.json?rlkey=vllvwb6wlx2el12c9aqijw37p")
    .then((response) => response.json())
    .then((data) => {
        readings = data.readings.map((r) => ({
            timestamp: new Date(r.timestamp),
            value: r.value,
        }));
        
        
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        selectedDateInput.value = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
        
        chart = createChart(ctx);
        updateChartForDate(today);
    });
    
    selectedDateInput.addEventListener("change", () => {
        const selected = selectedDateInput.valueAsDate;
        updateChartForDate(selected);
    });
    
    document.getElementById("jumpInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            jumpToTime();
        }
    });
    
    document.getElementById("bgChart").addEventListener("mousemove", (evt) => {
        const points = chart.getElementsAtEventForMode(evt, "nearest", { intersect: false }, false);
        if (points.length > 0) {
            const index = points[0].index;
            const label = chart.data.labels[index];
            chart.options.plugins.annotation.annotations.dynamicLine.value = label;
            chart.update("none");
        }
    });
});

function createChart(ctx) {
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "BG (mmol/L)",
                data: [],
                fill: false,
                backgroundColor: "rgba(255, 99, 132, 0.1)",
                borderColor: "black",
                borderWidth: 2.5,
                tension: 0.3,
                //Don't show the circles for the points
                pointRadius: 0
            }],
        },
        options: {
            interaction: {
                mode: "nearest",
                intersect: false,
            },
            scales: {
                y: {
                    min: 2,
                    max: 12,
                    ticks: { stepSize: 1 },
                    grid: {
                        display: true,
                        color: "#888",
                        lineWidth: 1.5,
                        drawTicks: true,
                        drawBorder: true,
                    },
                    title: { display: true, text: "mmol/L" },
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 48,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                    title: { display: true, text: "Time" },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (context) => context[0].label,
                        label: (context) => {
                            const mmol = context.parsed.y;
                            const mgdl = Math.round(mmol * 18);
                            return [`🩸 ${mmol.toFixed(1)} mmol/L`, `🩸 ${mgdl} mg/dL`];
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
                },
                legend: { display: false },
                annotation: {
                    annotations: {
                        lowZone: {
                            type: "box",
                            yMin: 0,
                            yMax: 4,
                            backgroundColor: "rgba(255, 0, 0, 0.4)",
                            borderWidth: 0,
                        },
                        inRangeZone: {
                            type: "box",
                            yMin: 4,
                            yMax: 8,
                            backgroundColor: "rgba(0, 255, 0, 0.4)",
                            borderWidth: 0,
                        },
                        highYellowZone: {
                            type: "box",
                            yMin: 8,
                            yMax: 10,
                            backgroundColor: "rgba(255, 255, 0, 0.4)",
                            borderWidth: 0,
                        },
                        veryHighZone: {
                            type: "box",
                            yMin: 10,
                            yMax: 20,
                            backgroundColor: "rgba(255, 0, 0, 0.4)",
                            borderWidth: 0,
                        },
                        dynamicLine: {
                            type: "line",
                            scaleID: "x",
                            value: null,
                            borderColor: "blue",
                            borderWidth: 2,
                            label: { display: false },
                        },
                    },
                },
            },
        },
    });
}

function updateChartForDate(date) {
    console.log("🛠 updateChartForDate called with:", date.toString());
    console.log("📅 input field currently shows:", document.getElementById("selectedDate").value);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    
    const heading = document.getElementById("dateHeading");
    heading.textContent = start.toLocaleDateString("en-AU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    
    const filtered = readings.filter(r => r.timestamp >= start && r.timestamp < end);
    console.log("📅 Filtering for:", start.toDateString());
    console.log("🔢 Found readings:", filtered.length);
    
    const labels = filtered.map(r =>
                                r.timestamp.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })
                                );
    const values = filtered.map(r => r.value);
    logChartLabelsAndValues(labels, values);
    
    // Automatically scale y-axis to fit data
    //Always show at least up to 10 but higher if needed
    chart.options.scales.y.max = Math.max(10, Math.ceil(Math.max(...values)));
    //Always show at least down to 4 but lower if BG is lower than 4
    chart.options.scales.y.min = Math.min(4, Math.floor(Math.min(...values)));
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    //Specify how many time labels to show below the chart
    chart.options.scales.x.ticks.maxTicksLimit = 6;
    chart.update();
//    highlightIfToday(date);
//    updateForwardButtonState(date);
}

function logChartLabelsAndValues(labels, values) {
    console.log("📈 Chart data points for selected date:");
    for (let i = 0; i < labels.length; i++) {
        console.log(`→ ${labels[i]} = ${values[i]}`);
    }
}

function jumpToTime() {
    const input = document.getElementById("jumpInput").value.trim();
    if (!input) return;
    
    const parsed = parseFlexibleTime(input);
    if (!parsed) {
        alert("Couldn't understand that time. Try e.g. 2:30 PM or 14:00");
        return;
    }
    
    const labels = chart.data.labels;
    
    const formattedTarget = parsed.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    
    let closestIndex = 0;
    let closestDiff = Infinity;
    
    for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const labelDate = parseFlexibleTime(label);
        if (!labelDate) continue;
        
        const diff = Math.abs(labelDate.getTime() - parsed.getTime());
        if (diff < closestDiff) {
            closestDiff = diff;
            closestIndex = i;
        }
    }
    
    const matchedLabel = labels[closestIndex];
    
    chart.options.plugins.annotation.annotations.dynamicLine.value = matchedLabel;
    chart.setActiveElements([{ datasetIndex: 0, index: closestIndex }]);
    chart.tooltip.setActiveElements([{ datasetIndex: 0, index: closestIndex }], { x: 0, y: 0 });
    chart.update();
}
