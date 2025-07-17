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
    document.getElementById("bgChart").addEventListener("mouseleave", () => {
        chart.options.plugins.annotation.annotations.dynamicLine.value = null;
        chart.update("none");
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

function showFoodLogsForDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const foodLogsContainer = document.getElementById("foodLogsContainer");
    foodLogsContainer.innerHTML = ""; // clear old food logs

    console.log("Food logs:", foodLogs);
    
    const foodLogsForDay = foodLogs.filter(log => log.timestamp >= startOfDay && log.timestamp < endOfDay);
            
    console.log("Food Logs for day:", foodLogsForDay);

    if (foodLogsForDay.length === 0) {
        foodLogsContainer.textContent = "No food logs for this day.";
        return;
    }

    foodLogsForDay.forEach(log => {
        const div = document.createElement("div");
        div.classList.add("food-log-block");

        const time = log.timestamp.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        div.innerHTML = `
            <strong>${time}</strong>: ${log.foodName}
        `;

        foodLogsContainer.appendChild(div);
    });
}

function showNotesForDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const notesContainer = document.getElementById("notesContainer");
    notesContainer.innerHTML = ""; // clear old notes

    console.log("Notes:", notes);
    
    const notesForDay = notes.filter(note => note.timestamp >= startOfDay && note.timestamp < endOfDay);
            
    console.log("Notes for day:", notesForDay);

    if (notesForDay.length === 0) {
        notesContainer.textContent = "No notes for this day.";
        return;
    }

    notesForDay.forEach(note => {
        const div = document.createElement("div");
        div.classList.add("note-block");

        const time = note.timestamp.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });

        const tags = note.tags?.join(" ") ?? "";

        div.innerHTML = `
            <strong>${time}</strong>: ${note.text.replace(/\n/g, "<br>")}
            <div class="note-tags">${tags}</div>
        `;

        notesContainer.appendChild(div);
    });
}

function updateChartForDate(date) {
    showNotesForDate(date);
    showFoodLogsForDate(date);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    setChartXScales(startOfDay, endOfDay);

    const heading = document.getElementById("dateHeading");
    heading.textContent = startOfDay.toLocaleDateString("en-AU", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const filtered = glucoseReadings.filter(r => r.timestamp >= startOfDay && r.timestamp < endOfDay);
    const bgXYValues = filtered.map(r => ({ x: r.timestamp, y: r.value }));
    const glucoseValues = filtered.map(r => r.value);

    setChartYScales(glucoseValues);

    const noteDataset = {
        label: "Notes",
        data: getNotesXYPoints(chart.options.scales.y.min),
        backgroundColor: "blue",
        borderColor: "blue",
        pointRadius: 6,
        pointStyle: "rectRot",
        showLine: false,
    };

    chart.data.datasets = [
        {
            label: "Blood Glucose",
            data: bgXYValues,
            fill: false,
            borderColor: "red",
            tension: 0.1
        },
        noteDataset
    ];

    chart.update();
}

function setChartXScales(start, end) {
    chart.options.scales.x.min = start;
    chart.options.scales.x.max = end;
    
    chart.options.scales.x.ticks.maxTicksLimit = 12;
}

//Automatically scale y-axis to fit data
function setChartYScales(glucoseValues) {
    //Always show at least up to 10 but higher if needed
    chart.options.scales.y.max = Math.max(10, Math.ceil(Math.max(...glucoseValues)));
    //Always show at least down to 4 but lower if BG is lower than 4
    chart.options.scales.y.min = Math.min(4, Math.floor(Math.min(...glucoseValues)));
}

     

function getNotesXYPoints(yValue) {
    return notes.map(note => ({
        x: note.timestamp,
        y: chart.options.scales.y.min + 0.5,
        text: note.text
    }));
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
