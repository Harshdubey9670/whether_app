// OpenWeatherMap implementation
// Base URL: https://api.openweathermap.org/data/2.5

// @desc    Get current weather & forecast for a location
// @route   GET /api/weather/current?q=London
// @access  Private (or Public for now)
const getCurrentWeather = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      res.status(400);
      throw new Error('Please provide a location (q parameter)');
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const generateMock15Day = (baseTemp) => {
      const forecast = [];
      const conditions = ['Sunny', 'Cloudy', 'Partly cloudy', 'Light rain', 'Heavy rain', 'Thunderstorm'];
      for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecast.push({
          date: date.toISOString().split('T')[0],
          day: {
            maxtemp_c: baseTemp + Math.round(Math.random() * 5),
            mintemp_c: baseTemp - 5 - Math.round(Math.random() * 5),
            condition: { text: conditions[Math.floor(Math.random() * conditions.length)] },
            daily_chance_of_rain: Math.round(Math.random() * 80)
          },
          hour: i === 0 ? Array.from({length: 8}).map((_, j) => ({
            time: new Date(date.getTime() + j * 3 * 3600000).toISOString(),
            temp_c: baseTemp + Math.round(Math.sin(j) * 3)
          })) : []
        });
      }
      return forecast;
    };

    if (!apiKey || apiKey === 'your_weather_api_key_here') {
      return res.json({
        mock: true,
        location: { name: q?.includes(',') ? 'Current Location' : (q || 'Unknown'), country: 'Mock Country' },
        current: { temp_c: 24, condition: { text: 'Sunny' }, humidity: 65, wind_kph: 12, vis_km: 10, uv: 5, pressure_mb: 1012, aqi: 42, sunrise: '06:30 AM', sunset: '07:15 PM', moon_phase: 'Waxing Crescent' },
        forecast: { forecastday: generateMock15Day(24) }
      });
    }

    let queryParam = `q=${encodeURIComponent(q)}`;
    let locationNameOverride = null;
    let countryOverride = null;

    if (q.includes(',')) {
      const [lat, lon] = q.split(',');
      const cleanLat = encodeURIComponent(lat.trim());
      const cleanLon = encodeURIComponent(lon.trim());
      queryParam = `lat=${cleanLat}&lon=${cleanLon}`;

      // Perform highly accurate reverse geocoding using Nominatim (OpenStreetMap) to get exact neighborhood/suburb
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${cleanLat}&lon=${cleanLon}&zoom=14`;
        const geoRes = await fetch(geoUrl, {
          headers: {
            'User-Agent': 'WeatherVerse-App/1.0 (harshdubey112005@example.com)' // required by Nominatim policy
          }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.address) {
            const addr = geoData.address;
            const exactPlace = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.city;
            const broaderPlace = addr.city || addr.state_district || addr.state;
            
            if (exactPlace && broaderPlace && exactPlace !== broaderPlace) {
              locationNameOverride = `${exactPlace}, ${broaderPlace}`;
            } else if (exactPlace) {
              locationNameOverride = exactPlace;
            } else if (geoData.name) {
              locationNameOverride = geoData.name;
            }
            countryOverride = addr.country;
          }
        }
      } catch (e) {
        console.warn('Reverse geocoding failed, falling back to weather station name');
      }
    }

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?${queryParam}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${queryParam}&appid=${apiKey}&units=metric`;
    
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      console.warn(`OpenWeatherMap returned an error: Falling back to mock data.`);
      return res.json({
        mock: true,
        location: { name: q?.includes(',') ? 'Current Location' : (q || 'Unknown'), country: 'Mock Country' },
        current: { temp_c: 24, condition: { text: 'Sunny' }, humidity: 65, wind_kph: 12, vis_km: 10, uv: 5, pressure_mb: 1012, aqi: 42, sunrise: '06:30 AM', sunset: '07:15 PM', moon_phase: 'Waxing Crescent' },
        forecast: { forecastday: generateMock15Day(24) }
      });
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    const formatTime = (unix) => new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

    const mappedData = {
      location: { 
        name: locationNameOverride || currentData.name || (q.includes(',') ? 'Current Location' : q), 
        country: countryOverride || currentData.sys.country 
      },
      current: { 
        temp_c: Number(currentData.main.temp.toFixed(1)), 
        condition: { text: currentData.weather[0].main }, 
        humidity: currentData.main.humidity, 
        wind_kph: Number((currentData.wind.speed * 3.6).toFixed(1)), 
        vis_km: Number((currentData.visibility / 1000).toFixed(1)) || 10, 
        uv: Math.round(Math.random() * 10), // Mocked for Free Tier
        pressure_mb: currentData.main.pressure,
        aqi: Math.round(Math.random() * 100 + 20), // Mocked for Free Tier
        sunrise: formatTime(currentData.sys.sunrise),
        sunset: formatTime(currentData.sys.sunset),
        moon_phase: moonPhases[Math.floor(Math.random() * moonPhases.length)] // Mocked
      },
      forecast: {
        forecastday: generateMock15Day(Math.round(currentData.main.temp)) // Using mock extrapolated data for UI purposes
      }
    };

    // Replace the first day with actual data
    mappedData.forecast.forecastday[0].day.maxtemp_c = Number(currentData.main.temp_max.toFixed(1));
    mappedData.forecast.forecastday[0].day.mintemp_c = Number(currentData.main.temp_min.toFixed(1));
    mappedData.forecast.forecastday[0].day.condition.text = currentData.weather[0].main;
    mappedData.forecast.forecastday[0].hour = forecastData.list.slice(0, 8).map(item => ({
      time: item.dt_txt,
      temp_c: Number(item.main.temp.toFixed(1))
    }));

    res.json(mappedData);
  } catch (error) {
    console.warn(`Weather fetch failed: Falling back to mock data.`, error);
    return res.json({
      mock: true,
      location: { name: req.query.q?.includes(',') ? 'Current Location' : (req.query.q || 'Unknown'), country: 'Mock Country' },
      current: { temp_c: 24, condition: { text: 'Sunny' }, humidity: 65, wind_kph: 12, vis_km: 10, uv: 5, pressure_mb: 1012, aqi: 42, sunrise: '06:30 AM', sunset: '07:15 PM', moon_phase: 'Waxing Crescent' },
      forecast: { forecastday: [] }
    });
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/weather/search?q=Lond
// @access  Public
const searchLocation = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_weather_api_key_here') {
      return res.json([{ id: 1, name: 'Mock City', country: 'Mock Country' }]);
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`OpenWeatherMap returned ${response.status}: Falling back to mock data.`);
      return res.json([{ id: 1, name: 'Mock City', country: 'Mock Country' }]);
    }
    
    const data = await response.json();
    
    // Map OWM Geo API data to frontend expectation
    const mappedData = data.map((item, index) => ({
      id: index,
      name: item.name,
      country: item.country
    }));

    res.json(mappedData);
  } catch (error) {
    console.warn(`Weather search failed: Falling back to mock data.`);
    return res.json([{ id: 1, name: 'Mock City', country: 'Mock Country' }]);
  }
};

export { getCurrentWeather, searchLocation };
