const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const scrapeYallaMotor = require('../scrapers/yallamotor');
const scrapeDubicars = require('../scrapers/dubicars');

// Path to store our JSON data
const DATA_FILE = path.join(__dirname, '../data/listings.json');

async function updateListings() {
    try {
        // Scrape new listings from all sources
        const [yallaMotorListings, dubicarsListings] = await Promise.all([
            scrapeYallaMotor(),
            scrapeDubicars()
        ]);
        
        // Combine listings from all sources
        const allListings = [
            ...yallaMotorListings,
            ...dubicarsListings
        ];
        
        // Save to JSON file
        await fs.writeFile(DATA_FILE, JSON.stringify(allListings, null, 2));
        console.log(`Updated listings saved: ${allListings.length} total listings`);
        
    } catch (error) {
        console.error('Error updating listings:', error);
    }
}

// Run every 4 hours
cron.schedule('0 */4 * * *', updateListings);

// Initial run
updateListings();

module.exports = updateListings;
