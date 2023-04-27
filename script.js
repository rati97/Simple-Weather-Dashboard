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




  