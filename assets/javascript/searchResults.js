/** About This App --
 *
 * This takes a location search + a class of thing to search for and generates the following:
 *      - current weather and predicted weather
 *      - list of attractions near the location
 *      - map of the location with pins for attractions
 *      - the closest CTA train stop and up to 10 next arriving trains
 *
 * The majority of functionality is based from hitting the "searchLocation" button. This updates all
 * of the page.
 */

/** **************************************************************************************** */
/** firebase link and initialization */
/** **************************************************************************************** */

var config = {
    apiKey: "AIzaSyAvoJGskFxZY8Oiliznle8TsSoZW6CtXfk",
    authDomain: "project-1-f1548.firebaseapp.com",
    databaseURL: "https://project-1-f1548.firebaseio.com",
    projectId: "project-1-f1548",
    storageBucket: "project-1-f1548.appspot.com",
    messagingSenderId: "448339803825"
};
firebase.initializeApp(config);

let database = firebase.database();

/** **************************************************************************************** */
/** Global variables */
/** **************************************************************************************** */

let searchLat;
let searchLng;
let address;
let resultsName = [];
let resultsLat = [];
let resultsLng = [];
let query;
let markerArr = [];
let resultsAddress = [];
let resultsId = [];

/** API for CTA stations */
let geoRaw = "https://data.cityofchicago.org/resource/8mj8-j3c4.json";

/** object for moving from the CTA's abbreviations to the full name of each CTA line */
let trainRts = {
    Red: "Red Line",
    P: "Purple Line",
    Y: "Yellow Line",
    Blue: "Blue Line",
    Pink: "Pink Line",
    G: "Green Line",
    Org: "Orange Line",
    Brn: "Brown Line"
};

/** **************************************************************************************** */
/** Functions */
/** **************************************************************************************** */

/**
 * Clear markers from the Google map. Used for each gmaps/FOURSQUARE query to remove previous search pins.
 */
function clearMarkers() {
    for (let i = 0; i < markerArr[i].length; i++) {
        markerArr[i].setMap(null);
        //existing markers are set to null will still show if not
    }
    markerArr = []; //markers are removed
}

/**
 * Once the list of near locations has been pulled from FOURSQUARE, output into a nice looking, well-formatted list.
 * @param {array} response - the results from the FOURSQUARE query
 */
const printResults = response => {
    for (let i = 0; i < response.response.groups[0].items.length; i++) {
        if (response.response.groups[0].items[i].venue.location.address) {
            resultsName.push(response.response.groups[0].items[i].venue.name);
            resultsLat.push(
                response.response.groups[0].items[i].venue.location.lat
            );
            resultsLng.push(
                response.response.groups[0].items[i].venue.location.lng
            );
            resultsAddress.push(
                response.response.groups[0].items[
                    i
                ].venue.location.address.replace(/ /g, "+")
            );
            resultsId.push(response.response.groups[0].items[i].venue.id);
        }
    }
};

/** Initialize the map information
 *
 * Using the latitude and longitude from firebase, this sets the map on those coordinates and sets the zoom.
 * This also pushes the results from the FOURSQUARE query into a list that is displayed next to the map.
 *
 * This gets called as part of the Google maps API.
 */
function initMap() {
    //this functional has to match final call
    let map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: searchLat, lng: searchLng },
        zoom: 15,
        zoomControl: true,
        mapTypeControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_CENTER
        },
        streetViewControl: true,
        fullScreenControl: true
    });
    $("#listHolder ol").empty();
    for (let i = 0; i < resultsLat.length; i++) {
        let latlng = { lat: resultsLat[i], lng: resultsLng[i] };
        console.log("in");
        let marker = new google.maps.Marker({
            position: latlng,
            label: `${i + 1}`,
            map: map
        });
        markerArr.push(marker);
        $("#listHolder ol").append(
            $(
                `<li class="list-group-item">${i + 1}) ${
                    resultsName[i]
                }<ul><li><a id='directionsLink' href='https://www.google.com/maps/place/${
                    resultsAddress[i]
                }'>Directions</a></li><li><a id='fourSquareLink' href='https://foursquare.com/v/${
                    resultsId[i]
                }'>FOURSQUARE</a></li></ul></li>`
            )
        );
    }
    for (let i = 0; i < resultsLat.length; i++) {
        markerArr[i].setMap(map);
    }
}

/**
 * Calculates the nearest CTA station ID from a location, based on the location's latitude and longitude.
 *
 * This pulls in the full list of CTA stations from an AJAX call to the City of Chicago databases and
 * compares each's longitude and latitude to the desired location's latitude and longitude. Once the
 * closest set of coordinates has been found, this function passes the station ID into a query to the
 * CTA train tracker API.
 *
 * Note: this pulls the MAP_ID of the object returned by the City of Chicago L train API - to find
 * specific routes through a single station (ex. northbound at Belmont), use the station ID instead.
 *
 * @param {float} xCoord - the x coordinate of the location
 * @param {float} yCoord - the y coordinate of the location
 * @return {string} response[indexNum].map_id - the ID of the station that is closest
 */
function getNearestStation(xCoord, yCoord) {
    $.ajax({
        url: geoRaw,
        method: "GET"
    }).then(function(response) {
        var maxDist;
        var indexNum;

        maxDist = 100000;
        indexNum = 0;

        for (var i = 0; i < response.length; i++) {
            var newX = response[i].location.coordinates[0];
            var newY = response[i].location.coordinates[1];

            var distChk = Math.pow(
                Math.pow(newX - xCoord, 2) + Math.pow(newY - yCoord, 2),
                0.5
            );

            if (distChk < maxDist) {
                maxDist = distChk;
                indexNum = i;
            }
        }

        trainInfoGet(response[indexNum].map_id);
    });
}

/**
 * Queries the CTA train tracker API for an individual station. The previous information from the train tracker
 * gets cleared out and a new table is generated and displayed in the app.
 *
 * @param {string} data - this is the ID of the individual overall station that is being checked. This is passed in through the
 * 'getNearestStation' function.
 */
function trainInfoGet(data) {
    var trainQueryRaw =
        "https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=d6cb646a67d6448f8b58d7afb7ddb83c&mapid=" +
        data +
        "&max=10&outputType=JSON";

    var trainQuery = "https://cors-anywhere.herokuapp.com/" + trainQueryRaw;

    $("#train-table > tbody").empty();

    $.ajax({
        url: trainQuery,
        method: "GET"
    }).then(function(response) {
        for (var i = 0; i < response.ctatt.eta.length; i++) {
            var trainSpec = response.ctatt.eta[i];
            var route = trainSpec.rt;

            var arrTime = moment(trainSpec.arrT).format("HH:mm");
            var now = moment(trainSpec.prdt).format("HH:mm");

            var minToNext = moment(arrTime, "HH:mm").diff(
                moment(now, "HH:mm"),
                "minutes"
            );

            var newRow = $("<tr>").append(
                $("<td>").text(trainSpec.staNm),
                $("<td>").text(trainRts[route]),
                $("<td>").text(trainSpec.destNm),
                $("<td>").text(arrTime),
                $("<td>").text(minToNext)
            );

            $("#train-table > tbody").append(newRow);
        }
    });
}

/**
 * Queries the openweather APIs
 *
 * First, generate the information for the current temperature, wind, and weather description.
 *
 * Second, query the forecasted information. For each item in the response list, switch the time from UTC to Central time.
 * Output this information into the predicted weather table.
 *
 * Finally, update the current date
 */
function UpdateWeather() {
    var weatherQueryRaw1 =
        "api.openweathermap.org/data/2.5/weather?lat=41.8951430959825&lon=-87.62266159057619&units=imperial&APPID=91266e16eedc61cbd17d79ee410ef801";
    var weatherQuery1 =
        "https://cors-anywhere.herokuapp.com/" + weatherQueryRaw1;

    var weatherQueryRaw =
        "api.openweathermap.org/data/2.5/forecast?lat=41.8951430959825&lon=-87.62266159057619&units=imperial&APPID=91266e16eedc61cbd17d79ee410ef801";

    var weatherQuery = "https://cors-anywhere.herokuapp.com/" + weatherQueryRaw;

    $(".City").html("<h1> Current " + weather.city.name + " Weather</h1>");

    $.ajax({
        url: weatherQuery1,
        method: "GET"
    }).then(function(response) {
        $("#currentTemp").text(response.main.temp);
        $("#currentWind").text(response.wind.speed);
        $("#currentOutlook").text(response.weather[0].description);
    });

    $.ajax({
        url: weatherQuery,
        method: "GET"
    }).then(function(response) {
        var weatherList = response.list;
        var weather = response;

        weatherList.forEach(timeFrame => {
            var time = moment
                .utc(timeFrame.dt_txt)
                .tz("America/Chicago")
                .format("llll");
            var weatherDiv = $("<tr>");
            var timeData = $("<td>").text(time);
            var tempMax = $("<td>").text(timeFrame.main.temp_max);
            var tempMin = $("<td>").text(timeFrame.main.temp_min);
            var wind = $("<td>").text(timeFrame.wind.speed);
            var outlook = $("<td>").text(timeFrame.weather[0].description);

            weatherDiv.append(timeData);
            weatherDiv.append(tempMax);
            weatherDiv.append(tempMin);
            weatherDiv.append(wind);
            weatherDiv.append(outlook);
            console.log(weatherDiv);
            $(".js-data-append").append(weatherDiv);
        });
    });
}

/** **************************************************************************************** */
/** Onclick and response events */
/** **************************************************************************************** */

/**
 * Toggles the collapsible dropdowns for current and predicted weather information.
 */
$(".collapsible").on("click", function(e) {
    e.preventDefault();
    $(this).toggleClass("active");
});

/**
 * Initializes the search results page upon page load.
 *
 * First, pull data from the firebase database in order to fill in the address and type of location being searched for.
 * Using that information, query Google Maps and FOURSQUARE to generate the map display, list of nearby locations,
 * and create pins on the map.
 *
 * This also calls getNearestStation and UpdateWeather in order to generate train and weather information
 */
database.ref().once("value", function(snapshot) {
    address = snapshot.val().location.address;
    query = snapshot.val().query.query;
    $("#queryType").html(`${query} nearby`);
    $("#currentDate").text(moment().format("llll"));
    $.ajax({
        async: false,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
        method: "GET"
    }).then(function(response) {
        searchLat = response.results[0].geometry.location.lat;
        searchLng = response.results[0].geometry.location.lng;
        $.ajax({
            async: false,
            url: `https://api.foursquare.com/v2/venues/explore?client_id=XLARRNIFOXVD2CYYWZTPLXOXPI3BFBECOJTZEVZAI0OCO01S&client_secret=TNAAYAFVDDSPVDK1RTGIW2VPZTBKCOAVYVXSYEBBU2MXF015&v=20180323&section=${query}&limit=30&ll=${searchLat},${searchLng}`,
            method: "GET"
        }).then(function(response) {
            printResults(response);
            $("body").append(
                $(
                    '<script id="appendedScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCYgcY03FvjLBqaWUGRt-PyD8soS3aAvyA&callback=initMap"type="text/javascript"></script>'
                )
            );
        });
        getNearestStation(searchLng, searchLat);
        UpdateWeather();
    });
});

/**
 * Updates the map, weather, and train information upon searching for a new address or type of location.
 *
 * Bring in the information entered into the search bar and event dropdown and push this information to the
 * firebase database. Then, once firebase has been updated, update the Google map, FOURSQUARE results, clear markers, and
 * set markers.
 */
$(document).on("click", "#searchLocation", function() {
    event.preventDefault();
    address = $("#location").val();
    resultsName = [];
    resultsLat = [];
    resultsLng = [];
    resultsAddress = [];
    resultsId = [];
    query = $("#selector").val();
    database.ref("/query").set({
        query: query
    });

    $("#currentDate").text(moment().format("llll"));

    $("#queryType").html(`${query} nearby`);

    $.ajax({
        async: false,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
        method: "GET"
    }).then(function(response) {
        searchLat = response.results[0].geometry.location.lat;
        searchLng = response.results[0].geometry.location.lng;

        $.ajax({
            async: false,
            url: `https://api.foursquare.com/v2/venues/explore?client_id=XLARRNIFOXVD2CYYWZTPLXOXPI3BFBECOJTZEVZAI0OCO01S&client_secret=TNAAYAFVDDSPVDK1RTGIW2VPZTBKCOAVYVXSYEBBU2MXF015&v=20180323&section=${query}&limit=30&ll=${searchLat},${searchLng}`,
            method: "GET"
        }).then(function(response) {
            printResults(response);
            getNearestStation(searchLng, searchLat);
            UpdateWeather();
            $("#appendedScript").remove();
            $("body").append(
                $(
                    '<script id="appendedScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCYgcY03FvjLBqaWUGRt-PyD8soS3aAvyA&callback=initMap"type="text/javascript"></script>'
                )
            );
        });
    });

    clearMarkers();

    $("ol").remove();
    $("#listHolder").append($("<ol>"));
    for (let i = 0; i < resultsLat.length; i++) {
        markerArr[i].setMap(map);
    }
});
