//
//  dateNavigation.swift
//  
//
//  Created by Jenny Swift on 16/7/2025.
//

document.getElementById("prevDate").addEventListener("click", () => {
  const selected = document.getElementById("selectedDate");
  const date = selected.valueAsDate;
  date.setDate(date.getDate() - 1);
    selected.value = date.toISOString().split("T")[0];
  updateChartForDate(date);                  // manually trigger graph update
});

document.getElementById("nextDate").addEventListener("click", () => {
  const selected = document.getElementById("selectedDate");
  const date = selected.valueAsDate;
  date.setDate(date.getDate() + 1);
    selected.value = date.toISOString().split("T")[0];
  updateChartForDate(date);
});

function highlightIfToday(date) {
  const input = document.getElementById("selectedDate");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);

  if (selected.getTime() === today.getTime()) {
    input.classList.add("today");
  } else {
    input.classList.remove("today");
  }
}

function updateForwardButtonState(date) {
  const forwardButton = document.getElementById("nextDate");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);

  forwardButton.disabled = selected.getTime() === today.getTime();
}
