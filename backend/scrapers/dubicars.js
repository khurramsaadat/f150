const puppeteer = require('puppeteer');

async function scrapeDubicars() {
    try {
        console.log('Starting Dubicars scraper...');
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        // Navigate to Ford F-150 listings
        await page.goto('https://dubai.dubicars.com/search/ford-f-150/');
        
        // Wait for listings to load
        await page.waitForSelector('.card-container', { timeout: 5000 });
        
        const listings = await page.evaluate(() => {
            const items = [];
            const listingElements = document.querySelectorAll('.card-container');
            
            listingElements.forEach(element => {
                items.push({
                    title: element.querySelector('.card-title')?.textContent?.trim(),
                    price: element.querySelector('.price-value')?.textContent?.trim(),
                    location: element.querySelector('.location')?.textContent?.trim(),
                    imageUrl: element.querySelector('img')?.src,
                    listingUrl: element.querySelector('a')?.href,
                    source: 'Dubicars',
                    timestamp: new Date().toISOString()
                });
            });
            
            return items;
        });

        await browser.close();
        console.log(`Found ${listings.length} listings from Dubicars`);
        return listings;
        
    } catch (error) {
        console.error('Error scraping Dubicars:', error);
        return [];
    }
}

module.exports = scrapeDubicars; 