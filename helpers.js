// function to clean retailer name, ex: remove any space, remove special characters
export function cleanRetailerName(retailerName) {
    return retailerName.replace(/[^a-z0-9]/gi, '');
}

// function to calculate length of cleaned retailer name as points
export function calculateBasePoints(retailerName) {
    var cleanedRetailerName = cleanRetailerName(retailerName);
    return cleanedRetailerName.length;
}

// function to calculate if the trimmed item description length is multiple of 3
export function calculateItemDescriptionPoints(items) {
    let itemDescPoints = 0;
    items.forEach(item => {
        const cleanedString = item.shortDescription.trim();
        if (cleanedString.length % 3 === 0) {
            itemDescPoints += Math.ceil(item.price * 0.2);
        }
    });
    return itemDescPoints;
}

// function to calculate 5 points for every 2 items on receipt
export function calculatePairPoints(numberOfItems) {
    return Math.floor(numberOfItems.length / 2) * 5;
}

// function to calculate points if purchase date is odd
export function calculateOddDayPoints(purchaseDate) {
    const date = new Date(purchaseDate);
    return date.getUTCDate() % 2 !== 0;
}

// function to calculate points if total is multiple of 0.25
// same function calculates points if total is round dollar amount.
export function calculateSpecialPoints(total) {
    let points = 0;
    points += total % 0.25 === 0 ? 25 : 0;
    points += total % 1 === 0 ? 50 : 0;
    return points;
}

// function to calculate points if time is between 2:00 pm and 4:00 pm
// instead of comparing just string, i tried to initialize new date and 
// assigned them time window for 2:00 pm and 4:00 pm
export function calculateTimeInboundPoints(purchaseTime) {
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const timeParts = purchaseTime.split(':');
    baseDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2]));

    const start = new Date(baseDate);
    start.setHours(14, 0, 0); 

    const end = new Date(baseDate);
    end.setHours(16, 0, 0); 

    var isTimeInbound = baseDate >= start && baseDate <= end;
    return isTimeInbound ? 10 : 0;
}
