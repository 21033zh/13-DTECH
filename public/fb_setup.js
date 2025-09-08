console.log('%c fb_setup.js \n---------------',
  'color: blue; background-color: white;');

var database;

/**************************************************************/
// fb_initialise()
// Initialize firebase, connect to the Firebase project.
// 
// Find the config data in the Firebase consol. Cog wheel > Project Settings > General > Your Apps > SDK setup and configuration > Config
//
// Input:  n/a
// Return: n/a
/**************************************************************/
function fb_initialise() {  
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAuHU1WCDDz3HiEgNLWEPDV7OJ49x2UTEA",
    authDomain: "dollplanet-947ae.firebaseapp.com",
    databaseURL: "https://dollplanet-947ae-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dollplanet-947ae",
    storageBucket: "dollplanet-947ae.appspot.com",
    messagingSenderId: "1065600108437",
    appId: "1:1065600108437:web:8321564e5befcc93b6189c",
    measurementId: "G-2YKH4VTNY4"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // This log prints the firebase object to the console to show that it is working.
  // As soon as you have the script working, delete this log.
  console.log(firebase);	
}

fb_initialise();

/* Toggle between showing and hiding the navigation menu links when the user clicks on the hamburger menu / bar icon */
