var userFormEl = document.querySelector('#user-form');
var cityButtonsEl = document.querySelector('#city-buttons');
var cityInputEl = document.querySelector('#city-name');
var resultsWeather = document.querySelector('#card-weather');

// Set API key variable to use to call API
var APIKey = "8f8d21e6e7cd61cae0b0be0c273de7bf";
var cityStoredList = [];

// Store last searched city name.
function storeCity (saveName) {
  cityStoredList = JSON.parse(localStorage.getItem("cityList"));
  if (cityStoredList.indexOf(saveName) == -1) {
    cityStoredList.push(saveName);
    createBtn (saveName);
  }
  localStorage.setItem("cityList", JSON.stringify(cityStoredList));
};

// Pulls previous searched city names form local storage and creates button elements
function renderStoredCity () {
  cityButtonsEl.innerHTML = "";

  console.log(cityStoredList);
    for (var i = 0; i < cityStoredList.length; i++) {
    var cityBtnName = cityStoredList[i];
    var addBtn = document.createElement('button');
    addBtn.textContent = cityBtnName;
    addBtn.setAttribute("class", "btn");
    addBtn.setAttribute("data-language", cityBtnName);
    cityButtonsEl.prepend(addBtn);
    console.log(addBtn);
 }
}

// () load to call saved city names
function init() {
  if (JSON.parse(localStorage.getItem("cityList")) !== null) {
    cityStoredList = JSON.parse(localStorage.getItem("cityList"));
  } else {
    localStorage.setItem("cityList", JSON.stringify([]));
  }
  renderStoredCity ()
}

// Form input function 
var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityNameEl = cityInputEl.value.trim();

  if (cityNameEl) {
    getCurrentRepo(cityNameEl);
    resultsWeather.textContent = '';
    cityInputEl.value = '';
  } else {
    alert('Please enter a city');
  }
};

// Creates new API call from saved city buttons
var buttonClickHandler = function (event) {
  var getCity = event.target.getAttribute('data-language');

  if (getCity) {
    getCurrentRepo(getCity);
    resultsWeather.textContent = '';
  }
};

// Calls API with city name query search, returns city name, long & lat to use to call next API
var getCurrentRepo = function (city) {

  var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey + "&units=imperial";

  fetch(queryURL)
    .then(function (response) {
      response.json().then(function (data) {
        var cityName = data.name;
        var currentLong = data.coord.lon;
        var currentLat = data.coord.lat;
        renderData(cityName, currentLong, currentLat);
        storeCity (cityName);
      })
    });
  
  // Calls API using long & lat to return data values for current and forecast weather data 
  var renderData = function (cityName, long, lat) {
    var queryForecastURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat +"&lon=" + long +"&exclude=minutely,hourly,alerts&appid=" + APIKey + "&units=imperial";

    fetch(queryForecastURL)
    .then(function (response) {
      response.json().then(function (forecastData) {
        var currentUnixTime  = moment.unix(forecastData.current.dt);
        var currentDate = moment(currentUnixTime).format('MM/DD/YYYY');
        var icon = forecastData.current.weather[0].icon;
        var currentTemp = forecastData.current.temp;
        var windSpeed = forecastData.current.wind_speed;
        var currentHum = forecastData.current.humidity;
        var currentUv = forecastData.current.uvi;
        var currentEl = document.createElement('div');
        currentEl.classList = 'current-container';
        currentEl.innerHTML = 
          `<h2>${cityName} ${currentDate}<img src="https://openweathermap.org/img/w/${icon}.png"></h2> `
        resultsWeather.append(currentEl);
        var currentListEl = document.createElement('ul');
        currentListEl.classList = 'current-list';
        currentListEl.innerHTML = 
          `<li>Temp: ${currentTemp} °F</li>
          <li>Wind: ${windSpeed} MPH</li>
          <li>Humidity: ${currentHum} %</li> `
      
        currentEl.append(currentListEl);

        var uvTitleEl = document.createElement('li');
        uvTitleEl.textContent = 'UV Index: ';
        var uvEl = document.createElement('span');
        uvEl.textContent = currentUv;
        var uvRate = Math.round(currentUv);

        if (uvRate >= 0 && uvRate <= 2) {
          uvEl.classList = 'uv-low';
        } else if (uvRate >= 3 && uvRate <= 5) {
          uvEl.classList = 'uv-mod';
        } else if (uvRate >= 6 && uvRate <= 7) {
          uvEl.classList = 'uv-high';
        } else {
          uvEl.classList = 'uv-very';
        } 

        uvTitleEl.appendChild(uvEl);
        currentListEl.appendChild(uvTitleEl);
        
        displayForecast(forecastData.daily)
      })
    });
  }
};

// Create 5 day forecast elements 
var displayForecast = function (repos) {
  
  var forecastTitleEl = document.createElement('div');
  forecastTitleEl.classList = 'forecast-title';
  forecastTitleEl.innerHTML =  
    `<h3>5-Day Forecast: </h3>`;
  resultsWeather.append(forecastTitleEl);

  var forecastEl = document.createElement('div');
  forecastEl.classList = 'forecast-container';
  resultsWeather.append(forecastEl);

  for (var i = 1; i < 6; i++) {
    var forDate = repos[i].temp.day;
    var forIcon = repos[i].weather[0].icon;
    var forTemp = Math.round(repos[i].temp.max);
    var forWind = repos[i].wind_speed;
    var forHumid = repos[i].humidity;
    var unixTime  = moment.unix(repos[i].dt);
    var forDate = moment(unixTime).format('MMMM Do,YYYY');
    var forecastListEl = document.createElement('div');
    forecastListEl.classList = 'forecast-item';
    forecastListEl.innerHTML =  
    `<h4>${forDate}</h4>
      <ul>
        <li><img src="https://openweathermap.org/img/w/${forIcon}.png"></li>
        <li>Temp: ${forTemp} °F</li>
        <li>Wind: ${forWind} MPH</li>
        <li>Humidity: ${forHumid} %</li>
      </ul>`;
       
      forecastEl.appendChild(forecastListEl);

    
  }
};

// Creates button with city name value
function createBtn (cityName) {
  var btnText = cityName;
  var addBtn = document.createElement('button');
  addBtn.textContent = btnText;
  addBtn.setAttribute("class", "btn");
  addBtn.setAttribute("data-language", cityName);
  cityButtonsEl.prepend(addBtn);
}
function clearButtons (){
    document.getElementById('city-buttons').innerHTML = "";
}


userFormEl.addEventListener('submit', formSubmitHandler);
cityButtonsEl.addEventListener('click', buttonClickHandler);


init();