const mykey = '595a9c68fd968997e445bae48b0e50aa'; // This is my API key for weather data

let forecastData = []; // This is empty list for weather data
let currentPage = 1; // This is the current page for the table
const rowsPerPage = 10; // This is how many rows show in one page

// When button clicked, do this
document.getElementById('inputbtn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value; // Get city from input
    if (city) {
        getcoordinates(city); // If city is there, get coordinates
    }
    else {
        alert("Please input a city."); // Show alert if city is empty
    }
});

// Function to get city coordinates
function getcoordinates(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${mykey}`; // Make URL for weather API

    fetch(url) // Get data from URL
        .then(response => response.json()) // Convert response to JSON
        .then(data => {
            const { lat, lon } = data.coord; // Get latitude and longitude
            getforecast(lat, lon); // Get forecast using latitude and longitude
        })
        .catch(error => {
            console.log("Error fetching weather data:", error); // Log error if fetch fail
            alert("Please enter a valid city."); // Alert if there is an error
        });
}

// Function to get forecast data
function getforecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${mykey}&units=metric`; // Make URL for forecast API

    fetch(url) // Get forecast data
        .then(response => response.json()) // Convert response to JSON
        .then(data => {
            forecastData = data.list; // Save forecast data in the list
            displayTable(currentPage); // Show table with current page
        })
        .catch(error => console.log("Error fetching forecast data:", error)); // Log error if fetch fail
}

// Function to display the table
function displayTable(page) {
    const tableBody = document.getElementById('tableBody'); // Get table body element
    tableBody.innerHTML = ''; // Clear table first
    const startIndex = (page - 1) * rowsPerPage; // Calculate start index for pagination
    const endIndex = startIndex + rowsPerPage; // Calculate end index for pagination
    const paginatedData = forecastData.slice(startIndex, endIndex); // Get data for the current page

    // Loop through data for current page
    paginatedData.forEach(entry => {
        const row = document.createElement('tr'); // Create new table row
        row.innerHTML = `
            <td>${new Date(entry.dt_txt).toLocaleDateString()}</td> 
            <td>${entry.main.temp.toFixed(1)} °C</td> 
            <td>${entry.weather[0].description}</td> 
            <td>${entry.main.humidity}%</td>
        `;
        tableBody.appendChild(row); // Add row to table body
    });

    updatePaginationDisplay(); // Update pagination display
}

// Pagination controls
document.getElementById('nextBtn').addEventListener('click', () => {
    if ((currentPage * rowsPerPage) < forecastData.length) { // Check if there is next page
        currentPage++; // Go to next page
        displayTable(currentPage); // Show new page
    }
});

document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentPage > 1) { // Check if not on first page
        currentPage--; // Go to previous page
        displayTable(currentPage); // Show new page
    }
});

// Function to update pagination display
function updatePaginationDisplay() {
    document.getElementById('pageDisplay').innerText = `Page ${currentPage}`; // Show current page number
}

// Sort buttons
document.getElementById('sortAsc').addEventListener('click', () => {
    forecastData.sort((a, b) => a.main.temp - b.main.temp); // Sort temperatures from low to high
    currentPage = 1; // Reset to first page
    displayTable(currentPage); // Show new table
});

// Sort temperatures in descending order
document.getElementById('sortDesc').addEventListener('click', () => {
    forecastData.sort((a, b) => b.main.temp - a.main.temp); // Sort temperatures from high to low
    currentPage = 1; // Reset to first page
    displayTable(currentPage); // Show new table
});

// Filter out days without rain
document.getElementById('filterRain').addEventListener('click', () => {
    const rainyDays = forecastData.filter(entry => entry.weather[0].description.includes('rain')); // Get only rainy days
    forecastData = rainyDays; // Update forecast data to only rainy days
    currentPage = 1; // Reset to first page
    displayTable(currentPage); // Show new table
});

// Show day with highest temperature
document.getElementById('highestTemp').addEventListener('click', () => {
    const highestTempDay = forecastData.reduce((max, entry) => { // Find day with highest temp
        return entry.main.temp > max.main.temp ? entry : max; // Compare temperatures
    });
    forecastData = [highestTempDay]; // Keep only the highest temp day
    currentPage = 1; // Reset to first page
    displayTable(currentPage); // Show new table
});

const geminiApiKey = 'AIzaSyBJes4y0RxGgnZYyHksAU2khjl0NFYs2Tg'; // This is Gemini API key

// Chatbot send button
document.getElementById('chatbot-send-btn').addEventListener('click', () => {
    const userQuery = document.getElementById('chatbot-input').value.trim().toLowerCase(); // Get user input and clean it

    if (userQuery) { // Check if user input is not empty
        displayUserMessage(userQuery); // Show the user's message in chat
        processQuery(userQuery); // Process the query
        document.getElementById('chatbot-input').value = ''; // Clear the input
    }
});

// Function to process user query
function processQuery(query) {
    if (query.includes("weather")) { // Check if query is about weather
        const city = extractCityFromQuery(query); // Extract city from query
        if (city) {
            getWeatherData(city); // Get weather data for the city
        } else {
            displayBotMessage("Please provide a city name for the weather information."); // Ask for city if not found
        }
    } else {
        handleNonWeatherQuery(query); // Handle other queries using Gemini API
    }
}

// Function to extract city from user query
function extractCityFromQuery(query) {
    const match = query.match(/weather in (\w+)/); // Try to match city name
    return match ? match[1] : null; // Return city name or null
}

// Function to fetch weather data
function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${mykey}&units=metric`; // Make URL for weather API

    fetch(apiUrl) // Get weather data
        .then(response => response.json()) // Convert response to JSON
        .then(data => {
            if (data.cod === 200) { // Check if response is OK
                const weatherDescription = data.weather[0].description; // Get weather description
                const temperature = data.main.temp; // Get temperature
                const cityName = data.name; // Get city name
                displayBotMessage(`The weather in ${cityName} is ${weatherDescription} with a temperature of ${temperature}°C.`); // Show weather info
            } else {
                displayBotMessage("Sorry, I couldn't find weather information for that city."); // Show error message
            }
        })
        .catch(error => {
            console.log("Error fetching weather data:", error); // Log error if fetch fail
            displayBotMessage("There was an error fetching the weather data. Please try again later."); // Show error message
        });
}

// Function to handle non-weather-related queries
function handleNonWeatherQuery(userQuery) {
    const apiUrl = `https://api.google.dev/gemini/v1/query`; // Make URL for Gemini API
    const requestBody = {
        "query": userQuery, // User's query
        "key": geminiApiKey // API key for Gemini
    };

    fetch(apiUrl, { // Send request to Gemini API
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody) // Convert request body to JSON
    })
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        const botResponse = data.answer || "I am currently able to answer weather-related queries."; // Get response or default message
        displayBotMessage(botResponse); // Show bot response
    })
    .catch(error => {
        console.log("Error fetching non-weather data:", error); // Log error if fetch fail
        displayBotMessage("I am currently able to answer weather-related queries."); // Show default message
    });
}

// Function to display user message in chat
function displayUserMessage(message) {
    const chatArea = document.getElementById('chatbot-messages');
    const userMessage = `<div class="user-message">${message}</div>`; 
    chatArea.innerHTML += userMessage; // Add user message to chat area
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom of chat
}

// Function to display bot message in chat
function displayBotMessage(message) {
    const chatArea = document.getElementById('chatbot-messages'); 
    const botMessage = `<div class="bot-message">${message}</div>`; 
    chatArea.innerHTML += botMessage; // Add bot message to chat area
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom of chat
}
