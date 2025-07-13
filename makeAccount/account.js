function checkSignIn() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log('user logged in');
            populateAccountInfo(user.uid);
        } else {
            // User is signed out.
            console.log("user signed out")
            window.location="makeAccount.html"
        }
    });
}

function populateAccountInfo(uid) {
    firebase.database().ref('/accounts/' + uid).once('value', function(snapshot) {
        var accountInfo = snapshot.val();
        document.getElementById("p_welcomeName").innerHTML = accountInfo.firstName;
        document.getElementById("p_firstName").innerHTML = accountInfo.firstName;
        document.getElementById("p_lastName").innerHTML = accountInfo.lastName;
        document.getElementById("p_email").innerHTML = accountInfo.email;
    });
}

function editFirstName() {
    const oldValue = document.getElementById("p_firstName").innerText;
    console.log(oldValue)
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldValue;
    input.style.width = "100%";

    var name = document.getElementById("p_firstName");
    name.innerHTML = '';
    name.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => saveEdit(input.value));
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            saveEdit(input.value);
        }
    });

    function saveEdit(newValue) {
        if (newValue === oldValue) {
            cell.innerText = oldValue; // No change
            return;
        }
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in.
                var uid = user.uid
                firebase.database().ref(`/accounts/`+uid+'/firstName/').set(newValue)
                .then(() => {
                    name.innerText = newValue;
                })
                .catch((error) => {
                    console.error("Failed to update field:", error);
                    name.innerText = oldValue;
                });
            } else {
                // User is signed out.
                console.log("user signed out")
                window.location="makeAccount.html"
            }
        });
        
    }
}

function signOut() {
    firebase.auth().signOut()
    console.log('signed out')
}