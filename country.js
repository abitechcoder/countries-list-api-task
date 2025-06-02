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

// Get URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Fetch specific country by cca3 code
async function fetchCountryByCode(cca3) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const countryDetail = document.getElementById('countryDetail');

    loading.style.display = 'block';
    error.style.display = 'none';
    countryDetail.style.display = 'none';
    // console.log("CODE:", cca3);
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${cca3}`);
        // console.log("response:", response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const countryData = await response.json();
        const country = countryData[0]; // API returns an array

        displayCountryDetail(country);

    } catch (err) {
        console.error('Failed to fetch country:', err);
        error.style.display = 'block';
        error.textContent = 'Country not found. Please check the URL and try again.';
    } finally {
        loading.style.display = 'none';
    }
}

// Display country details
function displayCountryDetail(country) {
    const countryDetail = document.getElementById('countryDetail');

    // Get country details
    const nativeName = country.name.nativeName ?
        Object.values(country.name.nativeName)[0]?.common || country.name.common :
        country.name.common;

    const population = country.population ? formatNumber(country.population) : 'N/A';
    const region = country.region || 'N/A';
    const subregion = country.subregion || 'N/A';
    const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A';
    const tld = country.tld && country.tld.length > 0 ? country.tld[0] : 'N/A';

    const currencies = country.currencies ?
        Object.values(country.currencies).map(curr => curr.name).join(', ') : 'N/A';

    const languages = country.languages ?
        Object.values(country.languages).join(', ') : 'N/A';

    const borderCountries = country.borders || [];

    const flagUrl = country.flags?.svg || country.flags?.png || '';

    // Update page title
    document.title = `${country.name.common} - Country Details`;

    countryDetail.innerHTML = `
                <a href="index.html" class="back-button">
                    <i class="fa fa-arrow-left" aria-hidden="true"></i>
                    Back
                </a>
                
                <div class="country-detail-content">
                    <div class="flag-section">
                        <img src="${flagUrl}" alt="${country.name.common} flag" class="detail-flag" onerror="this.style.display='none'">
                    </div>
                    
                    <div class="info-section">
                        <h1 class="detail-country-name">${country.name.common}</h1>
                        
                        <div class="detail-info-grid">
                            <div class="info-column">
                                <div class="info-item">
                                    <span class="info-label">Native Name:</span>
                                    <span class="info-value">${nativeName}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Population:</span>
                                    <span class="info-value">${population}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Region:</span>
                                    <span class="info-value">${region}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Sub Region:</span>
                                    <span class="info-value">${subregion}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Capital:</span>
                                    <span class="info-value">${capital}</span>
                                </div>
                            </div>
                            
                            <div class="info-column">
                                <div class="info-item">
                                    <span class="info-label">Top Level Domain:</span>
                                    <span class="info-value">${tld}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Currencies:</span>
                                    <span class="info-value">${currencies}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Languages:</span>
                                    <span class="info-value">${languages}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${borderCountries.length > 0 ? `
                            <div class="border-countries">
                                <span class="border-label">Border Countries:</span>
                                <div class="border-tags">
                                    ${borderCountries.map(border => {
        const borderCountry = allCountries.find(c => c.cca3 === border);
        const borderName = borderCountry ? borderCountry.name.common : border;
        return `<a href="country.html?country=${border}" class="border-tag">${borderName}</a>`;
    }).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

    countryDetail.style.display = 'block';
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    loadDarkModePreference();
    // Get country code from URL parameter
    const countryCode = getUrlParameter('country');

    if (!countryCode) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'No country code provided in URL. Please add ?country=CODE to the URL.';
        return;
    }
    fetchCountryByCode(countryCode);
});