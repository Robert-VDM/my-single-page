const fs = require('fs');
const path = require('path');

async function updateData() {
  // Safety Beach, VIC coordinates
  const lat = -38.31;
  const lon = 145.00;

  // Example using Open-Meteo (replace with your existing weather/tide URLs if preferred)
  const weatherUrl = `https://open-meteo.com{lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&wind_speed_unit=kn&timezone=Australia%2FMelbourne&forecast_days=5`;

  // If you have a separate Tide API (e.g. WorldTides or Stormglass), fetch it here too:
  // const tideUrl = `https://worldtides.info{lat}&lon=${lon}&key=${process.env.TIDE_API_KEY}`;

  try {
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error(`Weather API failed: ${weatherRes.status}`);
    const weatherData = await weatherRes.json();

    // Bundle everything your page needs into one JSON object
    const payload = {
      updatedAt: new Date().toISOString(),
      weather: weatherData,
      // tides: tideData
    };

    // Ensure the data directory exists and write the file
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
    fs.writeFileSync(
      path.join(__dirname, '../data/weather.json'),
      JSON.stringify(payload, null, 2)
    );
    console.log('Successfully updated data/weather.json');
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1); // Fails the GitHub Action so old valid data isn't overwritten with errors
  }
}

updateData();
