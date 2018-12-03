var config = {
    apiKey: "AIzaSyAvoJGskFxZY8Oiliznle8TsSoZW6CtXfk",
    authDomain: "project-1-f1548.firebaseapp.com",
    databaseURL: "https://project-1-f1548.firebaseio.com",
    projectId: "project-1-f1548",
    storageBucket: "project-1-f1548.appspot.com",
    messagingSenderId: "448339803825"
  };
  firebase.initializeApp(config);
  
  var database = firebase.database();
  var firebaseQuery = database.ref('/query');
  var firebaseLocation = database.ref('/location');
  var theKey;
  
  $(document).on('click', '#searchLocation', function() {
    theKey = database.ref().push({
      address: $('#location').val(),
      query: $('#selector').val()
    }).key
    localStorage.setItem('userKey', theKey);
  });


