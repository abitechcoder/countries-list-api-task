let allCountries = [];
let filteredCountries = [];

// Dark mode functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    document.getElementById('mode-icon').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    document.getElementById('mode-text').textContent = isDark ? 'Light Mode' : 'Dark Mode';

    // Save preference
    localStorage.setItem('darkMode', isDark);
}

// Load dark mode preference
function loadDarkModePreference() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.getElementById('mode-icon').innerHTML = '<i class="fas fa-sun"></i>';
        document.getElementById('mode-text').textContent = 'Light Mode';
    }
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString();
}

// Create country card HTML
function createCountryCard(country) {
    const population = country.population ? formatNumber(country.population) : 'N/A';
    const region = country.region || 'N/A';
    const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A';
    const flagUrl = country.flags?.png || country.flags?.svg || '';
    const name = country.name?.common || 'Unknown';

    return `
                <a class="country-card" href="./country.html?country=${country.cca3}">
                    <img src="${flagUrl}" alt="${name} flag" class="flag-img" onerror="this.style.display='none'">
                    <div class="country-info">
                        <h3 class="country-name">${name}</h3>
                        <div class="country-details">
                            <div class="country-detail">
                                <span class="detail-label">Population:</span> ${population}
                            </div>
                            <div class="country-detail">
                                <span class="detail-label">Region:</span> ${region}
                            </div>
                            <div class="country-detail">
                                <span class="detail-label">Capital:</span> ${capital}
                            </div>
                        </div>
                    </div>
                </a>
            `;
}

// Render countries
function renderCountries(countries) {
    const grid = document.getElementById('countriesGrid');

    if (countries.length === 0) {
        grid.innerHTML = '<div class="error">Sorry, no countries found.</div>';
        return;
    }

    grid.innerHTML = countries.map(createCountryCard).join('');
}

// Fetch countries from API
async function fetchCountries() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    loading.style.display = 'block';
    error.style.display = 'none';

    try {
        const response = await fetch('https://restcountries.com/v3.1/all');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allCountries = await response.json();

        // Sort countries alphabetically
        allCountries.sort((a, b) =>
            (a.name.common || '').localeCompare(b.name.common || '')
        );

        filteredCountries = [...allCountries];
        renderCountries(filteredCountries);

    } catch (err) {
        console.error('Failed to fetch countries:', err);
        error.style.display = 'block';
        error.textContent = 'Failed to load countries. Please check your internet connection and try again.';
    } finally {
        loading.style.display = 'none';
    }
}

// Filter countries
function filterCountries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedRegion = document.getElementById('regionFilter').value;

    filteredCountries = allCountries.filter(country => {
        const matchesSearch = !searchTerm ||
            country.name.common.toLowerCase().includes(searchTerm) ||
            (country.capital && country.capital.some(cap => cap.toLowerCase().includes(searchTerm)));

        const matchesRegion = !selectedRegion || country.region === selectedRegion;

        return matchesSearch && matchesRegion;
    });

    renderCountries(filteredCountries);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterCountries);
document.getElementById('regionFilter').addEventListener('change', filterCountries);

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    loadDarkModePreference();
    fetchCountries();
});

// Handle search input with debouncing for better performance
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterCountries, 300);
});