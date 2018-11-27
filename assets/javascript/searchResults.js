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
let address = 'Chicago, Illinois';  //in case error occurs
let resultsName = [];
let resultsLat = [];
let resultsLng = [];
let query = 'coffee';

database.ref('/location').once('value', function(snapshot) {
    address = snapshot.val().address;//the last line of the search results html happens before this so an error occurs
    $.ajax({
        async: false,
        url: `https://api.foursquare.com/v2/venues/search?client_id=XLARRNIFOXVD2CYYWZTPLXOXPI3BFBECOJTZEVZAI0OCO01S&client_secret=TNAAYAFVDDSPVDK1RTGIW2VPZTBKCOAVYVXSYEBBU2MXF015&v=20180323&query=${query}&limit=30&near=${address}`,
        method: 'GET'
    }).then(function(response) {
        for (let i = 0; i < 20; i++) {
            resultsName.push(response.response.venues[i].name);
            resultsLat.push(response.response.venues[i].location.lat);
            resultsLng.push(response.response.venues[i].location.lng);
        }
    });
    $.ajax({
        async: false,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
        method: 'GET',
    }).then(function(response) {
        searchLat = response.results[0].geometry.location.lat;
        searchLng = response.results[0].geometry.location.lng;
        $('body').append($('<script id="appendedScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCYgcY03FvjLBqaWUGRt-PyD8soS3aAvyA&callback=initMap"type="text/javascript"></script>'));
        //https://www.html5rocks.com/en/tutorials/speed/script-loading/ idea for the above statement
    });
});

$(document).on('click', '#searchLocation', function() {
    event.preventDefault();
    address = $('#location').val();
    $.ajax({
        url: `https://api.foursquare.com/v2/venues/search?client_id=XLARRNIFOXVD2CYYWZTPLXOXPI3BFBECOJTZEVZAI0OCO01S&client_secret=TNAAYAFVDDSPVDK1RTGIW2VPZTBKCOAVYVXSYEBBU2MXF015&v=20180323&query=${query}&limit=30&near=${address}`,
        method: 'GET'
    }).then(function(response) {
        for (let i = 0; i < 20; i++) {
            resultsName.push(response.response.venues[i].name);
            resultsLat.push(response.response.venues[i].location.lat);
            resultsLng.push(response.response.venues[i].location.lng);
        }
    });
    $.ajax({
        async: false,
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
        method: 'GET',
    }).then(function(response) {
        searchLat = response.results[0].geometry.location.lat;
        searchLng = response.results[0].geometry.location.lng;
        $('#appendedScript').remove();
        $('body').append($('<script id="appendedScript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCYgcY03FvjLBqaWUGRt-PyD8soS3aAvyA&callback=initMap"type="text/javascript"></script>'));
    });
  });

function initMap() {   //this functional has to match final call
  let map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: searchLat, lng: searchLng},
    zoom: 15,
    zoomControl: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_CENTER
    },
    streetViewControl: true,
    fullScreenControl: true
  });
  for (let i = 0; i < 20; i++) {
        let latlng = {lat: resultsLat[i], lng: resultsLng[i]}
        let marker = new google.maps.Marker({
        position: latlng,
        label: `${i + 1}`,
        map: map
        });
        marker.setMap(map);
        $('ol').append($(`<li>${resultsName[i]}</li>`))
    }
};