//
//  helpers.js
//  
//
//  Created by Jenny Swift on 16/7/2025.
//

function parseFlexibleTime(input, baseDate) {
    if (!baseDate) return null;

    const timeParts = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!timeParts) return null;

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2] ?? "0");
    const meridian = timeParts[3]?.toLowerCase();

    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;

    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
}


