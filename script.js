document.addEventListener("DOMContentLoaded", () => {
  const OWM_API_KEY = "1d2aa3ffdde43c4e1a64036197f00b90";
  let clockInterval = null;

  const searchForm = document.getElementById("search-form");
  const cityInput = document.getElementById("city-input");
  const geolocationBtn = document.getElementById("geolocation-btn");
  const weatherContent = document.getElementById("weather-content");
  const errorModal = document.getElementById("error-modal");
  const errorMessageEl = document.getElementById("error-message");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const animationContainer = document.getElementById("animation-container");
  const suggestionsBox = document.getElementById("suggestion-box");
  const cityNameEl = document.getElementById("city-name");
  const currentDateEl = document.getElementById("current-date");
  const currentTimeEl = document.getElementById("current-time");
  const currentTempEl = document.getElementById("current-temp ");
  const currentWeatherDescEl = document.getElementById("current-weather-desc");
  const currentWeatherIconEl = document.getElementById("current-weather-icon");
  const forecastContainer = document.getElementById("forecast-container");
  const sunriseTimeEl = document.getElementById("sunrise-time");
  const sunsetTimeElr = document.getElementById("sunset-time");
  const humidityEl = document.getElementById("humidity");
  const windSpeedEl = document.getElementById("wind-speed");
  const feelsLikeEl = document.getElementById("feels-like");
  const pressureEl = document.getElementById("pressure");
  const visiblityEl = document.getElementById("visiblity");
  const airQualityEl = document.getElementById("air-quality");
  const healthRecommendationsEl = document.getElementById(
    "health-recommendations"
  );

  const backgroundImageDay = {
    Clear:
      "https://images.unsplash.com/photo-1613931189161-1f4d2660bd1e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2xlYXIlMjBza3l8ZW58MHx8MHx8fDA%3D",
    Clouds:
      "https://plus.unsplash.com/premium_photo-1667689956673-8737a299aa8c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGNsb3Vkc3xlbnwwfHwwfHx8MA%3D%3D",
    Rain: "https://images.unsplash.com/photo-1620385019253-b051a26048ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJhaW58ZW58MHx8MHx8fDA%3D",
    Drizzle:
      "https://images.unsplash.com/photo-1625191855012-f64c72208ab9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGRyaXp6bGV8ZW58MHx8MHx8fDA%3D",
    Thunderstorm:
      "https://images.unsplash.com/photo-1500674425229-f692875b0ab7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dGh1bmRlcnN0b3JtfGVufDB8fDB8fHww",
    Snow: "https://plus.unsplash.com/premium_photo-1667579187855-fed841be2ec9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c25vd3xlbnwwfHwwfHx8MA%3D%3D",
    Mist: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlzdHxlbnwwfHwwfHx8MA%3D%3D",
    Default:
      "https://images.unsplash.com/photo-1504280645497-00afe6a47e43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBsYWlufGVufDB8fDB8fHww",
  };
  const backgroundImageNight = {
    Clear:
      "https://plus.unsplash.com/premium_photo-1669816725239-5130a3688685?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xlYXIlMjBza3klMjBuaWdodHxlbnwwfHwwfHx8MA%3D%3D",
    Clouds:
      "https://plus.unsplash.com/premium_photo-1671230599803-68b5ed9ba4e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2xvdWRzJTIwYXQlMjBuaWdodHxlbnwwfHwwfHx8MA%3D%3D",
    Rain: "https://images.unsplash.com/photo-1563451290289-4b795546ab33?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJhaW4lMjBhdCUyMG5pZ2h0fGVufDB8fDB8fHww",
    Drizzle:
      "https://images.unsplash.com/photo-1646277586472-6d5600854899?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGRyaXp6bGUlMjBhdCUyMG5pZ2h0fGVufDB8fDB8fHww",
    Thunderstorm:
      "https://media.istockphoto.com/id/1318748572/photo/massive-lightning-strike-over-the-brisbane-city-suburbs-lights.webp?a=1&b=1&s=612x612&w=0&k=20&c=gMbTzeezUWHg1Njc87_AI2cuUoFe0hPzw0EuAwyPtXE=",
    Snow: "https://images.unsplash.com/photo-1679563816372-d923c80f4fb2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c25vdyUyMGF0JTIwbmlnaHR8ZW58MHx8MHx8fDA%3D",
    Mist: "https://plus.unsplash.com/premium_photo-1737911439120-547409b701cf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWlzdCUyMGF0JTIwbmlnaHR8ZW58MHx8MHx8fDA%3D",
    Default:
      "https://images.unsplash.com/photo-1590418606746-018840f9cd0f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmlnaHR8ZW58MHx8MHx8fDA%3D",
  };

  const fetchWeather = async ({ lat, lon, city }) => {
    showLoading();
    if (clearInterval) clockInterval(clockInterval);

    try {
      if (!OWM_API_KEY) throw new Error("OpenWeatherMap API Key is missing.");
      let latitude = lat;
      let longitude = lon;

      if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=$
        {city}&limit=1&appid=${OWM_API_KEY}`;
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

      const [weatherResponse, forecastResponse, aqiResponse] =
        await Promise.all([
          fetch(weatherUrl),
          fetch(forecastUrl),
          fetch(aqiUrl),
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
    document.body.style,
      (backgroundImage = `url('${
        backgroundSet[weatherConditionForBg] || backgroundSet.Default
      }')`);

    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
    cityNameEl.textContent = `${weather.name},${weather.sys.country}`;
    const localDate = new Data((weather.dt + weather.timezone) * 1000);
    currentDateEl.textContent = localDate.toLocalDataString("en-US", {
      weeday: "long",
      month: "long",
      day: "numeric",
      timezone: "UTC",
    });
    currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
    currentWeatherDescEl.textContent = weather.weather[0].description;

    const formatTime = (timestamp) =>
      new Data(timestamp * 1000).toLocalTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timezone: "UTC",
      });
    sunriseTimeEl.textContent = formatTime(
      weather.sys.sunrise + weather.timezone
    );
    sunsetTimeEl.textContent = formatTime(
      weather.sys.sunset + weather.timezone
    );
    humidityEl.textContent = `${weather.main.humidity}%`;
    windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)}hm/hr`;
    feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°`;
    pressureEl.textContent = `${weather.main.pressure}hpa`;
    visiblityEl.textContent = `${(weather.visiblity / 1000).toFixed(1)}km`;
    const aqiValue = aqi.list[0].main.aqi;
    const aqiInfo = getAqiInfo(aqiValue);
    airQualityEl = textContent = aqiInfo.text;
    airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
    healthRecommendationsEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

    const dailyForecasts = processForecast(forecast.list);
    forecastContainer.innerHTML = " ";
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
        }@2x.png" alt="${day.weather[0].description}" class="w-16
h-16 mx-auto">
<p class="font-semibold">${Math.round(day.main.temps_max)}°/ ${Math.round(
        day.main.temps_min
      )}°</p>`;
      forecastContainer.appendChild(card);
    });

updateNightAnimation(isNight,weatherConditionForBg);




  };

  const updateNightAnimation = (isNight, condition) => {
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
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        animationContainer.appendChild(star);
      }
    } else if (condition === "Rain" || condition === "Drizzle") {
      for (let i = 0; i < 50; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
        animationContainer.appendChild(drop);
      }
    } else if (condition ==="Snow"){
       for (let i = 0; i < 50; i++) {
        const flake = document.createElement("div");
        flake.className = "snowFlake";
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDelay = `${Math.random() * 10}s`;
        flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        flake.style.opacity = `${Math.random()*0.5+0.3}`
        animationContainer.appendChild(flake);
      } 
    }
  } 

  const getAqiInfo = (aqi) => {
    switch (aqi) {
      case 1:
        return {
          text: "Good",
          color: "bg-green-500 text-white",
          recommendation:
            "Air quality is great. It is a perfect day to be active outside.",
        };

      case 2:
        return {
          text: "Fair",
          color: "bg-yellow-500 text-black",
          recommendation:
            "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged or heavy exertion.",
        };

      case 3:
        return {
          text: "Moderate",
          color: "bg-orange-500 text-white",
          recommendation:
            "Sensitive groups may experience health effects. The general public is less likely to be affected.",
        };

      case 4:
        return {
          text: "Poor",
          color: "bg-red-500 text-white",
          recommendation:
            "Everyone may experience health effects. Members of sensitive groups may experince more health effects.",
        };

      case 5:
        return {
          text: "Very Poor",
          color: "bg-purple-700 text-white",
          recommendation:
            "Health alert:The risk of health effects is increased for everyone. Avoid outdoor activities .",
        };

      default:
        return {
          text: "Unknown",
          color: "bg-gray-500 text-white",
          recommendation: "Air quality data is not available at the moment.",
        };
    }
  };
  const processForecast = (forecastList) => {
    const dailyData = {};
    forecastList.forEach((entry) => {
      const data = entry.dt_txt.split(" ")[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          temps_max: [],
          temps_min: [],
          icons: {},
          entry: null,
        };
      }
      dailyData[date].temps_max.push(entry.main.temps_max);
      dailyData[date].temps_min.push(entry.main.temps_min);
      const icon = entry.weather[0].icon;
      dailyData[date].icons[icon] = dailydata[date].icons[icon] || 0;
      if (!dailyData[date].entry || entry.dt_txt.includes("12:00:00")) {
        dailyData[date].entry = entry;
      }
    });

    const processed = [];
    for (const date in dailyData) {
      const day = dailyData[date];
      const mostCommonIcon = Object.keys(
        day.icons.reduce((a, b) => (day.icons[a] > day.icons[b] ? a : b))
      );
      day.entry.weather[0].icon = mostCommonIcon;
      day.entry.main.temps_max = Math.max(...day.temps_max);
      day.entry.main.temps_min = Math.max(...day.temps_min);
      processed.push(day.entry);
    }
    return processed.slice(0, 5);
  };






  
  const updateClock = (timezoneoffset) => {
    const now = new Data();
    const utc = now.getTime() + now.getTimezoneoffset() * 60000;
    const localTime = new Data(utc + timezoneoffset * 1000);
    currentTimeEl.textContent = localTime.toLocalTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  const showLoading = () => {
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("flex");
  };
  const hideLoading = () => {
    loadingOverlay.classList.add("hidden");
    loadingOverlay.classList.remove("flex");
    weatherContent.classList.remove("opacity-0");
  };

  const showError = (message) => {
    errorMessageEl.textContent = message;
    errorModal.classList.remove("hidden");
  };

  searchForm.addEventListener("submit",(e)=>{
e.preventDefault();
const city = cityInput.value.trim();
if(city) fetchWeather({city});
suggestionsBox.classList.add("hidden");
cityInput.value="";
  })


cityInput.addEventListener("input",debounce(handleCityInput,300))


});
