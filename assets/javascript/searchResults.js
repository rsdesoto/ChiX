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

$(document).on("change", ".drop", function() {
    query = $(this).val();
});
database.ref().once("value", function(snapshot) {
    address = snapshot.val().location.address;
    query = snapshot.val().query.query;
    $.ajax({
        async: false,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
        method: "GET"
    }).then(function(response) {
        searchLat = response.results[0].geometry.location.lat;
        searchLng = response.results[0].geometry.location.lng;
        $.ajax({
            async: false,
            url: `https://api.foursquare.com/v2/venues/search?client_id=XLARRNIFOXVD2CYYWZTPLXOXPI3BFBECOJTZEVZAI0OCO01S&client_secret=TNAAYAFVDDSPVDK1RTGIW2VPZTBKCOAVYVXSYEBBU2MXF015&v=20180323&query=${query}&limit=30&ll=${searchLat},${searchLng}`,
            method: "GET"
        }).then(function(response) {
            let totalResults = 10;
            for (let i = 0; i < totalResults; i++) {
                if (response.response.venues[i].location.address) {
                    resultsName.push(response.response.venues[i].name);
                    resultsLat.push(response.response.venues[i].location.lat);
                    resultsLng.push(response.response.venues[i].location.lng);
                    resultsAddress.push(response.response.venues[i].location.address.replace(/ /g, '+'));
                    resultsId.push(response.response.venues[i].id);
                } else {
                    totalResults++;
                }
            }
            $("body").append(
                $(
                    '<script id="appendedScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCYgcY03FvjLBqaWUGRt-PyD8soS3aAvyA&callback=initMap"type="text/javascript"></script>'
                )
            );
            //https://www.html5rocks.com/en/tutorials/speed/script-loading/ idea for the above statement
            //the script is appended to the body and runs when this occurs
        });
        getNearestStation(searchLng, searchLat);
    });
});

$(document).on("click", "#searchLocation", function() {
    event.preventDefault();
    address = $("#location").val();
    resultsName = [];
    resultsLat = [];
    resultsLng = [];
    resultsAddress = [];
    resultsId = [];
    $.ajax({
        async: false,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
        method: "GET"
    }).then(function(response) {
        searchLat = response.results[0].geometry.location.lat;
        searchLng = response.results[0].geometry.location.lng;

        $.ajax({
            async: false,
            url: `https://api.foursquare.com/v2/venues/search?client_id=XLARRNIFOXVD2CYYWZTPLXOXPI3BFBECOJTZEVZAI0OCO01S&client_secret=TNAAYAFVDDSPVDK1RTGIW2VPZTBKCOAVYVXSYEBBU2MXF015&v=20180323&query=${query}&limit=30&ll=${searchLat},${searchLng}`,
            method: "GET"
        }).then(function(response) {
            let totalResults = 10;
            for (let i = 0; i < totalResults; i++) {
                if (response.response.venues[i].location.address) {
                    resultsName.push(response.response.venues[i].name);
                    resultsLat.push(response.response.venues[i].location.lat);
                    resultsLng.push(response.response.venues[i].location.lng);
                    resultsAddress.push(response.response.venues[i].location.address.replace(/ /g, '+'));
                    resultsId.push(response.response.venues[i].id);
                } else {
                    totalResults++;
                }
            }
            getNearestStation(searchLng, searchLat);
            $("#appendedScript").remove();
            $("body").append(
                $(
                    '<script id="appendedScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCYgcY03FvjLBqaWUGRt-PyD8soS3aAvyA&callback=initMap"type="text/javascript"></script>'
                )
            );
        });
    });

    function clearMarkers() {
        for (let i = 0; i < markerArr[i].length; i++) {
            markerArr[i].setMap(null);
            //existing markers are set to null will still show if not
        }
        markerArr = []; //markers are removed
    }

    clearMarkers();
    $("ol").remove();
    $("#listHolder").append($("<ol>"));
    // for (let i = 0; i < resultsLat.length; i++) {
    //     console.log('mp');
    //     let latlng = { lat: resultsLat[i], lng: resultsLng[i] };
    //     let marker = new google.maps.Marker({
    //         position: latlng,
    //         label: `${i + 1}`,
    //         map: map
    //     });
    //     console.log('hey');
    //     $("ol").append($(`<a href='${resultsAddress[i]}'><li>${resultsName[i]}</li></a>`));
    //     console.log(resultsAddress[i]);
    // }
    for (let i = 0; i < resultsLat.length; i++) {
        markerArr[i].setMap(map);
    }
});

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

        let marker = new google.maps.Marker({
            position: latlng,
            label: `${i + 1}`,
            map: map
        });
        markerArr.push(marker);
        $("#listHolder ol").append($(`<li>${resultsName[i]}<ul><li><a id='directionsLink' href='https://www.google.com/maps/place/${resultsAddress[i]}'>Directions</a></li><li><a id='fourSquareLink' href='https://foursquare.com/v/${resultsId[i]}'>FOURSQUARE</a></li></ul></li>`));
}
    for (let i = 0; i < resultsLat.length; i++) {
        markerArr[i].setMap(map);
    }
}

var trainRts = {
    Red: "Red Line",
    P: "Purple Line",
    Y: "Yellow Line",
    Blue: "Blue Line",
    Pink: "Pink Line",
    G: "Green Line",
    Org: "Orange Line",
    Brn: "Brown Line"
};

var geoRaw = "https://data.cityofchicago.org/resource/8mj8-j3c4.json";

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

            // spit out: a table with
            // station name / route / direction / next arrival

            var minToNext = moment(arrTime, "HH:mm").diff(
                moment(now, "HH:mm"),
                "minutes"
            );

            // console.log(moment().diff(trainSpec.arrT), "minutes");

            // do this for all the things in the array

            // will need to transfer from arrT yyyyMMdd HH:mm:ss to get number of minutes

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
