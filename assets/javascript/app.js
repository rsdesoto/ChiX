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
  let firebaseQuery = database.ref('/query');
  let firebaseLocation = database.ref('/location');

  $(document).on("change", ".drop", function() {
    firebaseQuery.set({
      query: $(this).val()
    })
});
  
  $(document).on('click', '#searchLocation', function() {
    firebaseLocation.set({
      address: $('#location').val(),
    });
  });
