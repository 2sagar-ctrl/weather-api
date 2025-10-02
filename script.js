document.addEventListener("DOMContentLoaded", () => {
  const OWM_API_KEY = "1d2aa3ffdde43c4e1a64036197f00b90";
  let clockInterval = null;

  // DOM references
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

  // Background images
  const backgroundImageDay = { /* ... as before ... */ };
  const backgroundImageNight = { /* ... as before ... */ };

  // show/hide loading overlay
  const showLoading = () => { loadingOverlay.classList.remove("hidden"); };
  const hideLoading = () => { loadingOverlay.classList.add("hidden"); };

  // Show error modal
  const showError = (message) => {
    errorMessageEl.textContent = message;
    errorModal.classList.remove("hidden");
  };

  // Weather Fetch
  const fetchWeather = async ({ lat, lon, city }) => {
    showLoading();
    if (clockInterval) clearInterval(clockInterval); // Proper clearInterval usage
    try {
      if (!OWM_API_KEY) throw new Error("OpenWeatherMap API Key is missing.");
      let latitude = lat;
      let longitude = lon;
      if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OWM_API_KEY}`;
        const getResponse = await fetch(geoUrl);
        if (!getResponse.ok)
          throw new Error(`Could not find location data for "${city}".`);
        const geoData = await getResponse.json();
        if (geoData.length === 0)
          throw new Error(`Could not find location data for "${city}".`);
        latitude = geoData[0].lat;
        longitude = geoData[0].lon;
      }
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;

      const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
        fetch(weatherUrl), fetch(forecastUrl), fetch(aqiUrl)
      ]);
      if (
        [weatherResponse, forecastResponse, aqiResponse].some((res) => !res.ok)
      ) {
        throw new Error(
          "Failed to fetch all weather data. Please check your API key and network connection."
        );
      }
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      const aqiData = await aqiResponse.json();
      updateUI(weatherData, forecastData, aqiData);
    } catch (error) {
      console.error("Weather data fetch error:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  };

  // UI update
  const updateUI = (weather, forecast, aqi) => {
    let weatherConditionForBg = weather.weather[0].main;
    if (weatherConditionForBg === "Clouds" && weather.clouds.all < 20) {
      weatherConditionForBg = "Clear";
    }
    updateClock(weather.timezone);
    clockInterval = setInterval(() => updateClock(weather.timezone), 1000);

    const currentTimeUTC = weather.dt;
    const sunriseUTC = weather.sys.sunrise;
    const sunsetUTC = weather.sys.sunset;
    const isNight = currentTimeUTC < sunriseUTC || currentTimeUTC > sunsetUTC;
    const backgroundSet = isNight ? backgroundImageNight : backgroundImageDay;
    document.body.style.backgroundImage = `url('${backgroundSet[weatherConditionForBg] || backgroundSet.Default}')`;

    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
    cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
    const localDate = new Date((weather.dt + weather.timezone) * 1000);

    currentDateEl.textContent = localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
    currentWeatherDescEl.textContent = weather.weather[0].description;

    const formatTime = (timestamp) =>
      new Date(timestamp * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });

    sunriseTimeEl.textContent = formatTime(weather.sys.sunrise + weather.timezone);
    sunsetTimeEl.textContent = formatTime(weather.sys.sunset + weather.timezone);
    humidityEl.textContent = `${weather.main.humidity}%`;
    windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/hr`;
    feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°`;
    pressureEl.textContent = `${weather.main.pressure} hPa`;
    visibilityEl.textContent = weather.visibility !== undefined 
      ? `${(weather.visibility / 1000).toFixed(1)} km`
      : "--";

    const aqiValue = aqi.list[0].main.aqi;
    const aqiInfo = getAqiInfo(aqiValue);
    airQualityEl.textContent = aqiInfo.text;
    airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
    healthRecommendationsEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

    const dailyForecasts = processForecast(forecast.list);
    forecastContainer.innerHTML = "";
    dailyForecasts.forEach((day) => {
      const card = document.createElement("div");
      card.className = `p-4 rounded-2xl text-center card backdrop-blur-xl`;
      card.innerHTML = `
        <p class="font-bold text-lg">${new Date(day.dt_txt).toLocaleDateString(
          "en-US",
          { weekday: "short" }
        )}</p>
        <img src="https://openweathermap.org/img/wn/${
          day.weather[0].icon
        }@2x.png" alt="${day.weather[0].description}" class="w-16 h-16 mx-auto">
        <p class="font-semibold">${Math.round(day.main.temp_max)}°/ ${Math.round(
        day.main.temp_min
      )}°</p>`;
      forecastContainer.appendChild(card);
    });
    updateNightAnimation(isNight, weatherConditionForBg);
  };

  // Night animation for fun
  const updateNightAnimation = (isNight, condition) => {
    animationContainer.innerHTML = "";
    if (!isNight) return;
    if (condition === "Clear") {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.position = "absolute";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.borderRadius = "50%";
        star.style.background = "white";
        star.style.opacity = "0.7";
        star.style.animation = "twinkle 2s infinite alternate";
        animationContainer.appendChild(star);
      }
    }
    // ... (add Rain, Snow animations as desired)
  };

  // Air Quality interpretation
  const getAqiInfo = (aqi) => {
    switch (aqi) {
      case 1:
        return {
          text: "Good",
          color: "bg-green-500 text-white",
          recommendation: "Air quality is great. It is a perfect day to be active outside."
        };
      case 2:
        return {
          text: "Fair",
          color: "bg-yellow-500 text-black",
          recommendation: "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged or heavy exertion."
        };
      case 3:
        return {
          text: "Moderate",
          color: "bg-orange-500 text-white",
          recommendation: "Sensitive groups may experience health effects. The general public is less likely to be affected."
        };
      case 4:
        return {
          text: "Poor",
          color: "bg-red-500 text-white",
          recommendation: "Everyone may experience health effects. Members of sensitive groups may experience more health effects."
        };
      case 5:
        return {
          text: "Very Poor",
          color: "bg-purple-700 text-white",
          recommendation: "Health alert: The risk of health effects is increased for everyone. Avoid outdoor activities."
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-500 text-white",
          recommendation: "Air quality data is not available at the moment."
        };
    }
  };

  // Forecast processing
  const processForecast = (forecastList) => {
    const dailyData = {};
    forecastList.forEach((entry) => {
      const date = entry.dt_txt.split(" ")[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          temp_max: [],
          temp_min: [],
          icons: {},
          entry: null,
        };
      }
      dailyData[date].temp_max.push(entry.main.temp_max);
      dailyData[date].temp_min.push(entry.main.temp_min);
      const icon = entry.weather[0].icon;
      dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
      if (!dailyData[date].entry || entry.dt_txt.includes("12:00:00")) {
        dailyData[date].entry = entry;
      }
    });

    const processed = [];
    for (const date in dailyData) {
      const day = dailyData[date];
      const mostCommonIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
      day.entry.weather[0].icon = mostCommonIcon;
      day.entry.main.temp_max = Math.max(...day.temp_max);
      day.entry.main.temp_min = Math.min(...day.temp_min);
      processed.push(day.entry);
    }
    return processed.slice(0, 5);
  };

  // Debounce
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // City input autocomplete (openweathermap geocoding)
  const handleCityInput = async (event) => {
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
        cities.forEach((city) => {
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
    } catch (error) {
      console.error("Suggestion fetch error:", error);
    }
  };

  // Update Clock
  const updateClock = (timezoneoffset) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + timezoneoffset * 1000);
    currentTimeEl.textContent = localTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Listeners
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) fetchWeather({ city });
    suggestionsBox.classList.add("hidden");
    cityInput.value = "";
  });

  cityInput.addEventListener("input", debounce(handleCityInput, 300));

  document.addEventListener("click", (e) => {
    if (!searchForm.contains(e.target)) {
      suggestionsBox.classList.add("hidden");
    }
  });

  geolocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          fetchWeather({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }),
        () => {
          console.log("Geolocation failed or was denied, falling back to default city.");
          fetchWeather({ city: "New Delhi" });
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation not supported. Falling back to default city.");
      fetchWeather({ city: "New Delhi" });
    }
  });

  closeModalBtn.addEventListener("click", () =>
    errorModal.classList.add("hidden")
  );

  // Initial fetch by geolocation
  geolocationBtn.click();
});
