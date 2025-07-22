var uiConfig = {
  callbacks: {

    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      var user = authResult.user;
      var isNewUser = authResult.additionalUserInfo.isNewUser;
    
      if (isNewUser && user && user.uid) {
        const displayName = user.displayName || "Unnamed User";
        const nameArray = displayName.split(" ");
        const firstName = nameArray[0];
        const lastName = nameArray[1];

        return firebase.database().ref("/accounts/" + user.uid).set({
          email: user.email,
          firstName,
          lastName,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          // Only redirect *after* the write is successful
          window.location.href = "account.html";
          return false;
        }).catch((error) => {
          console.error("Failed to save new user data:", error);
          alert("There was an error creating your account. Please try again.");
          return false;
        });
      } else {
        // Existing user — redirect immediately
        window.location.href = "account.html";
        return false;
      }
    },
      signInFailure: function(error) {
        // Some unrecoverable error occurred during sign-in.
        // Return a promise when error handling is completed and FirebaseUI
        // will reset, clearing any UI. This commonly occurs for error code
        // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
        // occurs. Check below for more details on this.
        return handleUIError(error);
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
      }
    },
  queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
  signInFlow: 'popup',
  
signInOptions: [
  // Leave the lines as is for the providers you want to offer your users.
  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  {
      provider: firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
      requireDisplayName: true // This ensures FirebaseUI asks for user's name during sign-up
  },
  firebase.auth.PhoneAuthProvider.PROVIDER_ID,
  firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
],

// tosUrl and privacyPolicyUrl accept either url string or a callback
// function.
// Terms of service url/callback.
tosUrl: '<your-tos-url>',
// Privacy policy url/callback.
privacyPolicyUrl: function() {
  window.location.assign('<your-privacy-policy-url>');
}
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);


function signIn() {
  firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          // User is signed in.
          console.log("User is signed in:", user);
      } else {
          // User is signed out.
          console.log("User is signed out.");
      }
  });
}

function signOut() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
}
