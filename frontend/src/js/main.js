console.log('Script loaded');

console.log('Main.js loaded!');

// State management
let filteredListings = [];
let filters = {
    minPrice: 0,
    maxPrice: 500000,
    year: '',
    location: ''
};

// Add sorting state
let currentSort = {
    type: 'date',
    direction: 'desc'
};

// Fetch listings from backend
async function fetchListings() {
    try {
        const response = await fetch('../backend/data/listings.json');
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        filteredListings = data;
        return data;
    } catch (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
}

// Add sorting function
function sortListings(listings) {
    return [...listings].sort((a, b) => {
        if (currentSort.type === 'date') {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return currentSort.direction === 'desc' ? dateB - dateA : dateA - dateB;
        } else {
            const priceA = Number(a.price.replace(/[^0-9.-]+/g, ""));
            const priceB = Number(b.price.replace(/[^0-9.-]+/g, ""));
            return currentSort.direction === 'desc' ? priceB - priceA : priceA - priceB;
        }
    });
}

// Initialize filters
function initializeFilters() {
    // Populate year dropdown
    const yearSelect = document.getElementById('year');
    const years = [...new Set(filteredListings.map(listing => listing.year))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Populate location dropdown
    const locationSelect = document.getElementById('location');
    const locations = [...new Set(filteredListings.map(listing => listing.location))].sort();
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });

    // Set up price range display
    const priceRange = document.getElementById('price-range');
    const priceDisplay = document.getElementById('price-display');
    priceRange.addEventListener('input', (e) => {
        const value = e.target.value;
        priceDisplay.textContent = `AED ${Number(value).toLocaleString()} - ${Number(filters.maxPrice).toLocaleString()}`;
        filters.minPrice = Number(value);
        applyFilters();
    });
}

// Create listing card
function createListingCard(listing) {
    return `
        <div class="listing-card">
            <a href="${listing.listingUrl}" 
               class="listing-link"
               target="_blank"
               rel="noopener noreferrer"
               title="View details on ${listing.source}">
                <div class="listing-image-container">
                    <img class="listing-image" 
                        src="${listing.imageUrl}" 
                        alt="${listing.title}"
                        loading="lazy">
                    <span class="listing-source-badge">${listing.source}</span>
                </div>
                <div class="listing-details">
                    <h3 class="listing-title">${listing.title}</h3>
                    <p class="listing-price">${listing.price}</p>
                    <p class="listing-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${listing.location}</span>
                    </p>
                    <span class="view-details">View Details →</span>
                </div>
            </a>
        </div>
    `;
}

// Render listings
function renderListings() {
    console.log('Rendering listings:', filteredListings);
    const container = document.getElementById('listings-container');
    
    if (!container) {
        console.error('Listings container not found!');
        return;
    }
    
    if (filteredListings.length === 0) {
        container.innerHTML = '<p class="no-listings">No listings found. Please try adjusting your filters.</p>';
        return;
    }
    
    const sortedListings = sortListings(filteredListings);
    container.innerHTML = sortedListings.map(createListingCard).join('');
    console.log('Listings rendered');
}

// Apply filters
function applyFilters() {
    const filtered = filteredListings.filter(listing => {
        const price = Number(listing.price.replace(/[^0-9.-]+/g, ""));
        const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;
        const matchesYear = !filters.year || listing.year === Number(filters.year);
        const matchesLocation = !filters.location || listing.location === filters.location;
        return matchesPrice && matchesYear && matchesLocation;
    });
    filteredListings = filtered;
    renderListings();
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('year').addEventListener('change', (e) => {
        filters.year = e.target.value;
        applyFilters();
    });

    document.getElementById('location').addEventListener('change', (e) => {
        filters.location = e.target.value;
        applyFilters();
    });

    // Add sorting event listeners
    document.getElementById('sort-date').addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('sort-date').classList.add('active');
        currentSort = { type: 'date', direction: 'desc' };
        applyFilters();
    });

    document.getElementById('sort-price').addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('sort-price').classList.add('active');
        currentSort = { type: 'price', direction: 'asc' };
        applyFilters();
    });
}

// Initialize the page
async function init() {
    console.log('Initializing app...');
    try {
        const listings = await fetchListings();
        filteredListings = listings;
        initializeFilters();
        setupEventListeners();
        renderListings();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
