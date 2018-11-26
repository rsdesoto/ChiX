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
let lat;
let lng;
let address;

database.ref('/location').once('value', function(snapshot) {
  address = snapshot.val().address;
  console.log(snapshot.val().address);
})
$.ajax({
  async: false,
  url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyA_8m3vV01mZAdSvesbW3G2rkoHLW4WP2s`,
  method: 'GET',
}).then(function(response) {
  console.log(response);
  lat = response.results[0].geometry.location.lat;
  lng = response.results[0].geometry.location.lng;
});

function initMap() {   //this functional has to match final call
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: lat, lng: lng},
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
}