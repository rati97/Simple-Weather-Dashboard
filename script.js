const apiKey = config.OPEN_WEATHER_API_KEY;


// function for getting weather data based on location
async function getWeatherData(city, stateCode, countryCode) {
  const query = `${city},${stateCode ? stateCode + ',' : ''}${countryCode}`;
  const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${apiKey}`;

  try {
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      throw new Error(`Error fetching geocoding data: ${geocodeResponse.status}`);
    }
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.length === 0) {
      throw new Error(`No coordinates found for the given location.`);
    }
    const { lat, lon } = geocodeData[0];

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Error fetching weather data: ${weatherResponse.status}`);
    }
    const weatherData = await weatherResponse.json();

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`Error fetching forecast data: ${forecastResponse.status}`);
    }
    const forecastData = await forecastResponse.json();

    return {
      weather: weatherData,
      forecast: forecastData,
    };
  } catch (error) {
    console.error(error);
  }
}

// in case of US, we need to show state code as well
const countrySelect = document.getElementById("country");
const stateContainer = document.getElementById("state-container");

countrySelect.addEventListener("change", (event) => {
if (event.target.value === "US") {
    stateContainer.style.display = "block";
} else {
    stateContainer.style.display = "none";
}
});


// function to convert weatherId into corresponding Emoji
function getWeatherEmoji(weatherId) {
  if (weatherId >= 200 && weatherId < 300) {
    return '⛈️'; // Thunderstorm
  } else if (weatherId >= 300 && weatherId < 400) {
    return '🌧️'; // Drizzle
  } else if (weatherId >= 500 && weatherId < 600) {
    return '🌦️'; // Rain
  } else if (weatherId >= 600 && weatherId < 700) {
    return '❄️'; // Snow
  } else if (weatherId >= 700 && weatherId < 800) {
    return '🌫️'; // Atmosphere (e.g., fog, mist)
  } else if (weatherId === 800) {
    return '☀️'; // Clear
  } else if (weatherId >= 801 && weatherId < 805) {
    return '⛅'; // Clouds
  } else {
    return '❓'; // Unknown weather condition
  }
}


// function for getting and updating weather data in html
async function updateWeather() {

  const countrySelect = document.getElementById('country');
  const cityInput = document.getElementById('city');
  const stateInput = document.getElementById('state');

  const country = countrySelect.value;
  const city = cityInput.value;
  const state = stateInput.value || '';

  try {
    const weatherData = await getWeatherData(city, state, country);
    console.log(weatherData.forecast);

    // Update the current weather information in the HTML
    document.getElementById('location').textContent = `${weatherData.weather.name}, ${weatherData.weather.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(weatherData.weather.main.temp)}°C`;
    document.getElementById('weather-description').textContent = weatherData.weather.weather[0].description;
    document.getElementById('humidity').textContent = `Humidity: ${weatherData.weather.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `Wind Speed: ${weatherData.weather.wind.speed} m/s`;

    const weatherId = weatherData.weather.weather[0].id;
    const weatherEmoji = getWeatherEmoji(weatherId);
    document.getElementById('weather-icon').textContent = weatherEmoji;


    // Update the forecast information in the HTML
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear the existing forecast data

    const dailyForecasts = weatherData.forecast.list.filter((forecast) => {
      const dateTime = new Date(forecast.dt_txt);
      return dateTime.getHours() === 12;
    });

    dailyForecasts.forEach((forecast, index) => {
      const date = new Date(forecast.dt_txt);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // You can customize this part to display the forecast data as you prefer
      const forecastElement = document.createElement('div');
      forecastElement.classList.add('forecast-item');
      forecastElement.innerHTML = `
        <h3>${dateString}</h3>
        <p>${Math.round(forecast.main.temp)}°C</p>
        <p>${forecast.weather[0].description}</p>
        <span>${getWeatherEmoji(forecast.weather[0].id)}</span>
      `;

      forecastContainer.appendChild(forecastElement);
    });

  } catch (error) {
    console.error(error);
  }
}

// add event to submit button (when we click the button weather data gets updated)
document.getElementById('submit').addEventListener('click', updateWeather);

  