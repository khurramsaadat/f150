const puppeteer = require('puppeteer');

async function scrapeYallaMotor() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });

    try {
        console.log('Starting YallaMotor scraper...');
        const page = await browser.newPage();
        
        // Set longer timeout and realistic user agent
        page.setDefaultNavigationTimeout(60000);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Set viewport
        await page.setViewport({ width: 1366, height: 768 });

        console.log('Navigating to F-150 listings...');
        await page.goto('https://uae.yallamotor.com/used-cars/ford/f-150', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Wait for listings to load
        await page.waitForSelector('.listing-item', { timeout: 60000 });
        
        console.log('Extracting listings data...');
        const listings = await page.evaluate(() => {
            const items = document.querySelectorAll('.listing-item');
            return Array.from(items).map(item => {
                const title = item.querySelector('.listing-title')?.textContent.trim() || '';
                const price = item.querySelector('.listing-price')?.textContent.trim() || '';
                const location = item.querySelector('.listing-location')?.textContent.trim() || '';
                const imageUrl = item.querySelector('img')?.src || '';
                const listingUrl = item.querySelector('a')?.href || '';
                
                return {
                    title,
                    price,
                    location,
                    imageUrl,
                    listingUrl,
                    source: 'YallaMotor',
                    timestamp: new Date().toISOString()
                };
            }).filter(listing => listing.listingUrl && listing.imageUrl);
        });

        console.log(`Found ${listings.length} listings`);
        return listings;

    } catch (error) {
        console.error('Error scraping YallaMotor:', error);
        return [];
    } finally {
        console.log('Browser closed');
        await browser.close();
    }
}

// Add pagination support
async function getAllListings() {
    const allListings = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
        const pageListings = await scrapeYallaMotor(page);
        if (pageListings.length === 0) {
            hasMorePages = false;
        } else {
            allListings.push(...pageListings);
            page++;
        }
    }

    return allListings;
}

module.exports = {
    scrapeYallaMotor,
    getAllListings
}; 