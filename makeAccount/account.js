function checkSignIn() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log("User is signed in:", user);
            const displayNameArray = user.displayName.split(" ");
            const firstName = displayNameArray[0];
            const lastName = displayNameArray[1];
            const email = user.email;
            document.getElementById("p_welcomeName").innerHTML = firstName;
            populateAccountInfo(firstName, lastName, email);
        } else {
            // User is signed out.
            console.log("user signed out")
            window.location="makeAccount.html"
        }
    });
}

function populateAccountInfo(firstName, lastName, email) {
    document.getElementById("p_firstName").innerHTML = firstName;
    document.getElementById("p_lastName").innerHTML = lastName;
    document.getElementById("p_email").innerHTML = email;
}

function signOut() {
    firebase.auth().signOut()
    console.log('signed out')
}