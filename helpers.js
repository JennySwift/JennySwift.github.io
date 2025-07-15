//
//  helpers.js
//  
//
//  Created by Jenny Swift on 16/7/2025.
//

function parseFlexibleTime(input) {
  const clean = input.toLowerCase().replace(/\s+/g, '');
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);

  if (!match) return null;

  let hour = parseInt(match[1]);
  let minute = parseInt(match[2] || '0');
  const period = match[3];

  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  return null;
}
