//
//  chartLogic.js
//
//
//  Created by Jenny Swift on 16/7/2025.
//

let chart;
let glucoseReadings = [];
let foodLogs = [];
let notes = [];

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("bgChart").getContext("2d");
    const selectedDateInput = document.getElementById("selectedDate");
    
    fetch("https://dl.dropboxusercontent.com/scl/fi/0udoq3x6gkchstkq2hqxg/glucoseData.json?rlkey=vllvwb6wlx2el12c9aqijw37p")
    .then((response) => response.json())
    .then((data) => {
        //        console.log("📦 Raw data from JSON:", data);
        glucoseReadings = data.glucoseReadings.map((r) => ({
            timestamp: new Date(r.timestamp),
            value: r.value,
        }));
        
        foodLogs = data.foodLogs?.map((f) => ({
            timestamp: new Date(f.timestamp),
            foodName: f.foodName,
            netCarbs: f.netCarbs,
            calories: f.calories,
            fat: f.fat,
        })) || [];
        
        notes = data.notes?.map((n) => ({
            timestamp: new Date(n.startTime),
            text: n.text,
            tags: n.tags || [],
        })) || [];
        
//        console.log("✅ Food Logs:", foodLogs);
//        console.log("✅ Notes:", notes);
//        
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
    
    // Hide tooltip + vertical line when tapping outside chart on iPhone
    document.addEventListener("touchstart", (e) => {
        const chartEl = document.getElementById("bgChart");
        if (!chartEl.contains(e.target)) {
            chart.setActiveElements([]);
            chart.options.plugins.annotation.annotations.dynamicLine.value = null;
            chart.update();
        }
    });
    
    document.getElementById("jumpInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            jumpToTime();
        }
    });
    
    //    Hide the vertical line when mouse leaves chart
    //    document.getElementById("bgChart").addEventListener("mouseleave", () => {
    //        chart.options.plugins.annotation.annotations.dynamicLine.value = null;
    //        chart.update("none");
    //    });
    
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



function updateAnnotationZonesFromYScale() {
    const yScale = chart.scales.y;
    if (!yScale) return;
    
    const annotations = chart.options.plugins.annotation.annotations;
    
    annotations.lowZone.yMin = yScale.min;
    annotations.lowZone.yMax = 4;
    
    annotations.inRangeZone.yMin = 4;
    annotations.inRangeZone.yMax = 8;
    
    annotations.highYellowZone.yMin = 8;
    annotations.highYellowZone.yMax = 10;
    
    annotations.veryHighZone.yMin = 10;
    annotations.veryHighZone.yMax = yScale.max;
}

//To fix the background colours not being in the right zones on page load
function updateAnnotationZonesFromYMax(yMax) {
    const annotations = chart.options.plugins.annotation.annotations;
    annotations.lowZone.yMax = 4;
    annotations.inRangeZone.yMin = 4;
    annotations.inRangeZone.yMax = 8;
    annotations.highYellowZone.yMin = 8;
    annotations.highYellowZone.yMax = 10;
    annotations.veryHighZone.yMin = 10;
    annotations.veryHighZone.yMax = yMax;
}

function updateChartForDate(date) {
//    console.log("🛠 updateChartForDate called with:", date.toString());
//    console.log("📅 input field currently shows:", document.getElementById("selectedDate").value);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    
    //If I want the graph to not go till the end of today
    //    const end = new Date(start);
    //    end.setDate(end.getDate() + 1);
    //If I want it to go till the end of today
    const end = new Date(); // use current time instead of fixed end-of-day
    
    const heading = document.getElementById("dateHeading");
    heading.textContent = start.toLocaleDateString("en-AU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    
    const filtered = glucoseReadings.filter(r => r.timestamp >= start && r.timestamp < end);
//    console.log("📅 Filtering for:", start.toDateString());
//    console.log("🔢 Found glucose readings:", filtered.length);
    
//    const labels = filtered.map(r =>
//                                r.timestamp.toLocaleTimeString([], {
//        hour: "numeric",
//        minute: "2-digit",
//        hour12: true,
//    })
//                                );
//    const glucoseValues = filtered.map(r => r.value);
    
    const bgXYValues = filtered.map(r => ({
        x: r.timestamp,
        y: r.value,
    }));
//    
//    logChartLabelsAndValues(labels, values);
    
    // Automatically scale y-axis to fit data
    //Always show at least up to 10 but higher if needed
//    const newYMax = Math.max(10, Math.ceil(Math.max(...values)));
//    chart.options.scales.y.max = newYMax;
    //    chart.options.scales.y.max = Math.max(10, Math.ceil(Math.max(...values)));
    //Always show at least down to 4 but lower if BG is lower than 4
//    chart.options.scales.y.min = Math.min(4, Math.floor(Math.min(...values)));
    
//    updateAnnotationZonesFromYMax(newYMax);
    
    
    const noteDataset = {
        label: "Notes",
        data: notes
        .filter(n => n.timestamp >= start && n.timestamp < end)
        .map(note => ({
            x: note.timestamp,
            y: chart.options.scales.y.min + 0.5,
            text: note.text
        })),
        backgroundColor: "blue",
        borderColor: "blue",
        pointRadius: 6,
        pointStyle: "rectRot",
        showLine: false,
    };
    
    
    
    
    //    chart.data.labels = labels;
    //    chart.data.datasets[0].data = values;
    
    
    const now = new Date();
    const data = [
        { x: new Date(now.getTime() - 3 * 60 * 60 * 1000), y: 5.5 },
        { x: new Date(now.getTime() - 2 * 60 * 60 * 1000), y: 6.2 },
        { x: new Date(now.getTime() - 1 * 60 * 60 * 1000), y: 7.0 },
        { x: now, y: 6.7 },
    ];
    chart.data.datasets[0].data = bgXYValues;
    
//    chart.data.datasets = [
//        {
//            label: "Blood Glucose",
//            data: bgPoints,
//            fill: false,
//            borderColor: "red",
//            tension: 0.1
//        },
//        noteDataset
//    ];
    
    
    
    //Specify how many time labels to show below the chart
//    chart.options.scales.x.ticks.maxTicksLimit = 8;
    chart.update();
    
    
    //    highlightIfToday(date);
    //    updateForwardButtonState(date);
}

function logChartLabelsAndValues(labels, values) {
    console.log("📈 Chart data points for selected date:");
    for (let i = 0; i < labels.length; i++) {
        //        console.log(`→ ${labels[i]} = ${values[i]}`);
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
