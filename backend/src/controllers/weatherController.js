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
    if (!apiKey || apiKey === 'your_weather_api_key_here') {
      return res.json({
        mock: true,
        location: { name: q?.includes(',') ? 'Current Location' : (q || 'Unknown'), country: 'Mock Country' },
        current: { temp_c: 24, condition: { text: 'Sunny' }, humidity: 65, wind_kph: 12, vis_km: 10, uv: 5 },
        forecast: {
          forecastday: [
            { day: { maxtemp_c: 26, mintemp_c: 15, condition: { text: 'Sunny' }, daily_chance_of_rain: 10 } }
          ]
        }
      });
    }

    // Determine if q is a coordinate string (lat,lng) or a city name
    let queryParam = `q=${encodeURIComponent(q)}`;
    if (q.includes(',')) {
      const [lat, lon] = q.split(',');
      queryParam = `lat=${encodeURIComponent(lat.trim())}&lon=${encodeURIComponent(lon.trim())}`;
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
        current: { temp_c: 24, condition: { text: 'Sunny' }, humidity: 65, wind_kph: 12, vis_km: 10, uv: 5 },
        forecast: {
          forecastday: [
            { day: { maxtemp_c: 26, mintemp_c: 15, condition: { text: 'Sunny' }, daily_chance_of_rain: 10 } }
          ]
        }
      });
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Map OpenWeatherMap data to match the expected frontend structure
    const mappedData = {
      location: { 
        name: currentData.name || (q.includes(',') ? 'Current Location' : q), 
        country: currentData.sys.country 
      },
      current: { 
        temp_c: Math.round(currentData.main.temp), 
        condition: { text: currentData.weather[0].main }, 
        humidity: currentData.main.humidity, 
        wind_kph: Math.round(currentData.wind.speed * 3.6), 
        vis_km: (currentData.visibility / 1000) || 10, 
        uv: 5 // OWM doesn't provide UV in standard free tier
      },
      forecast: {
        forecastday: [
          { 
            day: { 
              maxtemp_c: Math.round(currentData.main.temp_max), 
              mintemp_c: Math.round(currentData.main.temp_min), 
              condition: { text: currentData.weather[0].main }, 
              daily_chance_of_rain: currentData.clouds.all 
            },
            hour: forecastData.list.slice(0, 8).map(item => ({
              time: item.dt_txt,
              temp_c: Math.round(item.main.temp)
            }))
          }
        ]
      }
    };

    res.json(mappedData);
  } catch (error) {
    console.warn(`Weather fetch failed: Falling back to mock data.`, error);
    return res.json({
      mock: true,
      location: { name: req.query.q?.includes(',') ? 'Current Location' : (req.query.q || 'Unknown'), country: 'Mock Country' },
      current: { temp_c: 24, condition: { text: 'Sunny' }, humidity: 65, wind_kph: 12, vis_km: 10, uv: 5 },
      forecast: {
        forecastday: [
          { day: { maxtemp_c: 26, mintemp_c: 15, condition: { text: 'Sunny' }, daily_chance_of_rain: 10 } }
        ]
      }
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
