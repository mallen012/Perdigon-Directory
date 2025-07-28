console.log("Weather script block is running");

window.OWM_API_KEY = "65debdc01963a542cfdad42c57f624ad";
window.LOCS = [
  { zip: "95648", city: "Lincoln, CA" },
  { zip: "84664", city: "Mapleton, UT" }
];
window.skyconMap = {
  "01d":"CLEAR_DAY", "01n":"CLEAR_NIGHT",
  "02d":"PARTLY_CLOUDY_DAY", "02n":"PARTLY_CLOUDY_NIGHT",
  "03d":"CLOUDY", "03n":"CLOUDY",
  "04d":"CLOUDY", "04n":"CLOUDY",
  "09d":"RAIN", "09n":"RAIN",
  "10d":"RAIN", "10n":"RAIN",
  "11d":"SLEET", "11n":"SLEET",
  "13d":"SNOW", "13n":"SNOW",
  "50d":"FOG", "50n":"FOG"
};

window.renderWeather = function(loc, weather, forecast, idx) {
  var main = Math.round(weather.main.temp) + "&deg;F";
  var hi = Math.round(weather.main.temp_max) + "&deg;";
  var lo = Math.round(weather.main.temp_min) + "&deg;";
  var desc = weather.weather[0].main;
  var icon = weather.weather[0].icon;
  var card = "<div class='weather-card'>" +
    "<div class='weather-location'>" + loc.city + "</div>" +
    "<canvas id=\"skc" + idx + "\" width=\"58\" height=\"58\" style=\"display:block;margin:2px auto 10px auto;\"></canvas>" +
    "<div class='weather-main'>" + main + "</div>" +
    "<div class='weather-meta'>" + desc + " &nbsp; H: " + hi + " &nbsp; L: " + lo + "</div>";
  card += "<div class='weather-forecast-row'>";
  for (var i = 0; i < 3; i++) {
    var fc = forecast[i];
    var dt = new Date(fc.dt_txt);
    var day = dt.toLocaleString("en-US", { weekday: "short" });
    var fchi = Math.round(fc.main.temp_max);
    var fclo = Math.round(fc.main.temp_min);
    var fcdesc = fc.weather[0].main;
    card += "<div class='weather-forecast-card'>" +
      "<div class='weather-forecast-day'>" + day + "</div>" +
      "<canvas id=\"skc" + idx + "_fc" + i + "\" width=\"36\" height=\"36\" style=\"display:block;margin:4px auto 7px auto;\"></canvas>" +
      "<div class='weather-forecast-main'>" + fcdesc + "</div>" +
      "<span class='weather-forecast-hi'>" + fchi + "&deg;</span>" +
      "<span class='weather-forecast-lo'>" + fclo + "&deg;</span>" +
    "</div>";
  }
  card += "</div></div>";
  return card;
};

window.getForecastDayParts = function(forecast) {
  var results = [];
  var addedDays = {};
  for (var i = 0; i < forecast.list.length; i++) {
    var dt = new Date(forecast.list[i].dt_txt);
    if (dt.getHours() === 12) {
      var day = dt.getDate();
      if (!addedDays[day]) {
        results.push(forecast.list[i]);
        addedDays[day] = true;
      }
    }
    if (results.length === 3) break;
  }
  return results;
};

window.updateWeatherAll = function() {
  var rowElem = document.getElementById("weather-row");
  rowElem.innerHTML = "<div style='color:#ccc;font-size:1.15em;'>Loading weather...</div>";
  var loaded = 0;
  var allData = [];
  window.LOCS.forEach(function(loc, idx) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?zip=" + loc.zip + "&appid=" + window.OWM_API_KEY + "&units=imperial";
    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?zip=" + loc.zip + "&appid=" + window.OWM_API_KEY + "&units=imperial";
    Promise.all([
      fetch("https://corsproxy.io/?" + encodeURIComponent(weatherUrl)).then(r=>r.json()),
      fetch("https://corsproxy.io/?" + encodeURIComponent(forecastUrl)).then(r=>r.json())
    ]).then(function([weather, forecast]) {
      var fcParts = window.getForecastDayParts(forecast);
      allData[idx] = { loc: loc, weather: weather, forecast: fcParts };
      loaded++;
      if (loaded === window.LOCS.length) {
        rowElem.innerHTML = allData.map(function(d, idx) {
          return window.renderWeather(d.loc, d.weather, d.forecast, idx);
        }).join("");
        setTimeout(function() {
          var skycons = new Skycons({ "color": "#ffe066" });
          allData.forEach(function(d, idx) {
            var mainIcon = window.skyconMap[d.weather.weather[0].icon] || "PARTLY_CLOUDY_DAY";
            skycons.add("skc" + idx, Skycons[mainIcon]);
            d.forecast.forEach(function(fc, i) {
              var fcIcon = window.skyconMap[fc.weather[0].icon] || "PARTLY_CLOUDY_DAY";
              skycons.add("skc" + idx + "_fc" + i, Skycons[fcIcon]);
            });
          });
          skycons.play();
        }, 100);
      }
    }).catch(function() {
      loaded++;
      if (loaded === window.LOCS.length) {
        rowElem.innerHTML = "<div style='color:#f44;font-size:1.15em;'>Weather unavailable</div>";
      }
    });
  });
};

// Banner date updater (keep this in weather.js)
function updateBannerDate() {
  var now = new Date();
  var dateStr = now.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
  document.getElementById("banner-date").textContent = dateStr;
}
updateBannerDate(); setInterval(updateBannerDate, 15000);

if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", window.updateWeatherAll); } else { window.updateWeatherAll(); }
