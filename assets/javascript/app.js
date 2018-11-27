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

$("#call-bus").on("click", function() {
    console.log("bus clicked");

    // www.ctabustracker.com/bustime/api/v2/getpredictions?key=89dj2he89d8j3j3ksjhdue93j&rt=20&stpid=456

    var busQueryRaw =
        "http://www.ctabustracker.com/bustime/api/v2/getpredictions?key=wWQ4JAdnwBj4C63S9zsYLR8Me&stpid=1856&format=json";

    var busQuery = "https://cors-anywhere.herokuapp.com/" + busQueryRaw;

    $.ajax({
        url: busQuery,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        console.log(response["bustime-response"].prd);

        var busSpec = response["bustime-response"].prd[0];

        // get:
        // stop name / route / direction / time arrival

        console.log(busSpec.stpnm);
        console.log(busSpec.rt);
        console.log(busSpec.rtdir);
        console.log(busSpec.prdtm);

        // "20181126 17:44"

        var arrTime = moment(busSpec.prdtm, "YYYYMMDD HH:mm").format("HH:mm");

        console.log(arrTime);
        var now = moment(busSpec.tmstmp, "YYYYMMDD HH:mm").format("HH:mm");
        var minToNext = moment(arrTime, "HH:mm").diff(
            moment(now, "HH:mm"),
            "minutes"
        );

        console.log(minToNext);
    });
});

$("#call-train").on("click", function() {
    console.log("train clicked");

    var trainQueryRaw =
        "https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=d6cb646a67d6448f8b58d7afb7ddb83c&mapid=41190&max=10&outputType=JSON";

    var trainQuery = "https://cors-anywhere.herokuapp.com/" + trainQueryRaw;

    $.ajax({
        url: trainQuery,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        console.log(response.ctatt.eta);

        console.log(response.ctatt.eta[0]);

        var trainSpec = response.ctatt.eta[0];
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
    });
});

// for the time being - get the stop-specific information
