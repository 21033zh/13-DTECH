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
    storageBucket: "dollplanet-947ae.firebasestorage.app",
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
function openHamburger() {
  var overlay = document.getElementById("hb_darkOverlay");
  document.getElementById('myLinks').classList.add('hamburgerIn');
  document.getElementById('myLinks').classList.remove('hamburgerOut');
  document.getElementById('myLinks').classList.remove('hamburgerNeutral');
  document.body.style.overflow = 'hidden';
  overlay.style.display = 'block'
}

function closeHamburger() {
  var overlay = document.getElementById("hb_darkOverlay");
  document.getElementById('myLinks').classList.add('hamburgerOut');
  document.getElementById('myLinks').classList.remove('hamburgerIn');
  document.body.style.overflow = 'scroll';
  overlay.style.display = 'none'
}

function openSearch() {
  var overlay = document.getElementById("search_darkOverlay");
  document.body.style.overflow = 'hidden';
  document.getElementById('mobile_div_search').classList.add('searchIn');
  document.getElementById('mobile_div_search').classList.remove('searchOut');
  document.getElementById('mobile_div_search').classList.remove('searchNeutral');
  overlay.style.display = 'block'
}

function closeSearch() {
  var overlay = document.getElementById("search_darkOverlay");
  document.body.style.overflow = 'scroll';
  document.getElementById('mobile_div_search').classList.add('searchOut');
  document.getElementById('mobile_div_search').classList.remove('searchIn');
  overlay.style.display = 'none'
}