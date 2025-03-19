const baseUrl = "http://api.weatherapi.com/v1";
let isFahrenheit = true;
$(document).ready(() => {
   buildDropDown();
   $("#getWeather").on("click", () => {
       handleEvent();
   })
})


function selectDays() {
   handleEvent();
}


function handleEvent() {
   const locationInput = $("#locationInput").val();
   const forecastDays = $("#dropdown").val();
   if(locationInput.trim()) {
       getData(locationInput, forecastDays);
   }
   if (isFahrenheit) {
       $("#f").attr("class", "selected-unit");
       $("#c").removeAttr("class");
   } else {
       $("#c").attr("class", "selected-unit");
       $("#f").removeAttr("class");
   }
}


let getData = function (zip, forecastDays) {
   $.ajax({
       url: baseUrl + "/forecast.json",
       method: "GET",
       data: {
           key: "bc6252b2fac1434d90d32206250301",
           q: zip,
           days: forecastDays
       },
       success: handleSuccess,
       error: () => {
           console.log("There was an error")
       }
   })
}


function handleSuccess(data) {
   $("#currentWeather").removeAttr('style');
   $("#forecast").removeAttr('style');
   handleCurrent(data);
   handleForecast(data);
}


function handleCurrent(weatherData) {
   const temp = isFahrenheit ? weatherData.current.temp_f + " &deg;F" : weatherData.current.temp_c + " &deg;C"
   $("#temp").html(temp);
   $("#cityName").text(weatherData.location.name + ", " + weatherData.location.region);
   $("#condition").text(weatherData.current.condition.text);
   $("#icon").attr("src", "https:" + weatherData.current.condition.icon);
   $("#icon").attr("alt", weatherData.current.condition.text);
}


function handleForecast(weatherData) {
   let arrayOfDays = weatherData.forecast.forecastday;
   $("#forecast").html("<h3>Forecast</h3>");
   for (let i in arrayOfDays) {
       const date = arrayOfDays[i].date;
       const temp = isFahrenheit ? arrayOfDays[i].day.avgtemp_f + " &deg;F" : arrayOfDays[i].day.avgtemp_c + " &deg;C";
       const icon = "https:" + arrayOfDays[i].day.condition.icon;
       const condition = arrayOfDays[i].day.condition.text;
       $("#forecast").append(`<div id='date'>
               <span> ${date}</span>
               <div class="img-wrapper"><img src="${icon}"></div>
               <span id='temp'> ${temp} </span>
                <span ${condition.length < 15 ? 'style="line-height: 3.2"': ""}> ${condition}</span>

               </div>`);
       $("#avgTemp").text(arrayOfDays[i])
   }
}


function buildDropDown() {
   for (let i = 1; i < 15; i++) {
       if (i === 7){
           $("#dropdown").append(`
       <option value="${i}" selected> ${i}</option>`)
       } else {
           $("#dropdown").append(`
       <option value="${i}"> ${i}</option>`)
       }
   }
}


function updateUnit(flag) {
   isFahrenheit = flag;
   handleEvent();
}
