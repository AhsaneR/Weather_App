/* ===========================================================
   SkyCast — a weather app
   - Type a city name and get live weather data
   - Uses the free Open-Meteo API (no API key required)
   - Two API calls:
       1) Geocoding API  -> turns a city name into coordinates
       2) Forecast API   -> gets weather for those coordinates
   - Shows current conditions + a 5-day forecast
   - Handles loading and error states
   =========================================================== */

// --- Elements ---
const cityInput   = document.getElementById("cityInput");
const searchBtn   = document.getElementById("searchBtn");
const loadingEl   = document.getElementById("loading");
const errorEl     = document.getElementById("error");
const hintEl      = document.getElementById("hint");
const weatherEl   = document.getElementById("weather");

const currentIcon = document.getElementById("currentIcon");
const currentCity = document.getElementById("currentCity");
const currentDesc = document.getElementById("currentDesc");
const currentTemp = document.getElementById("currentTemp");
const feelsLike   = document.getElementById("feelsLike");
const humidity    = document.getElementById("humidity");
const wind        = document.getElementById("wind");
const forecastEl  = document.getElementById("forecast");

/* Map WMO weather codes to an emoji + short text.
   (These codes come from the Open-Meteo API.) */
const weatherCodes = {
  0:  { icon: "☀️", text: "Clear sky" },
  1:  { icon: "🌤️", text: "Mainly clear" },
  2:  { icon: "⛅", text: "Partly cloudy" },
  3:  { icon: "☁️", text: "Overcast" },
  45: { icon: "🌫️", text: "Fog" },
  48: { icon: "🌫️", text: "Rime fog" },
  51: { icon: "🌦️", text: "Light drizzle" },
  53: { icon: "🌦️", text: "Drizzle" },
  55: { icon: "🌦️", text: "Heavy drizzle" },
  61: { icon: "🌧️", text: "Light rain" },
  63: { icon: "🌧️", text: "Rain" },
  65: { icon: "🌧️", text: "Heavy rain" },
  71: { icon: "🌨️", text: "Light snow" },
  73: { icon: "🌨️", text: "Snow" },
  75: { icon: "❄️", text: "Heavy snow" },
  80: { icon: "🌦️", text: "Rain showers" },
  81: { icon: "🌧️", text: "Rain showers" },
  82: { icon: "⛈️", text: "Violent showers" },
  95: { icon: "⛈️", text: "Thunderstorm" },
  96: { icon: "⛈️", text: "Thunderstorm + hail" },
  99: { icon: "⛈️", text: "Thunderstorm + hail" }
};

// Look up a code; fall back to a neutral icon if it is unknown
function describeWeather(code) {
  return weatherCodes[code] || { icon: "🌡️", text: "Unknown" };
}

// --- Show only one "state" panel at a time ---
function showState({ loading = false, error = "", weather = false, hint = false }) {
  loadingEl.hidden = !loading;
  weatherEl.hidden = !weather;
  hintEl.hidden    = !hint;
  errorEl.hidden   = error === "";
  if (error) errorEl.textContent = error;
}

// --- Main function: get weather for the typed city ---
async function getWeather() {
  const city = cityInput.value.trim();
  if (city === "") return;

  showState({ loading: true });

  try {
    // STEP 1: Turn the city name into latitude/longitude
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      showState({ error: `Could not find a city called "${city}". Please check the spelling.` });
      return;
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, country } = place;

    // STEP 2: Get the weather for those coordinates
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto`;

    const weatherRes = await fetch(weatherUrl);
    const data = await weatherRes.json();

    // Display everything
    renderCurrent(data.current, name, country);
    renderForecast(data.daily);

    showState({ weather: true });
  } catch (err) {
    // Runs if the network fails or something goes wrong
    console.error(err);
    showState({ error: "Something went wrong. Please check your internet connection and try again." });
  }
}

// --- Fill in the "current weather" section ---
function renderCurrent(current, name, country) {
  const w = describeWeather(current.weather_code);

  currentIcon.textContent = w.icon;
  currentCity.textContent = country ? `${name}, ${country}` : name;
  currentDesc.textContent = w.text;
  currentTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
  feelsLike.textContent   = `${Math.round(current.apparent_temperature)}°C`;
  humidity.textContent    = `${current.relative_humidity_2m}%`;
  wind.textContent        = `${Math.round(current.wind_speed_10m)} km/h`;
}

// --- Build the 5-day forecast cards ---
function renderForecast(daily) {
  forecastEl.innerHTML = "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Show the next 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(daily.time[i]);
    const w = describeWeather(daily.weather_code[i]);
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `
      <div class="forecast-day__name">${i === 0 ? "Today" : days[date.getDay()]}</div>
      <div class="forecast-day__icon">${w.icon}</div>
      <div class="forecast-day__temp"><strong>${max}°</strong> / ${min}°</div>
    `;
    forecastEl.appendChild(card);
  }
}

// --- Event listeners ---
searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});
