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
if([weatherResponse, forecastResponse, aqiResponse].some(res => !res.ok)){
     throw new Error ("Failed to fetch all weather data. Please check your API key and network connection.")

}

      const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
          const aqiData = await aqiResponse.json();


    } catch (error) {
      console.error("Weather data fetch error:", error);
      showError(error.message);
    } finally {
      hideLoading();
    }
  };
 const updateUI = (weather,forecast,aqi)=>{
    let weatherConditionForBg = weather.weather[0].main;
    if(weatherConditionForBg === "Clouds" && weather.clouds.all<20){
        weatherConditionForBg ="Clear";
    }
 }

 const updateClock = (timezoneoffset)=>{
    const now = new Data();
    const utc = now.getTime()+(now.getTimezoneoffset()*60000);
    const localTime = new Data (utc+(timezoneoffset * 1000));
    currentTimeEl.textContent = localTime.toLocalTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})
 }
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
});
