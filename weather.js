// weather.js - Banner Weather (for Perdigon Directory)
const OWM_API_KEY = "65debdc01963a542cfdad42c57f624ad";
const weatherConfigs = [
  { zip: "95648", city: "Lincoln, CA", elem: "bw1" },
  { zip: "84664", city: "Mapleton, UT", elem: "bw2" }
];
const skyconMap = {
  "01d": "CLEAR_DAY", "01n": "CLEAR_NIGHT",
  "02d": "PARTLY_CLOUDY_DAY", "02n": "PARTLY_CLOUDY_NIGHT",
  "03d": "CLOUDY", "03n": "CLOUDY",
  "04d": "CLOUDY", "04n": "CLOUDY",
  "09d": "RAIN", "09n": "RAIN",
  "10d": "RAIN", "10n": "RAIN",
  "11d": "SLEET", "11n": "SLEET",
  "13d": "SNOW", "13n": "SNOW",
  "50d": "FOG",  "50n": "FOG"
};

function updateBannerWeather() {
  weatherConfigs.forEach(function(cfg, idx) {
    // Defensive: bail if element missing
    var elem = document.getElementById(cfg.elem);
    if (!elem) return;

    elem.innerHTML = '<span style="color:#aaa;">Loading…</span>';

    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?zip=" + cfg.zip + "&appid=" + OWM_API_KEY + "&units=imperial";

    fetch("https://corsproxy.io/?" + encodeURIComponent(weatherUrl))
      .then(r => r.json())
      .then(function(data) {
        if (!data.main || !data.weather) {
          elem.innerHTML = '<span style="color:#f44;">Weather unavailable</span>';
          return;
        }
        var icon = data.weather[0].icon;
        var temp = Math.round(data.main.temp);
        var hi   = Math.round(data.main.temp_max);
        var lo   = Math.round(data.main.temp_min);
        var desc = data.weather[0].main;

        var html =
          '<canvas id="skycon'+idx+'" width="38" height="38" style="vertical-align:middle;margin-right:7px;"></canvas>' +
          '<span class="banner-weather-city">' + cfg.city + '</span>' +
          '<span class="banner-weather-meta" style="margin-left:8px;">' +
            temp + '&deg;F ' + desc +
            ' &nbsp; H: ' + hi + '&deg; L: ' + lo + '&deg;</span>';
        elem.innerHTML = html;

        // Animated Skycons icon
        setTimeout(function(){
          if(window.Skycons && document.getElementById("skycon"+idx)) {
            var s = new Skycons({color:'#ffe066'});
            var mapped = skyconMap[icon] || "PARTLY_CLOUDY_DAY";
            s.add("skycon"+idx, Skycons[mapped]);
            s.play();
          }
        }, 75);
      })
      .catch(function(){
        elem.innerHTML = '<span style="color:#f44;">Weather unavailable</span>';
      });
  });
}

// Always run after DOM is ready
document.addEventListener("DOMContentLoaded", updateBannerWeather);
