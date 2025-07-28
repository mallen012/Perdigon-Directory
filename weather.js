// Skycons icon mapping for OWM
const skyconMap = {
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
const OWM_API_KEY = "65debdc01963a542cfdad42c57f624ad";
const CITIES = [
  { zip: "95648", city: "Lincoln, CA", elem: "bw1" },
  { zip: "84664", city: "Mapleton, UT", elem: "bw2" }
];
function updateBannerWeather() {
  CITIES.forEach(function(cfg, idx){
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?zip=" + cfg.zip + "&appid=" + OWM_API_KEY + "&units=imperial";
    fetch("https://corsproxy.io/?" + encodeURIComponent(weatherUrl))
      .then(r=>r.json()).then(function(data){
        var temp = Math.round(data.main.temp);
        var hi = Math.round(data.main.temp_max);
        var lo = Math.round(data.main.temp_min);
        var desc = data.weather[0].main;
        var icon = data.weather[0].icon;
        // Build weather cell
        var html =
          '<canvas id="skycon' + idx + '" width="40" height="40" style="vertical-align:middle;"></canvas>' +
          '<span class="banner-weather-city">' + cfg.city + '</span>' +
          '<span class="banner-weather-meta">' +
            temp + '&deg;F ' + desc +
            ' &nbsp; H: ' + hi + '&deg; L: ' + lo + '&deg;</span>';
        document.getElementById(cfg.elem).innerHTML = html;
        // Draw icon
        setTimeout(function(){
          if(window.Skycons){
            var s = new Skycons({color:'#ffe066'});
            var mapped = skyconMap[icon] || "PARTLY_CLOUDY_DAY";
            s.add("skycon"+idx, Skycons[mapped]);
            s.play();
          }
        }, 100);
      }).catch(function(){
        document.getElementById(cfg.elem).innerHTML = 'Weather unavailable';
      });
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateBannerWeather);
} else {
  updateBannerWeather();
}
