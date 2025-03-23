const fs = require('fs').promises;
const path = require('path');
const { scrapeYallaMotor, getAllListings } = require('./scrapers/yallamotor');
const scrapeDubicars = require('./scrapers/dubicars');

async function test() {
    try {
        console.log('Starting YallaMotor test...');
        
        // Scrape listings
        const listings = await scrapeYallaMotor();
        console.log(`Found ${listings.length} listings`);

        if (listings.length > 0) {
            // Save to JSON file
            const dataPath = path.join(__dirname, 'data', 'listings.json');
            await fs.writeFile(dataPath, JSON.stringify(listings, null, 2));
            console.log('Listings saved to listings.json');
            
            // Log sample listing
            console.log('\nSample listing:');
            console.log(JSON.stringify(listings[0], null, 2));
        } else {
            console.log('No listings found');
        }

        console.log('\nTesting pagination...');
        const allListings = await getAllListings();
        console.log(`Total listings found across all pages: ${allListings.length}`);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
test().then(() => {
    console.log('Test completed');
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
