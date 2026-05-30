# SkyCast — Weather App

A weather application that fetches live data from a real API, built with HTML,
CSS, and vanilla JavaScript.

## Features
- Search the weather for any city in the world
- Shows current temperature, "feels like", humidity, and wind speed
- A 5-day forecast with high/low temperatures
- Weather icons based on conditions (sunny, rainy, snowy, etc.)
- Loading spinner and clear error messages
- Responsive design

## How it works
The app uses the free **Open-Meteo API** (no API key needed) in two steps:
1. The **Geocoding API** converts the city name you type into latitude and
   longitude coordinates.
2. The **Forecast API** uses those coordinates to fetch the current weather
   and the daily forecast.

This is done using JavaScript's `fetch` with `async/await`.

## How to run
1. Download this folder.
2. Open `index.html` in any web browser.

> **Note:** This app needs an internet connection because it fetches live
> weather data from the Open-Meteo API.

## Files
- `index.html` — page structure
- `style.css` — styling and layout
- `script.js` — API calls and the logic that displays the data
