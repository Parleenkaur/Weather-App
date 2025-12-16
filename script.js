const baseUrl = "https://api.weatherapi.com/v1";
let isFahrenheit = true;

$(document).ready(() => {
    buildDropDown();
    
    // Click event for Get Weather button
    $("#getWeather").on("click", () => {
        handleEvent();
    });
    
    // Allow Enter key to trigger search
    $("#locationInput").on("keypress", (e) => {
        if (e.which === 13) {
            handleEvent();
        }
    });
});

function selectDays() {
    handleEvent();
}

function handleEvent() {
    const locationInput = $("#locationInput").val();
    const forecastDays = $("#dropdown").val();
    
    if (locationInput.trim()) {
        // Hide error message if visible
        $("#errorMessage").hide();
        // Show loading spinner
        showLoading();
        getData(locationInput, forecastDays);
    } else {
        showError("Please enter a city name or zip code.");
    }
    
    updateUnitDisplay();
}

function updateUnitDisplay() {
    if (isFahrenheit) {
        $("#f").addClass("selected-unit");
        $("#c").removeClass("selected-unit");
    } else {
        $("#c").addClass("selected-unit");
        $("#f").removeClass("selected-unit");
    }
}

function showLoading() {
    $("#loading").css("display", "flex");
    $("#currentWeather").hide();
    $("#forecast").hide();
}

function hideLoading() {
    $("#loading").hide();
}

function showError(message) {
    hideLoading();
    $("#errorText").text(message);
    $("#errorMessage").css("display", "flex");
    $("#currentWeather").hide();
    $("#forecast").hide();
}

let getData = function (location, forecastDays) {
    $.ajax({
        url: baseUrl + "/forecast.json",
        method: "GET",
        data: {
            key: "bc6252b2fac1434d90d32206250301",
            q: location,
            days: forecastDays
        },
        success: handleSuccess,
        error: handleError
    });
};

function handleError(xhr, status, error) {
    hideLoading();
    
    // Parse error response if available
    let errorMessage = "Unable to fetch weather data. Please try again.";
    
    if (xhr.responseJSON && xhr.responseJSON.error) {
        const apiError = xhr.responseJSON.error;
        
        // Handle specific API error codes
        switch (apiError.code) {
            case 1006:
                errorMessage = "Location not found. Please check the spelling and try again.";
                break;
            case 1003:
                errorMessage = "Please enter a valid city name or zip code.";
                break;
            case 2006:
            case 2007:
            case 2008:
                errorMessage = "API key issue. Please contact support.";
                break;
            case 9999:
                errorMessage = "Weather service is temporarily unavailable. Please try again later.";
                break;
            default:
                errorMessage = apiError.message || "An error occurred. Please try again.";
        }
    } else if (xhr.status === 0) {
        errorMessage = "Network error. Please check your internet connection.";
    } else if (xhr.status === 401) {
        errorMessage = "Authentication failed. Please check API configuration.";
    } else if (xhr.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
    }
    
    showError(errorMessage);
}

function handleSuccess(data) {
    hideLoading();
    $("#errorMessage").hide();
    $("#currentWeather").css("display", "block");
    $("#forecast").css("display", "block");
    handleCurrent(data);
    handleForecast(data);
}

function handleCurrent(weatherData) {
    const current = weatherData.current;
    const location = weatherData.location;
    
    // Temperature
    const temp = isFahrenheit 
        ? Math.round(current.temp_f) + "°F" 
        : Math.round(current.temp_c) + "°C";
    $("#temp").text(temp);
    
    // Location
    $("#cityName").text(`${location.name}, ${location.region}, ${location.country}`);
    
    // Condition
    $("#condition").text(current.condition.text);
    
    // Icon
    $("#icon").attr("src", "https:" + current.condition.icon.replace("64x64", "128x128"));
    $("#icon").attr("alt", current.condition.text);
    
    // Additional details
    $("#humidity").text(current.humidity + "%");
    
    const windSpeed = isFahrenheit 
        ? Math.round(current.wind_mph) + " mph" 
        : Math.round(current.wind_kph) + " km/h";
    $("#wind").text(windSpeed);
    
    const feelsLike = isFahrenheit 
        ? Math.round(current.feelslike_f) + "°F" 
        : Math.round(current.feelslike_c) + "°C";
    $("#feelsLike").text(feelsLike);
    
    $("#uvIndex").text(current.uv);
    
    // Last updated time
    const lastUpdated = new Date(current.last_updated);
    const timeString = lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    $("#lastUpdated").text(`Updated: ${timeString}`);
}

function handleForecast(weatherData) {
    const forecastDays = weatherData.forecast.forecastday;
    const $forecastCards = $("#forecastCards");
    
    // Clear previous forecast
    $forecastCards.empty();
    
    // Days of week for display
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    forecastDays.forEach((day, index) => {
        const date = new Date(day.date + 'T00:00:00');
        const dayName = index === 0 ? 'Today' : daysOfWeek[date.getDay()];
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const temp = isFahrenheit 
            ? Math.round(day.day.avgtemp_f) + "°F" 
            : Math.round(day.day.avgtemp_c) + "°C";
        
        const icon = "https:" + day.day.condition.icon;
        const condition = day.day.condition.text;
        
        const cardHTML = `
            <div class="forecast-card">
                <div class="date">
                    ${formattedDate}
                    <span class="day-name">${dayName}</span>
                </div>
                <img src="${icon}" alt="${condition}">
                <div class="forecast-temp">${temp}</div>
                <div class="forecast-condition">${condition}</div>
            </div>
        `;
        
        $forecastCards.append(cardHTML);
    });
}

function buildDropDown() {
    const $dropdown = $("#dropdown");
    
    // Note: Free API tier only supports up to 3 days
    // Adding option to show this limitation
    for (let i = 1; i <= 3; i++) {
        const selected = i === 3 ? 'selected' : '';
        $dropdown.append(`<option value="${i}" ${selected}>${i} day${i > 1 ? 's' : ''}</option>`);
    }
}

function updateUnit(flag) {
    isFahrenheit = flag;
    handleEvent();
}
