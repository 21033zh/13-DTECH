var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      var user = authResult.user;
      var isNewUser = authResult.additionalUserInfo.isNewUser;

      if (isNewUser && user && user.uid) {
        const displayName = user.displayName || "Unnamed User";
        const nameArray = displayName.split(" ");
        const firstName = nameArray[0] || "";
        const lastName = nameArray[1] || "";

        console.log("Saving new user:", user.uid, user.email, displayName);

        // Save user info in Realtime Database
        return firebase
          .database()
          .ref("/accounts/" + user.uid)
          .set({
            email: user.email,
            firstName,
            lastName,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
          })
          .then(() => {
            return true;
          })
          .catch((error) => {
            console.error("❌ Failed to save new user data:", error);
            alert("There was an error creating your account. Please try again.");
            return false;
          });
      } else {
        // Existing user → just redirect
        console.log("Existing user login:", user.uid, user.email);
        window.location.href = "account.html";
        return false;
      }
    },
    signInFailure: function (error) {
      console.error("Sign-in failure:", error);
      return handleUIError(error);
    },
    uiShown: function () {
      console.log("FirebaseUI widget shown");
    },
  },

  queryParameterForSignInSuccessUrl: "signInSuccessUrl",
  signInFlow: "popup",

  signInSuccessUrl: "account.html",

  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, // ✅ FIXED
      requireDisplayName: true,
    },
  ],

  tosUrl: "https://dollplanet-947ae.web.app/about/termsandconditions.html",
  privacyPolicyUrl: function () {
    window.location.assign("https://dollplanet-947ae.web.app/about/privacypolicy.html");
  },
};

// Initialize FirebaseUI
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start("#firebaseui-auth-container", uiConfig);

// Helpers
function signIn() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log("✅ User is signed in:", user);
    } else {
      console.log("ℹ️ User is signed out.");
    }
  });
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("✅ Sign-out successful");
    })
    .catch((error) => {
      console.error("❌ Sign-out error:", error);
    });
}