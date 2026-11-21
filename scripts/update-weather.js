const fs = require('fs');

const LAT = -38.308;
const LON = 144.996;
const TIMEZONE = 'Australia/Melbourne';

const API_URL = https://open-meteo.com{LAT}&longitude=${LON}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=sunset&wind_speed_unit=kn&timezone=${encodeURIComponent(TIMEZONE)}&forecast_days=1;

function degToCompass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-AU', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

async function run() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(Weather API error: ${res.status});
  const data = await res.json();

  const temp = Math.round(data.current.temperature_2m);
  const windKn = Math.round(data.current.wind_speed_10m);
  const gustKn = Math.round(data.current.wind_gusts_10m);
  const windDir = degToCompass(data.current.wind_direction_10m);
  const sunsetTime = formatTime(data.daily.sunset[0]);

  const updatedAt = new Date().toLocaleString('en-AU', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const renderedSummary = `<!-- WEATHER_SUMMARY_START -->
<div class="weather-summary" data-updated="${new Date().toISOString()}">
  <p><strong>Now · Safety Beach:</strong> ${temp}°C · Wind ${windDir} ${windKn} kn (gusts ${gustKn} kn) · Sunset ${sunsetTime}</p>
  <p class="update-note"><small>BOM ACCESS-G model estimate updated ${updatedAt} AEDT</small></p>
</div>
<!-- WEATHER_SUMMARY_END -->`;

  let html = fs.readFileSync('index.html', 'utf8');
  const pattern = /<!-- WEATHER_SUMMARY_START -->[\s\S]*?<!-- WEATHER_SUMMARY_END -->/;

  if (!pattern.test(html)) {
    throw new Error('Could not find WEATHER_SUMMARY markers in index.html');
  }

  html = html.replace(pattern, renderedSummary);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Updated Martha Cove weather in index.html');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
