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
