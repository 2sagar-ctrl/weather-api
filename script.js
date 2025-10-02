document.addEventListener("DOMContentLoaded", () => {
  const OWM_API_KEY = "1d2aa3ffdde43c4e1a64036197f00b90";

  let clockInterval = null;
  let currentUnit = "metric"; // Celsius default
  let lastWeather, lastForecast, lastAqi;

  const searchForm = document.getElementById("search-form");
  const cityInput = document.getElementById("city-input");
  const geolocationBtn = document.getElementById("geolocation-btn");
  const weatherContent = document.getElementById("weather-content");
  const errorModal = document.getElementById("error-modal");
  const errorMessageEl = document.getElementById("error-message");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const loadingOverlay = document.getElementById("loading-overlay");
  const animationContainer = document.getElementById("animation-container");
  const suggestionsBox = document.getElementById("suggestion-box");
  const cityNameEl = document.getElementById("city-name");
  const currentDateEl = document.getElementById("current-date");
  const currentTimeEl = document.getElementById("current-time");
  const currentTempEl = document.getElementById("current-temp");
  const currentWeatherDescEl = document.getElementById("current-weather-desc");
  const currentWeatherIconEl = document.getElementById("current-weather-icon");
  const forecastContainer = document.getElementById("forecast-container");
  const sunriseTimeEl = document.getElementById("sunrise-time");
  const sunsetTimeEl = document.getElementById("sunset-time");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");
  const feelsLikeEl = document.getElementById("feels-like");
  const pressureEl = document.getElementById("pressure");
  const visibilityEl = document.getElementById("visibility");
  const airQualityEl = document.getElementById("air-quality");
  const healthRecommendationsEl = document.getElementById("health-recommendations");

  const backgroundImageDay = {
    Clear: "https://images.unsplash.com/photo-1613931189161-1f4d2660bd1e?w=500&auto=format&fit=crop&q=60",
    Clouds: "https://plus.unsplash.com/premium_photo-1667689956673-8737a299aa8c?w=500&auto=format&fit=crop&q=60",
    Rain: "https://images.unsplash.com/photo-1620385019253-b051a26048ce?w=500&auto=format&fit=crop&q=60",
    Drizzle: "https://images.unsplash.com/photo-1625191855012-f64c72208ab9?w=500&auto=format&fit=crop&q=60",
    Thunderstorm: "https://images.unsplash.com/photo-1500674425229-f692875b0ab7?w=500&auto=format&fit=crop&q=60",
    Snow: "https://plus.unsplash.com/premium_photo-1667579187855-fed841be2ec9?w=500&auto=format&fit=crop&q=60",
    Mist: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=500&auto=format&fit=crop&q=60",
    Default: "https://images.unsplash.com/photo-1504280645497-00afe6a47e43?w=500&auto=format&fit=crop&q=60"
  };
  const backgroundImageNight = {
    Clear: "https://plus.unsplash.com/premium_photo-1669816725239-5130a3688685?w=500&auto=format&fit=crop&q=60",
    Clouds: "https://plus.unsplash.com/premium_photo-1671230599803-68b5ed9ba4e6?w=500&auto=format&fit=crop&q=60",
    Rain: "https://images.unsplash.com/photo-1563451290289-4b795546ab33?w=500&auto=format&fit=crop&q=60",
    Drizzle: "https://images.unsplash.com/photo-1646277586472-6d5600854899?w=500&auto=format&fit=crop&q=60",
    Thunderstorm: "https://media.istockphoto.com/id/1318748572/photo/massive-lightning-strike-over-the-brisbane-city-suburbs-lights.webp?a=1&b=1&s=612x612&w=0&k=20&c=gMbTzeezUWHg1Njc87_AI2cuUoFe0hPzw0EuAwyPtXE=",
    Snow: "https://images.unsplash.com/photo-1679563816372-d923c80f4fb2?w=500&auto=format&fit=crop&q=60",
    Mist: "https://plus.unsplash.com/premium_photo-1737911439120-547409b701cf?w=500&auto=format&fit=crop&q=60",
    Default: "https://images.unsplash.com/photo-1590418606746-018840f9cd0f?w=500&auto=format&fit=crop&q=60"
  };

  function cToF(tempC) { return (tempC * 9) / 5 + 32; }
  function displayTemp(tempC) {
    return currentUnit === "metric" ? `${Math.round(tempC)}°C` : `${Math.round(cToF(tempC))}°F`;
  }
  function showLoading() { loadingOverlay.classList.remove("hidden"); }
  function hideLoading() { loadingOverlay.classList.add("hidden"); }
  function showError(message) { errorMessageEl.textContent = message; errorModal.classList.remove("hidden"); }

  function updateClock(timezoneOffset) {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + timezoneOffset * 1000);
    currentTimeEl.textContent = local.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }

  function updateUI(weather, forecast, aqi) {
    lastWeather = weather; lastForecast = forecast; lastAqi = aqi;

    let weatherConditionForBg = weather.weather[0].main;
    if (weatherConditionForBg === "Clouds" && weather.clouds.all < 20) weatherConditionForBg = "Clear";

    updateClock(weather.timezone);
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(() => updateClock(weather.timezone), 1000);

    const nowUTC = weather.dt, sunriseUTC = weather.sys.sunrise, sunsetUTC = weather.sys.sunset;
    const isNight = nowUTC < sunriseUTC || nowUTC > sunsetUTC;
    const backgroundSet = isNight ? backgroundImageNight : backgroundImageDay;

    document.body.style.backgroundImage = `url('${backgroundSet[weatherConditionForBg] || backgroundSet.Default}')`;

    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
    cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
    const localDate = new Date((weather.dt + weather.timezone) * 1000);
    currentDateEl.textContent = localDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

    currentTempEl.textContent = displayTemp(weather.main.temp);
    currentWeatherDescEl.textContent = weather.weather[0].description;

    function formatTime(ts) {
      return new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });
    }
    sunriseTimeEl.textContent = formatTime(weather.sys.sunrise + weather.timezone);
    sunsetTimeEl.textContent = formatTime(weather.sys.sunset + weather.timezone);

    humidityEl.textContent = `${weather.main.humidity}%`;
    windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/hr`;
    feelsLikeEl.textContent = displayTemp(weather.main.feels_like);
    pressureEl.textContent = `${weather.main.pressure} hPa`;
    visibilityEl.textContent = weather.visibility !== undefined ? `${(weather.visibility / 1000).toFixed(1)} km` : "--";

    const aqiValue = aqi.list[0].main.aqi;
    const aqiInfo = getAqiInfo(aqiValue);
    airQualityEl.textContent = aqiInfo.text;
    airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
    healthRecommendationsEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

    const dailyForecasts = processForecast(forecast.list);
    forecastContainer.innerHTML = "";
    dailyForecasts.forEach(day => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl text-center card backdrop-blur-xl";
      card.innerHTML = `
        <p class="font-bold text-lg">${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
        <img src="<https://openweathermap.org/img/wn/${day.weather>[0].icon}@2x.png" alt="${day.weather[0].description}" class="w-16 h-16 mx-auto" />
        <p>${day.weather[0].description}</p>
        <p class="font-semibold">${displayTemp(day.main.temp_max)} / ${displayTemp(day.main.temp_min)}</p>
      `;
      forecastContainer.appendChild(card);
    });

    updateNightAnimation(isNight, weatherConditionForBg);
  }

  function getAqiInfo(aqi) {
    switch (aqi) {
      case 1: return { text: "Good", color: "bg-green-500 text-white", recommendation: "Air quality is great. It is a perfect day to be active outside." };
      case 2: return { text: "Fair", color: "bg-yellow-500 text-black", recommendation: "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged or heavy exertion." };
      case 3: return { text: "Moderate", color: "bg-orange-500 text-white", recommendation: "Sensitive groups may experience health effects. The general public is less likely to be affected." };
      case 4: return { text: "Poor", color: "bg-red-500 text-white", recommendation: "Everyone may experience health effects. Members of sensitive groups may experience more health effects." };
      case 5: return { text: "Very Poor", color: "bg-purple-700 text-white", recommendation: "Health alert: The risk of health effects is increased for everyone. Avoid outdoor activities." };
      default: return { text: "Unknown", color: "bg-gray-500 text-white", recommendation: "Air quality data is not available at the moment." };
    }
  }

  function processForecast(forecastList) {
    const dailyData = {};
    forecastList.forEach(entry => {
      const date = entry.dt_txt.split(" ")[0];
      if (!dailyData[date]) dailyData[date] = { temp_max: [], temp_min: [], icons: {}, descriptions: {}, entry: null };
      dailyData[date].temp_max.push(entry.main.temp_max);
      dailyData[date].temp_min.push(entry.main.temp_min);
      const icon = entry.weather[0].icon;
      const description = entry.weather[0].description;

      dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
      dailyData[date].descriptions[description] = (dailyData[date].descriptions[description] || 0) + 1;

      // Prefer +12:00:00 forecast for day's entry
      if (!dailyData[date].entry || entry.dt_txt.includes("12:00:00")) dailyData[date].entry = entry;
    });

    const processed = [];
    for (const date in dailyData) {
      const day = dailyData[date];
      const mostCommonIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
      const mostCommonDesc = Object.keys(day.descriptions).reduce((a, b) => day.descriptions[a] > day.descriptions[b] ? a : b);
      day.entry.weather[0].icon = mostCommonIcon;
      day.entry.weather[0].description = mostCommonDesc;
      day.entry.main.temp_max = Math.max(...day.temp_max);
      day.entry.main.temp_min = Math.min(...day.temp_min);
      processed.push(day.entry);
    }
    return processed.slice(0, 5);
  }

  function updateNightAnimation(isNight, condition) {
    animationContainer.innerHTML = "";
    if (!isNight) return;
    if (condition === "Clear") {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.position = "absolute";
        star.style.borderRadius = "50%";
        star.style.background = "white";
        star.style.opacity = "0.7";
        star.style.animation = `twinkle ${2 + Math.random() * 3}s infinite alternate`;
        animationContainer.appendChild(star);
      }
    }
  }

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async function handleCityInput(event) {
    const query = event.target.value;
    if (query.length < 3) {
      suggestionsBox.classList.add("hidden");
      return;
    }
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${OWM_API_KEY}`;
      const response = await fetch(geoUrl);
      if (!response.ok) return;
      const cities = await response.json();
      suggestionsBox.innerHTML = "";
      if (cities.length > 0) {
        suggestionsBox.classList.remove("hidden");
        cities.forEach(city => {
          const div = document.createElement("div");
          div.className = "p-3 hover:bg-white/10 cursor-pointer";
          div.textContent = `${city.name},${city.state ? city.state + "," : ""}${city.country}`;
          div.onclick = () => {
            cityInput.value = city.name;
            suggestionsBox.classList.add("hidden");
            fetchWeather({ lat: city.lat, lon: city.lon });
          };
          suggestionsBox.appendChild(div);
        });
      } else {
        suggestionsBox.classList.add("hidden");
      }
    } catch (err) {
      console.error("Suggestion fetch error:", err);
    }
  }

  async function fetchWeather({ lat, lon, city }) {
    showLoading();
    if (clockInterval) clearInterval(clockInterval);
    try {
      if (!OWM_API_KEY) throw new Error("OpenWeatherMap API Key is missing.");

      let latitude = lat;
      let longitude = lon;
      if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OWM_API_KEY}`;
        const geoRes = await fetch(geoUrl);
        if (!geoRes.ok) throw new Error(`Could not find location data for "${city}".`);
        const geoData = await geoRes.json();
        if (!geoData.length) throw new Error(`Could not find location data for "${city}".`);
        latitude = geoData[0].lat;
        longitude = geoData[0].lon;
      }

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;

      const [weatherRes, forecastRes, aqiRes] = await Promise.all([fetch(weatherUrl), fetch(forecastUrl), fetch(aqiUrl)]);
      if ([weatherRes, forecastRes, aqiRes].some(r => !r.ok)) throw new Error("Failed to fetch all weather data.");

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      const aqiData = await aqiRes.json();

      updateUI(weatherData, forecastData, aqiData);

    } catch (error) {
      console.error(error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  // Event listeners
  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) fetchWeather({ city });
    suggestionsBox.classList.add("hidden");
    cityInput.value = "";
  });

  cityInput.addEventListener("input", debounce(handleCityInput, 300));
  document.addEventListener("click", e => {
    if (!searchForm.contains(e.target)) suggestionsBox.classList.add("hidden");
  });

  geolocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {
          console.log("Geolocation denied; defaulting to New Delhi");
          fetchWeather({ city: "New Delhi" });
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
    } else {
      console.log("Geolocation not supported; defaulting to New Delhi");
      fetchWeather({ city: "New Delhi" });
    }
  });

  closeModalBtn.addEventListener("click", () => errorModal.classList.add("hidden"));

  document.getElementById("cel-btn").onclick = function () {
    currentUnit = "metric";
    this.classList.add("active");
    document.getElementById("fah-btn").classList.remove("active");
    if (lastWeather) updateUI(lastWeather, lastForecast, lastAqi);
  };

  document.getElementById("fah-btn").onclick = function () {
    currentUnit = "imperial";
    this.classList.add("active");
    document.getElementById("cel-btn").classList.remove("active");
    if (lastWeather) updateUI(lastWeather, lastForecast, lastAqi);
  };

  // Initial fetch
  geolocationBtn.click();
});
