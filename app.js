import express from 'express';
const app = express();

import { v4 as uuidv4 } from 'uuid';

import { middleware } from 'express-openapi-validator';
import YAML from 'yamljs';
const apiSpec = YAML.load('./api.yml');

import {calculateBasePoints, calculateItemDescriptionPoints, calculatePairPoints,
     calculateOddDayPoints, calculateSpecialPoints, calculateTimeInboundPoints} from "./helpers.js";

app.use(express.json());

// I am using express-openapi-validator to validate API schema in api.yml file
app.use(middleware({
    apiSpec,
    validateRequests: true, 
    validateResponses: true,
}));

const receipts = {};

// function to calculate points
function getPoints(receipts){
    try {
        const pointsForRetailer = calculateBasePoints(receipts.retailer);
        const pointsForTotalPrice = calculateSpecialPoints(receipts.total);
        const pointsForEveryTwoItems = calculatePairPoints(receipts.items);
        const pointsForItemDescription = calculateItemDescriptionPoints(receipts.items);
        const pointsForOddDays = calculateOddDayPoints(receipts.purchaseDate) ? 6 : 0;
        const pointsForTimeBounds = calculateTimeInboundPoints(receipts.purchaseTime);

        const ans = [pointsForRetailer + pointsForTotalPrice + pointsForEveryTwoItems + 
            pointsForItemDescription + pointsForOddDays + pointsForTimeBounds].reduce((a, b) => a + b, 0);

        return ans;

    } catch (error) {
        console.error('Failed to calculate points:', error);
        return 0; 
    }
}

// Process receipts
app.post('/receipts/process', (req, res) => {
    const id = uuidv4(); 
    receipts[id] = req.body; 
    res.status(200).json({ id }); 
    console.log("receipts: ==> ", receipts);
});

// Get points for a receipt
app.get('/receipts/:id/points', (req, res) => {
    const receipt = receipts[req.params.id];
    if (!receipt) {
        return res.status(404).json({ error: "No receipt found for that ID." });
    }

    var points = getPoints(receipt);
    res.status(200).json({ points: points }); 
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




// One point for every alphanumeric character in the retailer name. (Done)
// 50 points if the total is a round dollar amount with no cents. (Done)
// 25 points if the total is a multiple of 0.25. (done)
// 5 points for every two items on the receipt. (done)
// If the trimmed length of the item description is a multiple of 3, 
    // multiply the price by 0.2 and round up to the nearest integer. 
    // The result is the number of points earned. (done)
// 6 points if the day in the purchase date is odd. (done)
// 10 points if the time of purchase is after 2:00pm and before 4:00pm.


// function is_time_inbound(timeStr){
//     const now = new Date();
//     const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     const timeParts = timeStr.split(':');
//     baseDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2]));

//     const start = new Date(baseDate);
//     start.setHours(14, 0, 0); // 2 PM

//     const end = new Date(baseDate);
//     end.setHours(16, 0, 59); // 4 PM, including the last second of 4:00 PM

//     // Compare times
//     return baseDate >= start && baseDate <= end;
// }


// function get_points(receipts){
//     var retailer_name = receipts.retailer.replace(/[^a-z0-9]/gi, '');
//     points_to_calculate = retailer_name.length;
//     number_of_items = receipts.items.length;

//     points = points_to_calculate;

//     receipts.items.forEach(item => {
//         const cleanedString = item.shortDescription.trim();
//         if(cleanedString.length % 3 === 0){
//             points = points + Math.ceil(item.price * 0.2);
//         }
//     });

//     var item_pairs = Math.floor(receipts.items.length/2) * 5;
//     var current_date =  new Date(receipts.purchaseDate);
//     var odd_day =  current_date.getUTCDate() % 2 === 0 ? 0 : points_to_calculate;

//     var is_multiple_of_25 = receipts.total % 0.25 === 0 ? 25 : 0;
//     var is_round_dollar = receipts.total % 1 === 0 ? 50 : 0;

//     var hour = receipts.purchaseTime;
//     const is_time_Inbound = is_time_inbound(hour) ? 10 : 0;

//     points += item_pairs;
//     points += odd_day;
//     points += is_multiple_of_25;
//     points += is_round_dollar;
//     points += is_time_Inbound;

//     return points;
// }