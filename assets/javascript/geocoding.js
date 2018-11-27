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

$("#call-geocode").on("click", function() {
    console.log("geo clicked");

    // www.ctabustracker.com/bustime/api/v2/getpredictions?key=89dj2he89d8j3j3ksjhdue93j&rt=20&stpid=456

    var geoRaw = "https://data.cityofchicago.org/resource/8mj8-j3c4.json";

    // var busQuery = "https://cors-anywhere.herokuapp.com/" + busQueryRaw;

    $.ajax({
        url: geoRaw,
        method: "GET"
    }).then(function(response) {
        console.log(response);

        console.log(response[0].location.coordinates);

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

            console.log(distChk);

            if (distChk < maxDist) {
                maxDist = distChk;
                indexNum = i;
            }
        }
        console.log(maxDist);
        console.log(indexNum);

        console.log(response[indexNum]);
        console.log(response[indexNum].map_id);
    });
});
