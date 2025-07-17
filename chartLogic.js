//
//  chartLogic.js
//
//
//  Created by Jenny Swift on 16/7/2025.
//

let bgChart;
let foodChart;
let glucoseReadings = [];
let foodLogs = [];
let notes = [];

function updateVerticalLines(timestamp) {
    if (bgChart) {
        bgChart.options.plugins.annotation.annotations.dynamicLine.value = timestamp;
        bgChart.update("none");
    }
    if (foodChart) {
        foodChart.options.plugins.annotation.annotations.dynamicLine.value = timestamp;
        foodChart.update("none");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("bgChart").getContext("2d");
    const foodCtx = document.getElementById("foodChart").getContext("2d");
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
        
        bgChart = createBGChart(ctx);
        foodChart = createFoodChart(foodCtx);
        updateChartForDate(today);
        
        attachChartMousemoveSync(bgChart, "bgChart");
        attachChartMousemoveSync(foodChart, "foodChart");
        
        
        attachChartMouseleaveClear();
        
    });
    
    
    
    selectedDateInput.addEventListener("change", () => {
        const selected = selectedDateInput.valueAsDate;
        updateChartForDate(selected);
    });
    
    // Hide tooltip + vertical line when tapping outside chart on iPhone
    document.addEventListener("touchstart", (e) => {
        const chartEl = document.getElementById("bgChart");
        if (!chartEl.contains(e.target)) {
            bgChart.setActiveElements([]);
            bgChart.options.plugins.annotation.annotations.dynamicLine.value = null;
            bgChart.update();
        }
    });
    
    document.getElementById("jumpInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            jumpToTime();
        }
    });
    
    
    
//    document.getElementById("bgChart").addEventListener("mousemove", (evt) => {
//        if (!bgChart) return;
//
//        const points = bgChart.getElementsAtEventForMode(evt, "nearest", { intersect: false }, false);
//        if (points.length > 0) {
//            const index = points[0].index;
//            const label = bgChart.data.datasets[0].data[index]?.x;
//            bgChart.options.plugins.annotation.annotations.dynamicLine.value = label;
//            bgChart.update("none");
//        }
//    });
    
    

});

//    Hide the vertical line when mouse leaves chart
function attachChartMouseleaveClear() {
    ["bgChart", "foodChart"].forEach((chartId) => {
        const el = document.getElementById(chartId);
        el.addEventListener("mouseleave", () => {
            if (bgChart) {
                bgChart.options.plugins.annotation.annotations.dynamicLine.value = null;
                bgChart.update("none");
            }
            if (foodChart) {
                foodChart.options.plugins.annotation.annotations.dynamicLine.value = null;
                foodChart.update("none");
            }
        });
    });
}

function attachChartMousemoveSync(chartInstance, chartElementId) {
    const el = document.getElementById(chartElementId);
    el.addEventListener("mousemove", (evt) => {
        if (!chartInstance) return;

        const points = chartInstance.getElementsAtEventForMode(evt, "nearest", { intersect: false }, false);
        if (points.length > 0) {
            const index = points[0].index;
            const label = chartInstance.data.datasets[0].data[index]?.x;
            updateVerticalLines(label);
        }
    });
}



function updateAnnotationZonesFromYScale() {
    const yScale = bgChart.scales.y;
    if (!yScale) return;
    
    const annotations = bgChart.options.plugins.annotation.annotations;
    
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

function formatTime12hCompact(date) {
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).toLowerCase().replace(' ', '');
}

function handleLogClick(timestamp) {
    jumpToTime(new Date(timestamp));

    // Highlight matching point in BG chart
    const bgDataset = bgChart.data.datasets[0].data;
    const bgIndex = bgDataset.findIndex(p => Math.abs(new Date(p.x) - timestamp) < 2 * 60 * 1000);
    if (bgIndex !== -1) {
        highlightChartPoint(bgChart, 0, bgIndex);
    }

    // Highlight matching point in Food chart
    const foodDataset = foodChart.data.datasets[0].data;
    const foodIndex = foodDataset.findIndex(p => Math.abs(new Date(p.x) - timestamp) < 2 * 60 * 1000);
    if (foodIndex !== -1) {
        highlightChartPoint(foodChart, 0, foodIndex);
    }
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

        const time = formatTime12hCompact(log.timestamp);
        
        div.innerHTML = `
            <strong>${time}</strong>: ${log.foodName}
            <div class="food-log-details">
                <span>🍌 Net Carbs: ${log.netCarbs}g</span>
                <span>🥑 Fat: ${log.fat}g</span>
                <span>🔥 Calories: ${log.calories}</span>
            </div>
        `;
        div.setAttribute("data-timestamp", log.timestamp.toISOString());
        div.style.cursor = "pointer";
        
        div.addEventListener("click", () => {
            handleLogClick(new Date(log.timestamp));
        });


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

        const time = formatTime12hCompact(note.timestamp);

        const tags = note.tags?.join(" ") ?? "";

        div.innerHTML = `
            <strong>${time}</strong>: ${note.text.replace(/\n/g, "<br>")}
            <div class="note-tags">${tags}</div>
        `;

        notesContainer.appendChild(div);
    });
}

function updateFoodChartForDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const foodLogsForDay = foodLogs.filter(log => log.timestamp >= startOfDay && log.timestamp < endOfDay);

    const data = foodLogsForDay.map(log => ({
        x: log.timestamp,
        y: log.netCarbs,
        foodName: log.foodName,
        calories: log.calories,
        netCarbs: log.netCarbs,
        fat: log.fat
    }));

    foodChart.data.datasets[0].data = data;
    foodChart.options.scales.x.min = startOfDay;
    foodChart.options.scales.x.max = endOfDay;
    
    const netCarbValues = foodLogsForDay.map(log => log.netCarbs);
    setFoodChartYScales(netCarbValues);
    
    foodChart.update();
}

//For BG chart
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
        data: getNotesXYPoints(bgChart.options.scales.y.min),
        backgroundColor: "yellow",
        borderColor: "yellow",
        pointRadius: 10,
        pointStyle: "rectRot",
        showLine: false,
    };
    
    const glucoseDataset = {
        label: "BG",
        data: bgXYValues,
        pointRadius: 0,
        fill: false,
        borderColor: "red",
        tension: 0.1
    };

    bgChart.data.datasets = [
        glucoseDataset,
        noteDataset
    ];

    bgChart.update();
    updateFoodChartForDate(date);
}

function setChartXScales(start, end) {
    bgChart.options.scales.x.min = start;
    bgChart.options.scales.x.max = end;
    
    bgChart.options.scales.x.ticks.maxTicksLimit = 12;
    foodChart.options.scales.x.ticks.maxTicksLimit = 12;
}

//Automatically scale y-axis to fit data
function setChartYScales(glucoseValues) {
    //Always show at least up to 10 but higher if needed
    bgChart.options.scales.y.max = Math.max(10, Math.ceil(Math.max(...glucoseValues)));
    //Always show at least down to 4 but lower if BG is lower than 4
    bgChart.options.scales.y.min = Math.min(4, Math.floor(Math.min(...glucoseValues)));
}

function setFoodChartYScales(netCarbValues) {
    foodChart.options.scales.y.min = 0;
    foodChart.options.scales.y.max = Math.max(40, Math.ceil(Math.max(...netCarbValues)));
}

function getNotesXYPoints(yValue) {
    return notes.map(note => ({
        x: note.timestamp,
        y: bgChart.options.scales.y.min + 0.5,
        text: note.text,
        type: "note"
    }));
}

function logChartLabelsAndValues(labels, values) {
    console.log("📈 Chart data points for selected date:");
    for (let i = 0; i < labels.length; i++) {
        //        console.log(`→ ${labels[i]} = ${values[i]}`);
    }
}

function highlightChartPoint(chart, datasetIndex, pointIndex) {
    const dataset = chart.data.datasets[datasetIndex];

    const original = dataset._originalPointRadius ?? dataset.pointRadius ?? 3;
    if (!dataset._originalPointRadius) {
        dataset._originalPointRadius = original;
    }

    dataset.pointRadius = (ctx) => {
        return ctx.dataIndex === pointIndex ? 15 : original;
    };

    chart.update();

    setTimeout(() => {
        dataset.pointRadius = original;
        chart.update();
    }, 800);
}

function jumpToTime(inputTime) {
    let parsed;

    if (inputTime instanceof Date) {
        parsed = inputTime;
    } else {
        const input = document.getElementById("jumpInput").value.trim();
        if (!input) return;

        parsed = parseFlexibleTime(input);
        if (!parsed) {
            alert("Couldn't understand that time. Try e.g. 2:30 PM or 14:00");
            return;
        }
    }

    const dataset = bgChart.data.datasets[0].data;

    let closestIndex = 0;
    let closestDiff = Infinity;

    for (let i = 0; i < dataset.length; i++) {
        const dataTime = new Date(dataset[i].x);
        const diff = Math.abs(dataTime - parsed);
        if (diff < closestDiff) {
            closestDiff = diff;
            closestIndex = i;
        }
    }

    const matchedLabel = dataset[closestIndex]?.x;
    const formattedTarget = parsed.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    console.log("⏩ Jumping to:", formattedTarget);
    console.log("🔍 Matched label:", matchedLabel);
    console.log("🩸 BG value at match:", dataset[closestIndex]?.y);
    
    const timestamp = bgChart.data.datasets[0].data[closestIndex]?.x ?? null;
    updateVerticalLines(timestamp);

    bgChart.setActiveElements([{ datasetIndex: 0, index: closestIndex }]);
    bgChart.tooltip.setActiveElements([{ datasetIndex: 0, index: closestIndex }], { x: 0, y: 0 });
    bgChart.update();

    updateVerticalLines(bgChart.data.datasets[0].data[closestIndex]?.x ?? null);
//    bgChart.options.plugins.annotation.annotations.dynamicLine.value = matchedLabel;
//    bgChart.setActiveElements([{ datasetIndex: 0, index: closestIndex }]);
//    bgChart.tooltip.setActiveElements([{ datasetIndex: 0, index: closestIndex }], { x: 0, y: 0 });
//    bgChart.update();
}
