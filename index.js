const mykey = '595a9c68fd968997e445bae48b0e50aa'; // My key for get weather data

let Bar = null; 
let Doughnut = null; 
let Line= null; 
let temp10=null;
//Added a line to for githib commit 

// When button click, go do this
document.getElementById('inputbtn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value; // Get city from user box
    if (city) { 
        getdetails(city); // Go get details of city
    }
    else{ // If city empty
        alert("Please input a city."); // Tell user to put city
    }
});

// Function to get details of city weather
function getdetails(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${mykey}&units=metric`; // Make long URL for weather
    fetch(url) 
        .then(response => response.json()) // Turn response to JSON, like magic
        .then(data => { 
            displaydetails(data); // Show details on screen
            getcoordinates(city); // Get coordinates of city too
        })
        .catch(error => { // If something wrong
            console.log("Error fetching weather data:", error); // Show error in console
            alert("Please enter a valid city."); // Tell user bad city
        });
}

// Function to show weather details
function displaydetails(data) {
    const city = data.name; // Get city name from data
    const weather = data.weather[0].description; // Get weather condition
    const temp = data.main.temp; // Get temperature
    const humidity = data.main.humidity; // Get humidity level

    document.getElementById('city-name').innerText = `City: ${city}`; 
    document.getElementById('weather-description').innerText = `Weather: ${weather}`; 
    document.getElementById('temperature').innerText = `Temperature: ${temp} °C`; 
    document.getElementById('humidity').innerText = `Humidity: ${humidity}%`;
    updateWidgetBackground(weather); 
}

// Change background based on weather
function updateWidgetBackground(weatherDescription) {
    const widget = document.querySelector('.widget'); // Get widget element
    
    // If clear weather, put sunny picture
    if (weatherDescription.includes('clear')) {
        widget.style.backgroundImage = "url('imgs/sunny.jpeg')"; // Sunny background
    } else if (weatherDescription.includes('cloud')) { 
        widget.style.backgroundImage = "url('imgs/cloudy.jpeg')"; // Cloudy background
    } else if (weatherDescription.includes('rain')) { 
        widget.style.backgroundImage = "url('imgs/rainy.jpg')"; // Rainy background
    } else if (weatherDescription.includes('snow')) { 
        widget.style.backgroundImage = "url('imgs/snowy.jpeg')"; // Snowy background
    } else if (weatherDescription.includes('thunderstorm')) { 
        widget.style.backgroundImage = "url('imgs/stormy.jpeg')"; // Stormy background
    }
    else if (weatherDescription.includes('smoke')) { 
        widget.style.backgroundImage = "url('imgs/smoke.jpeg')"; // Smoke background
    }  
}

// Get coordinates for city
function getcoordinates(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${mykey}`; 
    fetch(url) // Fetch data from this URL
        .then(response => response.json()) // Turn response into JSON
        .then(data => { // When got data
            const { lat, lon } = data.coord; // Get latitude and longitude
            getforecast(lat, lon); // Now go get forecast using coordinates
        })
        .catch(error => { // If error happen
            console.log("Error fetching weather data:", error); 
            alert("Please enter a valid city."); 
        });
}

// Function to get weather forecast
function getforecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${mykey}&units=metric`; // Make forecast URL
    fetch(url) // Fetch forecast data
        .then(response => response.json()) // Turn response into JSON
        .then(data => { // When got forecast data
            const details = data.list.filter((reading, index) => index % 8 === 0); // Filter data, take every 8th reading
            displayforecast(details); // Show the filtered forecast data
        })
        .catch(error => console.log("Error fetching forecast data:", error)); // If error, show in console
}

// Function to display forecast
function displayforecast(details) {
    const tempData = details.map(reading => reading.main.temp); // Get temperature for each reading
    const weatherConditions = details.map(reading => reading.weather[0].main); // Get weather condition for each reading
    const labels = details.map(reading => new Date(reading.dt_txt).toLocaleDateString()); // Get dates for each reading

    BarChart(tempData, labels); // Call function to make bar chart
    DoughnutChart(weatherConditions); // Call function to make doughnut chart
    LineChart(tempData, labels); // Call function to make line chart
}

// Function to make bar chart
function BarChart(tempData, labels) {
    const ctx = document.getElementById('barChart').getContext('2d'); // Get context for bar chart
    if (Bar !== null) { // If bar chart already there
        Bar.destroy(); // Destroy old chart first
    }
    Bar = new Chart(ctx, { // Make new bar chart
        type: 'bar', // Bar chart type
        data: {
        labels: labels, // Labels for bars
        datasets: [{
        label: 'Temperature (°C)', data: tempData, backgroundColor: 'rgba(0, 0, 255, 0.2)',borderColor: 'rgba(0, 0, 255, 1)',borderWidth: 1}] // Data for bars
        },
        options: {
        animation: { duration: 2000, }, // Animation for chart
            scales: { y: { beginAtZero: true}} // Start Y axis at zero
        }
    });
}

// Function to make doughnut chart
function DoughnutChart(weatherConditions) {
    const conditionCounts = weatherConditions.reduce((acc, condition) => { // Count how many of each condition
        acc[condition] = (acc[condition] || 0) + 1; // Count conditions
        return acc; // Return counts
    }, {});

    const ctx = document.getElementById('doughnutChart').getContext('2d'); // Get context for doughnut chart
    if (Doughnut !== null) { // If doughnut chart already there
        Doughnut.destroy(); // Destroy old chart first
    }
    Doughnut = new Chart(ctx, { // Make new doughnut chart
        type: 'doughnut', // Doughnut chart type
        data: {
            labels: Object.keys(conditionCounts), // Labels for doughnut
            datasets: [{
                data: Object.values(conditionCounts),backgroundColor: ['#ADD8E6', '#90EE90', '#F0E68C', '#FFB6C1', '#FFD700'], }] // Data for doughnut
        },
        options: {
            animation: {duration: 2000,} // Animation for chart
        }
    });
}

// Function to make line chart
function LineChart(tempData, labels) {
    const ctx = document.getElementById('lineChart').getContext('2d'); // Get context for line chart

    if (Line !== null) { // If line chart already there
        Line.destroy(); // Destroy old chart first
    }

    Line = new Chart(ctx, { // Make new line chart
        type: 'line', // Line chart type
        data: {
            labels: labels, // Labels for line
            datasets: [{
                label: 'Temperature (°C)',data: tempData,fill: false,borderColor: 'rgba(0, 0, 0, 1)', tension: 0.1 // Data for line chart
            }]
        },
        options: {
            animation: {onComplete: function () {this.options.animation = { duration: 1000 };} } // Animation for line chart
        }
    });
}
