// $("#call-bus").on("click", function() {
//     alert("hi");
// });

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

var xCoord = -87.6675;
var yCoord = 42.018185;

var geoRaw = "https://data.cityofchicago.org/resource/8mj8-j3c4.json";

function getNearestStation(xCoord, yCoord) {
    console.log("calculating nearest station...");

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
        console.log(maxDist);
        console.log(indexNum);

        console.log(response[indexNum]);
        console.log(response[indexNum].map_id);

        doWork(response[indexNum].map_id);
    });
}

function doWork(data) {
    console.log("train clicked");

    var trainQueryRaw =
        "https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=d6cb646a67d6448f8b58d7afb7ddb83c&mapid=" +
        data +
        "&max=10&outputType=JSON";

    var trainQuery = "https://cors-anywhere.herokuapp.com/" + trainQueryRaw;

    console.log(data);

    $("#train-table > tbody").empty();

    $.ajax({
        url: trainQuery,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        console.log(response.ctatt.eta);

        for (var i = 0; i < response.ctatt.eta.length; i++) {
            console.log(response.ctatt.eta[i]);

            var trainSpec = response.ctatt.eta[i];
            var route = trainSpec.rt;

            var arrTime = moment(trainSpec.arrT).format("HH:mm");
            var now = moment(trainSpec.prdt).format("HH:mm");

            // spit out: a table with
            // station name / route / direction / next arrival
            console.log(`Station: ${trainSpec.staNm}`);
            console.log(`Route: ${trainRts[route]}`);
            console.log(`Destination: ${trainSpec.destNm}`);
            console.log(`Arrival time: ${arrTime}`);

            console.log(now);
            console.log(moment(trainSpec.arrT).format("HH:mm"));

            var minToNext = moment(arrTime, "HH:mm").diff(
                moment(now, "HH:mm"),
                "minutes"
            );

            console.log(`Minutes to next train: ${minToNext}`);
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
